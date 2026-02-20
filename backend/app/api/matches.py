from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from loguru import logger

from app.database import get_db
from app.db.crud import MatchCRUD, StrategyCRUD
from app.db import models
from app.models.match import Match, MatchConfig, MatchStatus
from app.core.match_engine import MatchEngine
from app.core.market_data import MarketDataGenerator

router = APIRouter()


class RunMatchRequest(BaseModel):
    """运行比赛请求"""
    strategy_ids: List[str] = Field(..., min_length=2, max_length=10)
    market_type: str = Field(default="random", pattern="^(random|trending|ranging)$")
    duration_steps: int = Field(default=100, ge=10, le=500)
    initial_capital: float = Field(default=10000.0, ge=1000, le=1000000)


@router.post("/run")
async def run_match(
        request: RunMatchRequest,
        db: Session = Depends(get_db)
):
    """运行比赛"""
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
    config = {
        "initial_capital": request.initial_capital,
        "trading_pair": "ETH/USDC",
        "timeframe": "5m",
        "duration_steps": request.duration_steps,
        "market_type": request.market_type
    }

    db_match = MatchCRUD.create(
        db,
        config=config,
        strategy_ids=request.strategy_ids
    )

    try:
        # 更新状态为运行中
        MatchCRUD.update_status(db, db_match.id, "running")
        db_match.status = "running"

        # 生成市场数据
        logger.info(f"生成市场数据: {request.market_type}, {request.duration_steps} 步")

        if request.market_type == "trending":
            market_data = MarketDataGenerator.generate_trending(steps=request.duration_steps)
        elif request.market_type == "ranging":
            market_data = MarketDataGenerator.generate_ranging(steps=request.duration_steps)
        else:
            market_data = MarketDataGenerator.generate_random_walk(steps=request.duration_steps)

        # 创建比赛配置对象
        match_config = MatchConfig(
            initial_capital=request.initial_capital,
            trading_pair="ETH/USDC",
            timeframe="5m",
            duration_steps=request.duration_steps
        )

        # 转换策略为 Pydantic 模型
        from app.models.strategy import Strategy, StrategyType, StrategyParams

        pydantic_strategies = []
        for s in strategies:
            pydantic_strategies.append(Strategy(
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
                avg_return=s.avg_return
            ))

        # 初始化比赛引擎
        engine = MatchEngine(match_config)
        match = engine.initialize_match(pydantic_strategies)

        # 执行比赛
        for step in range(request.duration_steps):
            current_price = market_data[step]["close"]
            engine.execute_step(match, market_data[:step + 1], step, current_price)

            # 每 10 步保存一次日志
            if step % 10 == 0:
                MatchCRUD.add_log(
                    db,
                    db_match.id,
                    step,
                    {"logs": match.execution_log[-10:]}
                )

        # 结束比赛
        results = engine.finalize_match(match)

        # 保存结果到数据库
        result_dicts = [
            {
                "strategy_id": r.strategy_id,
                "final_value": r.final_value,
                "return_pct": r.return_pct,
                "total_trades": r.total_trades,
                "win_trades": r.win_trades,
                "rank": r.rank
            }
            for r in results
        ]

        MatchCRUD.save_results(db, db_match.id, result_dicts)
        MatchCRUD.update_status(db, db_match.id, "completed")

        # 更新策略统计
        for result in result_dicts:
            StrategyCRUD.update_stats(db, result["strategy_id"], result)

        # 提交所有日志
        db.commit()

        logger.info(f"比赛执行完成: {db_match.id}")

        # 返回完整结果
        return {
            "match_id": db_match.id,
            "status": "completed",
            "results": result_dicts,
            "config": config,
            "message": "比赛执行成功"
        }

    except Exception as e:
        logger.error(f"比赛执行失败: {str(e)}", exc_info=True)
        MatchCRUD.update_status(db, db_match.id, "failed")
        raise HTTPException(status_code=500, detail=f"比赛执行失败: {str(e)}")


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
            "initial_capital": m.initial_capital,
            "trading_pair": m.trading_pair,
            "timeframe": m.timeframe,
            "duration_steps": m.duration_steps,
            "market_type": m.market_type,
            "created_at": m.created_at,
            "start_time": m.start_time,
            "end_time": m.end_time,
            "participants_count": len(m.participants)
        }
        for m in db_matches
    ]


@router.get("/{match_id}")
async def get_match(
        match_id: str,
        include_logs: bool = False,
        db: Session = Depends(get_db)
):
    """获取比赛详情"""
    db_match = MatchCRUD.get(db, match_id)

    if not db_match:
        raise HTTPException(status_code=404, detail="比赛不存在")

    # 构建返回数据
    result = {
        "id": db_match.id,
        "status": db_match.status,
        "config": {
            "initial_capital": db_match.initial_capital,
            "trading_pair": db_match.trading_pair,
            "timeframe": db_match.timeframe,
            "duration_steps": db_match.duration_steps,
            "market_type": db_match.market_type
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
                "rank": p.rank
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
            "config": {
                "initial_capital": m.initial_capital,
                "trading_pair": m.trading_pair,
                "timeframe": m.timeframe,
                "duration_steps": m.duration_steps,
                "market_type": m.market_type
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
                    "rank": p.rank
                }
                for p in m.participants
            ]
        }
        for m in db_matches
    ]
