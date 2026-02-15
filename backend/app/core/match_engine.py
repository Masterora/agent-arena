from typing import List, Dict, Any
from datetime import datetime
import uuid
from loguru import logger

from app.models.match import Match, MatchConfig, MatchResult, MatchStatus, Action
from app.models.portfolio import Portfolio
from app.models.strategy import Strategy
from app.strategies.templates import MeanReversionStrategy, MomentumStrategy, DCAStrategy


class MatchEngine:
    """比赛执行引擎"""

    def __init__(self, match_config: MatchConfig):
        self.config = match_config
        self.portfolios: Dict[str, Portfolio] = {}
        self.strategies_instances = {}

    def initialize_match(self, strategies: List[Strategy]) -> Match:
        """初始化比赛"""
        match = Match(
            id=f"match-{uuid.uuid4().hex[:8]}",
            config=self.config,
            strategy_ids=[s.id for s in strategies],
            status=MatchStatus.RUNNING,
            start_time=datetime.now()
        )

        # 初始化每个策略的持仓
        for strategy in strategies:
            portfolio = Portfolio(
                strategy_id=strategy.id,
                cash=self.config.initial_capital,
                positions={},
                total_value=self.config.initial_capital
            )
            self.portfolios[strategy.id] = portfolio

            # 实例化策略
            if strategy.type == "mean_reversion":
                strategy_instance = MeanReversionStrategy(
                    strategy.id,
                    strategy.params.model_dump()
                )
            elif strategy.type == "momentum":
                strategy_instance = MomentumStrategy(
                    strategy.id,
                    strategy.params.model_dump()
                )
            elif strategy.type == "dca":
                strategy_instance = DCAStrategy(
                    strategy.id,
                    strategy.params.model_dump()
                )
            else:
                raise ValueError(f"不支持的策略类型: {strategy.type}")

            strategy_instance.set_portfolio(portfolio)
            self.strategies_instances[strategy.id] = strategy_instance

        logger.info(f"比赛初始化完成: {match.id}, 参赛策略数: {len(strategies)}")
        return match

    def execute_step(
            self,
            match: Match,
            market_data: List[Dict[str, Any]],
            step: int,
            current_price: float
    ):
        """执行单步"""
        for strategy_id, strategy_instance in self.strategies_instances.items():
            portfolio = self.portfolios[strategy_id]

            try:
                # 策略决策
                action = strategy_instance.decide(market_data, step)

                # 执行交易
                if action.type == "buy":
                    self._execute_buy(portfolio, action, current_price)
                elif action.type == "sell":
                    self._execute_sell(portfolio, action, current_price)

                # 更新持仓价值
                portfolio.update_value({"ETH": current_price})

                # 记录日志
                match.execution_log.append({
                    "step": step,
                    "strategy_id": strategy_id,
                    "action": action.model_dump(),
                    "portfolio": {
                        "cash": round(portfolio.cash, 2),
                        "positions": {k: round(v, 4) for k, v in portfolio.positions.items()},
                        "total_value": round(portfolio.total_value, 2)
                    },
                    "price": round(current_price, 2)
                })
            except Exception as e:
                logger.error(f"策略 {strategy_id} 执行失败: {str(e)}")
                # 继续执行其他策略

    def _execute_buy(self, portfolio: Portfolio, action: Action, price: float):
        """执行买入"""
        if action.amount > portfolio.cash:
            action.amount = portfolio.cash

        if action.amount < 10:  # 最小交易金额
            return

        # 计算手续费和滑点
        fee = action.amount * 0.002
        slippage = action.amount * 0.001
        actual_amount = action.amount - fee - slippage

        # 买入数量
        quantity = actual_amount / price

        # 更新持仓
        portfolio.cash -= action.amount
        portfolio.positions[action.asset] = portfolio.positions.get(action.asset, 0) + quantity

        logger.debug(f"买入: {quantity:.4f} {action.asset} @ {price:.2f}, 花费: {action.amount:.2f}")

    def _execute_sell(self, portfolio: Portfolio, action: Action, price: float):
        """执行卖出"""
        current_position = portfolio.positions.get(action.asset, 0)

        if current_position <= 0:
            return

        # 卖出数量
        quantity = min(action.amount, current_position)

        if quantity < 0.001:  # 最小卖出数量
            return

        # 计算收入
        revenue = quantity * price
        fee = revenue * 0.002
        slippage = revenue * 0.001
        actual_revenue = revenue - fee - slippage

        # 更新持仓
        portfolio.cash += actual_revenue
        portfolio.positions[action.asset] -= quantity

        if portfolio.positions[action.asset] < 0.0001:
            portfolio.positions[action.asset] = 0

        logger.debug(f"卖出: {quantity:.4f} {action.asset} @ {price:.2f}, 收入: {actual_revenue:.2f}")

    def finalize_match(self, match: Match) -> List[MatchResult]:
        """结束比赛并计算结果"""
        results = []

        for strategy_id, portfolio in self.portfolios.items():
            final_value = portfolio.total_value
            return_pct = (final_value - self.config.initial_capital) / self.config.initial_capital * 100

            # 统计交易次数
            trades = [log for log in match.execution_log if log["strategy_id"] == strategy_id]
            total_trades = len([t for t in trades if t["action"]["type"] != "hold"])

            # 计算盈利交易次数（简化版）
            win_trades = 0
            for i in range(1, len(trades)):
                if trades[i]["portfolio"]["total_value"] > trades[i - 1]["portfolio"]["total_value"]:
                    win_trades += 1

            results.append(MatchResult(
                strategy_id=strategy_id,
                final_value=round(final_value, 2),
                return_pct=round(return_pct, 2),
                total_trades=total_trades,
                win_trades=win_trades,
                rank=0  # 待排序
            ))

        # 按收益率排序
        results.sort(key=lambda x: x.return_pct, reverse=True)
        for i, result in enumerate(results):
            result.rank = i + 1

        match.results = results
        match.status = MatchStatus.COMPLETED
        match.end_time = datetime.now()

        logger.info(f"比赛结束: {match.id}, 冠军策略: {results[0].strategy_id}, 收益率: {results[0].return_pct:.2f}%")

        return results
