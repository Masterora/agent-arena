from typing import List, Dict, Any
from app.strategies.base import StrategyBase
from app.models.match import Action
from loguru import logger

class MeanReversionStrategy(StrategyBase):
    """均值回归策略"""

    def decide(self, market_data: List[Dict[str, Any]], step: int) -> Action:
        lookback = self.params.get("lookback_period", 20)
        buy_threshold = self.params.get("buy_threshold", 0.97)
        sell_threshold = self.params.get("sell_threshold", 1.03)
        position_size = self.params.get("position_size", 0.2)

        # 数据不足
        if len(market_data) < lookback:
            return Action(type="hold")

        # 计算均值
        recent_closes = [k["close"] for k in market_data[-lookback:]]
        avg_price = sum(recent_closes) / len(recent_closes)
        current_price = market_data[-1]["close"]

        # 买入信号
        if current_price < avg_price * buy_threshold:
            if self.portfolio.cash > 1000:
                amount = self.portfolio.cash * position_size
                logger.debug(f"策略 {self.id}: 买入信号 - 当前价 {current_price:.2f}, 均价 {avg_price:.2f}")
                return Action(type="buy", asset="ETH", amount=amount)

        # 卖出信号
        elif current_price > avg_price * sell_threshold:
            eth_balance = self.portfolio.positions.get("ETH", 0)
            if eth_balance > 0:
                logger.debug(f"策略 {self.id}: 卖出信号 - 当前价 {current_price:.2f}, 均价 {avg_price:.2f}")
                return Action(type="sell", asset="ETH", amount=eth_balance * 0.5)

        return Action(type="hold")


class MomentumStrategy(StrategyBase):
    """动量策略"""

    def decide(self, market_data: List[Dict[str, Any]], step: int) -> Action:
        lookback = self.params.get("lookback_period", 10)
        momentum_threshold = self.params.get("buy_threshold", 1.02)
        position_size = self.params.get("position_size", 0.3)

        if len(market_data) < lookback:
            return Action(type="hold")

        # 计算动量
        past_price = market_data[-lookback]["close"]
        current_price = market_data[-1]["close"]
        momentum = current_price / past_price

        # 上涨趋势买入
        if momentum > momentum_threshold:
            if self.portfolio.cash > 1000:
                amount = self.portfolio.cash * position_size
                return Action(type="buy", asset="ETH", amount=amount)

        # 下跌趋势卖出
        elif momentum < 0.98:
            eth_balance = self.portfolio.positions.get("ETH", 0)
            if eth_balance > 0:
                return Action(type="sell", asset="ETH", amount=eth_balance * 0.5)

        return Action(type="hold")


class DCAStrategy(StrategyBase):
    """定投策略"""

    def decide(self, market_data: List[Dict[str, Any]], step: int) -> Action:
        interval = self.params.get("lookback_period", 10)
        buy_amount = self.params.get("position_size", 0.1) * 10000

        # 每隔固定步数买入
        if step % interval == 0:
            if self.portfolio.cash >= buy_amount:
                return Action(type="buy", asset="ETH", amount=buy_amount)

        return Action(type="hold")
