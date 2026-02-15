from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, Field
from app.models.match import Match, MatchStatus, MatchConfig
from app.core.match_engine import MatchEngine
from app.core.market_data import MarketDataGenerator
from app.api.strategies import strategies_db
from loguru import logger

router = APIRouter()

# 临时存储
matches_db: List[Match] = []


class RunMatchRequest(BaseModel):
    """运行比赛请求"""
    strategy_ids: List[str] = Field(..., min_length=2, max_length=10)
    market_type: str = Field(default="random", pattern="^(random|trending|ranging)$")
    duration_steps: int = Field(default=100, ge=10, le=500)
    initial_capital: float = Field(default=10000.0, ge=1000, le=1000000)


@router.post("/run", response_model=Match)
async def run_match(request: RunMatchRequest):
    """运行比赛"""
    # 验证策略存在
    strategies = [s for s in strategies_db if s.id in request.strategy_ids]

    if len(strategies) != len(request.strategy_ids):
        raise HTTPException(status_code=404, detail="部分策略不存在")

    if len(strategies) < 2:
        raise HTTPException(status_code=400, detail="至少需要 2 个策略")

    # 创建比赛配置
    config = MatchConfig(
        initial_capital=request.initial_capital,
        trading_pair="ETH/USDC",
        timeframe="5m",
        duration_steps=request.duration_steps
    )

    # 生成市场数据
    logger.info(f"生成市场数据: {request.market_type}, {request.duration_steps} 步")

    if request.market_type == "trending":
        market_data = MarketDataGenerator.generate_trending(steps=request.duration_steps)
    elif request.market_type == "ranging":
        market_data = MarketDataGenerator.generate_ranging(steps=request.duration_steps)
    else:
        market_data = MarketDataGenerator.generate_random_walk(steps=request.duration_steps)

    # 初始化比赛引擎
    engine = MatchEngine(config)
    match = engine.initialize_match(strategies)

    # 执行比赛
    try:
        for step in range(request.duration_steps):
            current_price = market_data[step]["close"]
            engine.execute_step(match, market_data[:step + 1], step, current_price)

        # 结束比赛
        engine.finalize_match(match)

        # 保存比赛结果
        matches_db.append(match)

        logger.info(f"比赛执行完成: {match.id}, 参赛策略: {len(strategies)}")

        return match

    except Exception as e:
        logger.error(f"比赛执行失败: {str(e)}", exc_info=True)
        match.status = MatchStatus.FAILED
        matches_db.append(match)
        raise HTTPException(status_code=500, detail=f"比赛执行失败: {str(e)}")


@router.get("/", response_model=List[Match])
async def list_matches():
    """获取比赛列表"""
    return matches_db


@router.get("/{match_id}", response_model=Match)
async def get_match(match_id: str):
    """获取比赛详情"""
    for match in matches_db:
        if match.id == match_id:
            return match
    raise HTTPException(status_code=404, detail="比赛不存在")
