from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum

class StrategyType(str, Enum):
    """策略类型"""
    MEAN_REVERSION = "mean_reversion"
    MOMENTUM = "momentum"
    DCA = "dca"
    GRID = "grid"
    CUSTOM = "custom"

class StrategyParams(BaseModel):
    """策略参数"""
    lookback_period: int = Field(default=20, ge=1, le=200)
    buy_threshold: float = Field(default=0.97, ge=0.5, le=1.0)
    sell_threshold: float = Field(default=1.03, ge=1.0, le=2.0)
    position_size: float = Field(default=0.2, ge=0.01, le=1.0)
    max_position_pct: float = Field(default=0.5, ge=0.1, le=1.0)

class Strategy(BaseModel):
    """策略模型"""
    id: str
    name: str
    type: StrategyType
    params: StrategyParams
    code: Optional[str] = None
    author: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

    # 统计数据
    total_matches: int = 0
    wins: int = 0
    win_rate: float = 0.0
    avg_return: float = 0.0

    class Config:
        json_schema_extra = {
            "example": {
                "id": "strategy-001",
                "name": "均值回归策略",
                "type": "mean_reversion",
                "params": {
                    "lookback_period": 20,
                    "buy_threshold": 0.97,
                    "sell_threshold": 1.03,
                    "position_size": 0.2
                }
            }
        }

class StrategyCreate(BaseModel):
    """创建策略请求"""
    name: str = Field(..., min_length=1, max_length=100)
    type: StrategyType
    params: StrategyParams
    code: Optional[str] = None
