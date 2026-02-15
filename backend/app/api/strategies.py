from fastapi import APIRouter, HTTPException
from typing import List
from app.models.strategy import Strategy, StrategyCreate, StrategyType
from loguru import logger
import uuid

router = APIRouter()

# 临时存储（后续替换为数据库）
strategies_db: List[Strategy] = []

@router.post("/", response_model=Strategy, status_code=201)
async def create_strategy(strategy_data: StrategyCreate):
    """创建新策略"""
    strategy = Strategy(
        id=f"strategy-{uuid.uuid4().hex[:8]}",
        **strategy_data.model_dump()
    )
    strategies_db.append(strategy)
    logger.info(f"创建策略: {strategy.name} (ID: {strategy.id})")
    return strategy

@router.get("/", response_model=List[Strategy])
async def list_strategies():
    """获取策略列表"""
    return strategies_db

@router.get("/{strategy_id}", response_model=Strategy)
async def get_strategy(strategy_id: str):
    """获取策略详情"""
    for strategy in strategies_db:
        if strategy.id == strategy_id:
            return strategy
    raise HTTPException(status_code=404, detail="策略不存在")

@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: str):
    """删除策略"""
    global strategies_db
    strategies_db = [s for s in strategies_db if s.id != strategy_id]
    return {"message": "删除成功"}
