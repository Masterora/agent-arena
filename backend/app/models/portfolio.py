from pydantic import BaseModel, Field
from typing import Dict, List
from datetime import datetime

class Portfolio(BaseModel):
    """持仓模型"""
    strategy_id: str
    cash: float = Field(default=10000.0, ge=0)
    positions: Dict[str, float] = Field(default_factory=dict)
    total_value: float = 0.0

    def update_value(self, prices: Dict[str, float]):
        """更新总资产价值"""
        position_value = sum(
            amount * prices.get(asset, 0)
            for asset, amount in self.positions.items()
        )
        self.total_value = self.cash + position_value
        return self.total_value

class PortfolioSnapshot(BaseModel):
    """持仓快照"""
    timestamp: datetime
    step: int
    cash: float
    positions: Dict[str, float]
    total_value: float
    prices: Dict[str, float]
