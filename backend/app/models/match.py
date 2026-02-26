from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class MatchStatus(str, Enum):
    """比赛状态"""
    PENDING = "pending"
    BETTING = "betting"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Action(BaseModel):
    """交易指令"""
    type: str = Field(..., pattern="^(buy|sell|hold)$")
    asset: str = "ETH"
    amount: float = Field(default=0.0, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "type": "buy",
                "asset": "ETH",
                "amount": 1000.0
            }
        }

class MatchConfig(BaseModel):
    """比赛配置"""
    initial_capital: float = 10000.0
    trading_pair: str = "ETH/USDC"
    timeframe: str = "5m"
    duration_steps: int = 100

class MatchResult(BaseModel):
    """比赛结果"""
    strategy_id: str
    final_value: float
    return_pct: float
    total_trades: int
    win_trades: int
    rank: int
    max_drawdown: float = 0.0   # 最大回撤 (%)
    sharpe_ratio: float = 0.0   # 夏普率

class Match(BaseModel):
    """比赛模型"""
    id: str
    status: MatchStatus = MatchStatus.PENDING
    config: MatchConfig
    strategy_ids: List[str]

    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    results: List[MatchResult] = Field(default_factory=list)
    execution_log: List[Dict[str, Any]] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.now)
