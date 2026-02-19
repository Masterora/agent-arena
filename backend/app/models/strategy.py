from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


class StrategyType(str, Enum):
    """策略类型"""
    MEAN_REVERSION = "mean_reversion"
    MOMENTUM = "momentum"
    DCA = "dca"
    CUSTOM = "custom"


class StrategyParams(BaseModel):
    """策略参数"""
    lookback_period: int = Field(default=20, ge=1, le=200, description="回看周期")

    # 允许灵活配置
    buy_threshold: float = Field(default=0.97, gt=0, description="买入阈值")
    sell_threshold: float = Field(default=1.03, gt=0, description="卖出阈值")

    position_size: float = Field(default=0.1, gt=0, le=1, description="单次仓位大小")
    max_position_pct: float = Field(default=0.5, gt=0, le=1, description="最大持仓比例")

    # 可选参数
    stop_loss: Optional[float] = Field(default=None, gt=0, lt=1, description="止损比例")
    take_profit: Optional[float] = Field(default=None, gt=1, description="止盈比例")

    @field_validator('buy_threshold', 'sell_threshold')
    @classmethod
    def validate_thresholds(cls, v: float) -> float:
        """验证阈值范围"""
        if v <= 0:
            raise ValueError("阈值必须大于 0")
        if v > 10:  # 防止极端值
            raise ValueError("阈值不能超过 10")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "lookback_period": 20,
                "buy_threshold": 0.97,
                "sell_threshold": 1.03,
                "position_size": 0.2,
                "max_position_pct": 0.5
            }
        }


class StrategyCreate(BaseModel):
    """创建策略请求"""
    name: str = Field(..., min_length=1, max_length=100)
    type: StrategyType
    params: StrategyParams
    code: Optional[str] = Field(default=None, description="自定义代码")
    description: Optional[str] = Field(default=None, max_length=500)


class StrategyUpdate(BaseModel):
    """更新策略请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    params: Optional[StrategyParams] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class Strategy(BaseModel):
    """策略响应"""
    id: str
    name: str
    type: StrategyType
    params: StrategyParams
    code: Optional[str] = None
    description: Optional[str] = None
    author: Optional[str] = None
    created_at: datetime

    # 统计数据
    total_matches: int = 0
    wins: int = 0
    win_rate: float = 0.0
    avg_return: float = 0.0
    total_return: float = 0.0
    sharpe_ratio: float = 0.0
    max_drawdown: float = 0.0

    class Config:
        from_attributes = True
