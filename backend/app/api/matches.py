from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from loguru import logger

from app.database import get_db, SessionLocal
from app.db.crud import MatchCRUD, StrategyCRUD
from app.db import models
from app.models.match import Match, MatchConfig, MatchStatus
from app.core.match_engine import MatchEngine
from app.core.market_data import MarketDataGenerator, CoinGeckoFetcher

router = APIRouter()


class RunMatchRequest(BaseModel):
    """运行比赛请求"""
    strategy_ids: List[str] = Field(..., min_length=2, max_length=10)
    market_type: str = Field(default="random", pattern="^(random|trending|ranging)$")
    market_source: str = Field(default="simulated", pattern="^(simulated|coingecko_historical|coingecko_realtime)$")
    coin_id: str = Field(default="ethereum")
    duration_steps: int = Field(default=100, ge=10, le=500)
    initial_capital: float = Field(default=10000.0, ge=1000, le=1000000)


# ==================== 后台执行函数 ====================

async def _run_match_job(
    match_id: str,
    request: RunMatchRequest,
    pydantic_strategies: list,
):
    """后台异步执行比赛（在请求返回后运行）"""
    db = SessionLocal()
    try:
        MatchCRUD.update_status(db, match_id, "running")

        # 生成市场数据
        logger.info(
            f"[{match_id}] 生成市场数据: source={request.market_source}, "
            f"type={request.market_type}, coin={request.coin_id}, steps={request.duration_steps}"
        )
        if request.market_source == "coingecko_historical":
            market_data = await CoinGeckoFetcher.fetch_historical(
                coin_id=request.coin_id,
                days=30,
                steps=request.duration_steps,
            )
        elif request.market_source == "coingecko_realtime":
            market_data = await CoinGeckoFetcher.fetch_realtime(
                coin_id=request.coin_id,
                steps=request.duration_steps,
            )
        elif request.market_type == "trending":
            market_data = MarketDataGenerator.generate_trending(steps=request.duration_steps)
        elif request.market_type == "ranging":
            market_data = MarketDataGenerator.generate_ranging(steps=request.duration_steps)
        else:
            market_data = MarketDataGenerator.generate_random_walk(steps=request.duration_steps)

        if len(market_data) < request.duration_steps:
            raise ValueError(
                f"行情数据不足: 获取到 {len(market_data)} 步，需要 {request.duration_steps} 步"
            )

        # 获取交易对名称
        trading_pair = (
            CoinGeckoFetcher.coin_symbol(request.coin_id)
            if request.market_source != "simulated"
            else "ETH/USDC"
        )

        # 初始化并执行比赛
        match_config = MatchConfig(
            initial_capital=request.initial_capital,
            trading_pair=trading_pair,
            timeframe="5m",
            duration_steps=request.duration_steps,
        )
        engine = MatchEngine(match_config)
        match = engine.initialize_match(pydantic_strategies)

        for step in range(request.duration_steps):
            current_price = market_data[step]["close"]
            engine.execute_step(match, market_data[: step + 1], step, current_price)

        results = engine.finalize_match(match)

        # 构建含完整价值序列的结果
        result_dicts = [
            {
                "strategy_id": r.strategy_id,
                "final_value": r.final_value,
                "return_pct": r.return_pct,
                "total_trades": r.total_trades,
                "win_trades": r.win_trades,
                "rank": r.rank,
                "max_drawdown": r.max_drawdown,
                "sharpe_ratio": r.sharpe_ratio,
                "value_history": engine.value_history.get(r.strategy_id, []),
            }
            for r in results
        ]

        MatchCRUD.save_results(db, match_id, result_dicts)
        MatchCRUD.update_status(db, match_id, "completed")

        # 更新策略统计
        for result in result_dicts:
            StrategyCRUD.update_stats(db, result["strategy_id"], result)

        db.commit()
        logger.info(f"[{match_id}] 比赛执行完成，冠军: {results[0].strategy_id} ({results[0].return_pct:+.2f}%)")

    except Exception as e:
        logger.error(f"[{match_id}] 比赛执行失败: {e}", exc_info=True)
        try:
            MatchCRUD.update_status(db, match_id, "failed")
            MatchCRUD.set_error(db, match_id, str(e))
        except Exception:
            pass
    finally:
        db.close()


# ==================== API 路由 ====================

