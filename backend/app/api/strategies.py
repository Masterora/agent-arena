from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from loguru import logger

from app.database import get_db
from app.db.crud import StrategyCRUD
from app.db import models
from app.models.strategy import Strategy, StrategyCreate, StrategyUpdate

router = APIRouter()


@router.post("/", response_model=Strategy, status_code=201)
async def create_strategy(
        strategy: StrategyCreate,
        db: Session = Depends(get_db)
):
    """创建策略"""
    try:
        db_strategy = StrategyCRUD.create(db, strategy)

        # 转换为 Pydantic 模型
        return Strategy(
            id=db_strategy.id,
            name=db_strategy.name,
            type=db_strategy.type,
            params=db_strategy.params,
            code=db_strategy.code,
            author=None,
            created_at=db_strategy.created_at,
            total_matches=db_strategy.total_matches,
            wins=db_strategy.wins,
            win_rate=db_strategy.win_rate,
            avg_return=db_strategy.avg_return
        )
    except Exception as e:
        logger.error(f"创建策略失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"创建策略失败: {str(e)}")


@router.get("/", response_model=List[Strategy])
async def list_strategies(
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[str] = None,
        is_public: Optional[bool] = None,
        db: Session = Depends(get_db)
):
    """获取策略列表"""
    db_strategies = StrategyCRUD.get_all(
        db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        is_public=is_public
    )

    return [
        Strategy(
            id=s.id,
            name=s.name,
            type=s.type,
            params=s.params,
            code=s.code,
            author=None,
            created_at=s.created_at,
            total_matches=s.total_matches,
            wins=s.wins,
            win_rate=s.win_rate,
            avg_return=s.avg_return
        )
        for s in db_strategies
    ]


@router.get("/{strategy_id}", response_model=Strategy)
async def get_strategy(
        strategy_id: str,
        db: Session = Depends(get_db)
):
    """获取策略详情"""
    db_strategy = StrategyCRUD.get(db, strategy_id)

    if not db_strategy:
        raise HTTPException(status_code=404, detail="策略不存在")

    return Strategy(
        id=db_strategy.id,
        name=db_strategy.name,
        type=db_strategy.type,
        params=db_strategy.params,
        code=db_strategy.code,
        author=None,
        created_at=db_strategy.created_at,
        total_matches=db_strategy.total_matches,
        wins=db_strategy.wins,
        win_rate=db_strategy.win_rate,
        avg_return=db_strategy.avg_return
    )


@router.put("/{strategy_id}", response_model=Strategy)
async def update_strategy(
        strategy_id: str,
        strategy_update: StrategyUpdate,
        db: Session = Depends(get_db)
):
    """更新策略"""
    db_strategy = StrategyCRUD.get(db, strategy_id)

    if not db_strategy:
        raise HTTPException(status_code=404, detail="策略不存在")

    # 更新字段
    # model_dump() already serializes nested Pydantic models (e.g. StrategyParams) to dicts
    update_data = strategy_update.model_dump(exclude_unset=True)

    db_strategy = StrategyCRUD.update(db, strategy_id, **update_data)

    return Strategy(
        id=db_strategy.id,
        name=db_strategy.name,
        type=db_strategy.type,
        params=db_strategy.params,
        code=db_strategy.code,
        author=None,
        created_at=db_strategy.created_at,
        total_matches=db_strategy.total_matches,
        wins=db_strategy.wins,
        win_rate=db_strategy.win_rate,
        avg_return=db_strategy.avg_return
    )


@router.delete("/{strategy_id}", status_code=204)
async def delete_strategy(
        strategy_id: str,
        db: Session = Depends(get_db)
):
    """删除策略"""
    success = StrategyCRUD.delete(db, strategy_id)

    if not success:
        raise HTTPException(status_code=404, detail="策略不存在")

    return None
