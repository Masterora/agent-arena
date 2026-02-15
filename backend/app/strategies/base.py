from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.models.match import Action
from app.models.portfolio import Portfolio

class StrategyBase(ABC):
    """策略基类"""

    def __init__(self, strategy_id: str, params: Dict[str, Any]):
        self.id = strategy_id
        self.params = params
        self.portfolio: Portfolio = None

    def set_portfolio(self, portfolio: Portfolio):
        """设置持仓对象"""
        self.portfolio = portfolio

    @abstractmethod
    def decide(
        self,
        market_data: List[Dict[str, Any]],
        step: int
    ) -> Action:
        """
        核心决策函数

        Args:
            market_data: K线数据列表
            step: 当前步数

        Returns:
            Action: 交易指令
        """
        pass

    def initialize(self):
        """初始化策略（可选实现）"""
        pass