@router.post("/run")
async def run_match(
        request: RunMatchRequest,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    """提交比赛，立即返回 match_id，后台异步执行"""
    # 验证策略存在
    strategies = []
    for strategy_id in request.strategy_ids:
        db_strategy = StrategyCRUD.get(db, strategy_id)
        if not db_strategy:
            raise HTTPException(status_code=404, detail=f"策略不存在: {strategy_id}")
        strategies.append(db_strategy)

    if len(strategies) < 2:
        raise HTTPException(status_code=400, detail="至少需要 2 个策略")

    # 创建比赛记录
    trading_pair = (
        CoinGeckoFetcher.coin_symbol(request.coin_id)
        if request.market_source != "simulated"
        else "ETH/USDC"
    )
    config = {
        "initial_capital": request.initial_capital,
        "trading_pair": trading_pair,
        "timeframe": "5m",
        "duration_steps": request.duration_steps,
        "market_type": request.market_type,
        "market_source": request.market_source,
        "coin_id": request.coin_id if request.market_source != "simulated" else None,
    }

    db_match = MatchCRUD.create(db, config=config, strategy_ids=request.strategy_ids)

    # 转换为 Pydantic 模型（供后台任务使用，不依赖 DB session）
    from app.models.strategy import Strategy, StrategyType, StrategyParams

    pydantic_strategies = [
        Strategy(
            id=s.id,
            name=s.name,
            type=StrategyType(s.type),
            params=StrategyParams(**s.params),
            code=s.code,
            author=None,
            created_at=s.created_at,
            total_matches=s.total_matches,
            wins=s.wins,
            win_rate=s.win_rate,
            avg_return=s.avg_return,
        )
        for s in strategies
    ]

    # 注册后台任务并立即返回
    background_tasks.add_task(_run_match_job, db_match.id, request, pydantic_strategies)

    logger.info(f"比赛已提交后台: {db_match.id}")
    return {
        "match_id": db_match.id,
        "status": "pending",
        "config": config,
        "message": "比赛已提交，正在运行中",
    }


@router.delete("/{match_id}")
async def delete_match(
        match_id: str,
        db: Session = Depends(get_db)
):
    """删除比赛记录"""
    db_match = MatchCRUD.get(db, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="比赛不存在")
    if db_match.status == "running":
        raise HTTPException(status_code=400, detail="比赛进行中，无法删除")
    deleted = MatchCRUD.delete(db, match_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="删除失败")
    return {"message": "删除成功"}


@router.get("/{match_id}")
async def get_match(
        match_id: str,
        include_logs: bool = False,
        db: Session = Depends(get_db)
):
    """获取比赛详情"""
    db_match = MatchCRUD.get(db, match_id, load_logs=include_logs)

    if not db_match:
        raise HTTPException(status_code=404, detail="比赛不存在")

    # 构建返回数据
    result = {
        "id": db_match.id,
        "status": db_match.status,
        "error_message": db_match.error_message,
        "config": {
            "initial_capital": db_match.initial_capital,
            "trading_pair": db_match.trading_pair,
            "timeframe": db_match.timeframe,
            "duration_steps": db_match.duration_steps,
            "market_type": db_match.market_type,
            "market_source": getattr(db_match, "market_source", None),
            "coin_id": getattr(db_match, "coin_id", None),
        },
        "created_at": db_match.created_at,
        "start_time": db_match.start_time,
        "end_time": db_match.end_time,
        "participants": [
            {
                "strategy_id": p.strategy_id,
                "strategy_name": p.strategy.name if p.strategy else None,
                "final_value": p.final_value,
                "return_pct": p.return_pct,
                "total_trades": p.total_trades,
                "win_trades": p.win_trades,
                "rank": p.rank,
                "max_drawdown": p.max_drawdown,
                "sharpe_ratio": p.sharpe_ratio,
                "value_history": p.value_history or [],
            }
            for p in db_match.participants
        ]
    }

    # 可选：包含执行日志
    if include_logs and db_match.logs:
        result["logs"] = [
            {
                "step": log.step,
                "data": log.data
            }
            for log in sorted(db_match.logs, key=lambda x: x.step)
        ]

    return result

@router.get("/")
async def list_matches(
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """获取比赛列表"""
    db_matches = MatchCRUD.get_all(db, skip=skip, limit=limit, status=status)

    return [
        {
            "id": m.id,
            "status": m.status,
            "error_message": m.error_message,
            "config": {
                "initial_capital": m.initial_capital,
                "trading_pair": m.trading_pair,
                "timeframe": m.timeframe,
                "duration_steps": m.duration_steps,
                "market_type": m.market_type,
                "market_source": getattr(m, "market_source", None),
                "coin_id": getattr(m, "coin_id", None),
            },
            "created_at": m.created_at.isoformat(),
            "start_time": m.start_time.isoformat() if m.start_time else None,
            "end_time": m.end_time.isoformat() if m.end_time else None,
            "participants_count": len(m.participants),
            "participants": [
                {
                    "strategy_id": p.strategy_id,
                    "strategy_name": p.strategy.name if p.strategy else None,
                    "final_value": p.final_value,
                    "return_pct": p.return_pct,
                    "total_trades": p.total_trades,
                    "win_trades": p.win_trades,
                    "rank": p.rank,
                    "max_drawdown": p.max_drawdown,
                    "sharpe_ratio": p.sharpe_ratio,
                    "value_history": p.value_history or [],
                }
                for p in m.participants
            ]
        }
        for m in db_matches
    ]
