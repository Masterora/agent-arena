from typing import List, Dict, Any, Optional
from datetime import datetime
import math
import uuid
from loguru import logger

from app.models.match import Match, MatchConfig, MatchResult, MatchStatus, Action
from app.models.portfolio import Portfolio
from app.models.strategy import Strategy
from app.strategies.templates import MeanReversionStrategy, MomentumStrategy, DCAStrategy

# 策略类型 → 策略类，新增策略时只需在此注册
STRATEGY_CLASSES = {
    "mean_reversion": MeanReversionStrategy,
    "momentum": MomentumStrategy,
    "dca": DCAStrategy,
}


class MatchEngine:
    """比赛执行引擎"""

    def __init__(self, match_config: MatchConfig):
        self.config = match_config
        self.portfolios: Dict[str, Portfolio] = {}
        self.strategies_instances = {}
        # 每步资产价值序列，用于计算回撤和夏普率
        self.value_history: Dict[str, List[float]] = {}
        # 每个策略各资产的加权平均成本
        self.cost_basis: Dict[str, Dict[str, float]] = {}
        # 已盈利的卖出笔数
        self.win_trade_count: Dict[str, int] = {}

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
            self.value_history[strategy.id] = [self.config.initial_capital]
            self.cost_basis[strategy.id] = {}
            self.win_trade_count[strategy.id] = 0

            # 实例化策略（通过注册表，便于扩展）
            try:
                strategy_cls = STRATEGY_CLASSES[strategy.type]
            except KeyError:
                raise ValueError(f"不支持的策略类型: {strategy.type}")
            strategy_instance = strategy_cls(strategy.id, strategy.params.model_dump())

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
                # 1. 优先检查止损/止盈（强制平仓）
                action = self._check_risk_controls(strategy_id, strategy_instance, current_price)

                # 2. 无风控触发时交给策略决策
                if action is None:
                    action = strategy_instance.decide(market_data, step)

                # 3. 买入时检查最大持仓比例限制
                if action.type == "buy":
                    max_pos_pct = strategy_instance.params.get("max_position_pct", 0.5)
                    current_pos_value = portfolio.positions.get(action.asset, 0) * current_price
                    max_allowed = portfolio.total_value * max_pos_pct
                    if current_pos_value >= max_allowed:
                        logger.debug(
                            f"策略 {strategy_id}: 持仓已达上限 "
                            f"({current_pos_value:.1f} >= {max_allowed:.1f})，跳过买入"
                        )
                        action = Action(type="hold")

                # 4. 执行交易
                if action.type == "buy":
                    self._execute_buy(portfolio, action, current_price, strategy_id)
                elif action.type == "sell":
                    self._execute_sell(portfolio, action, current_price, strategy_id)

                # 5. 更新持仓价值，记录历史
                portfolio.update_value({action.asset if action.asset else "ETH": current_price})
                self.value_history[strategy_id].append(portfolio.total_value)

                # 6. 记录日志
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

    def _check_risk_controls(
            self,
            strategy_id: str,
            strategy_instance,
            current_price: float
    ) -> Optional[Action]:
        """检查止损/止盈，触发时返回强制平仓指令，否则返回 None"""
        stop_loss = strategy_instance.params.get("stop_loss")      # e.g. 0.05 → 跌5%止损
        take_profit = strategy_instance.params.get("take_profit")  # e.g. 1.20 → 涨20%止盈

        portfolio = self.portfolios[strategy_id]
        eth_balance = portfolio.positions.get("ETH", 0)
        if eth_balance <= 0:
            return None

        avg_cost = self.cost_basis[strategy_id].get("ETH")
        if not avg_cost or avg_cost == 0:
            return None

        price_ratio = current_price / avg_cost

        if stop_loss is not None and price_ratio <= (1.0 - stop_loss):
            logger.info(
                f"策略 {strategy_id}: 触发止损 "
                f"(当前价 {current_price:.2f}, 成本 {avg_cost:.2f}, "
                f"亏损 {(1 - price_ratio) * 100:.1f}%)"
            )
            return Action(type="sell", asset="ETH", amount=eth_balance)

        if take_profit is not None and price_ratio >= take_profit:
            logger.info(
                f"策略 {strategy_id}: 触发止盈 "
                f"(当前价 {current_price:.2f}, 成本 {avg_cost:.2f}, "
                f"盈利 {(price_ratio - 1) * 100:.1f}%)"
            )
            return Action(type="sell", asset="ETH", amount=eth_balance)

        return None

    def _execute_buy(
            self,
            portfolio: Portfolio,
            action: Action,
            price: float,
            strategy_id: str
    ):
        """执行买入，并更新加权平均成本"""
        if action.amount > portfolio.cash:
            action.amount = portfolio.cash

        if action.amount < 10:
            return

        fee = action.amount * 0.002
        slippage = action.amount * 0.001
        actual_spend = action.amount - fee - slippage
        quantity = actual_spend / price

        # 更新加权平均成本
        old_qty = portfolio.positions.get(action.asset, 0)
        old_cost = self.cost_basis[strategy_id].get(action.asset, price)
        new_qty = old_qty + quantity
        if new_qty > 0:
            self.cost_basis[strategy_id][action.asset] = (
                (old_qty * old_cost + quantity * price) / new_qty
            )

        portfolio.cash -= action.amount
        portfolio.positions[action.asset] = new_qty

        logger.debug(
            f"买入: {quantity:.4f} {action.asset} @ {price:.2f}, "
            f"花费: {action.amount:.2f}, 均成本: {self.cost_basis[strategy_id][action.asset]:.2f}"
        )

    def _execute_sell(
            self,
            portfolio: Portfolio,
            action: Action,
            price: float,
            strategy_id: str
    ):
        """执行卖出，对比成本判断盈亏"""
        current_position = portfolio.positions.get(action.asset, 0)

        if current_position <= 0:
            return

        quantity = min(action.amount, current_position)

        if quantity < 0.001:
            return

        # 判断盈亏（卖出价 > 加权平均成本 → 盈利）
        avg_cost = self.cost_basis[strategy_id].get(action.asset)
        if avg_cost is not None and price > avg_cost:
            self.win_trade_count[strategy_id] += 1

        revenue = quantity * price
        fee = revenue * 0.002
        slippage = revenue * 0.001
        actual_revenue = revenue - fee - slippage

        portfolio.cash += actual_revenue
        remaining = current_position - quantity
        if remaining < 0.0001:
            portfolio.positions[action.asset] = 0
            self.cost_basis[strategy_id].pop(action.asset, None)
        else:
            portfolio.positions[action.asset] = remaining

        logger.debug(
            f"卖出: {quantity:.4f} {action.asset} @ {price:.2f}, "
            f"收入: {actual_revenue:.2f}, "
            f"{'盈利' if avg_cost and price > avg_cost else '亏损'}"
        )

    def finalize_match(self, match: Match) -> List[MatchResult]:
        """结束比赛并计算结果（含最大回撤和夏普率）"""
        results = []

        for strategy_id, portfolio in self.portfolios.items():
            final_value = portfolio.total_value
            return_pct = (
                (final_value - self.config.initial_capital) / self.config.initial_capital * 100
            )

            values = self.value_history[strategy_id]

            trades = [log for log in match.execution_log if log["strategy_id"] == strategy_id]
            total_trades = len([t for t in trades if t["action"]["type"] != "hold"])

            # 使用准确的盈利卖出计数
            win_trades = self.win_trade_count[strategy_id]

            max_drawdown = self._calc_max_drawdown(values)
            sharpe_ratio = self._calc_sharpe(values)

            results.append(MatchResult(
                strategy_id=strategy_id,
                final_value=round(final_value, 2),
                return_pct=round(return_pct, 2),
                total_trades=total_trades,
                win_trades=win_trades,
                rank=0,
                max_drawdown=max_drawdown,
                sharpe_ratio=sharpe_ratio,
            ))

        # 按收益率排序
        results.sort(key=lambda x: x.return_pct, reverse=True)
        for i, result in enumerate(results):
            result.rank = i + 1

        match.results = results
        match.status = MatchStatus.COMPLETED
        match.end_time = datetime.now()

        logger.info(
            f"比赛结束: {match.id}, 冠军: {results[0].strategy_id}, "
            f"收益率: {results[0].return_pct:.2f}%, "
            f"最大回撤: {results[0].max_drawdown:.2f}%, "
            f"夏普率: {results[0].sharpe_ratio:.4f}"
        )

        return results

    # ==================== 辅助计算 ====================

    @staticmethod
    def _calc_max_drawdown(values: List[float]) -> float:
        """计算最大回撤百分比（从峰值的最大跌幅）"""
        if len(values) < 2:
            return 0.0
        peak = values[0]
        max_dd = 0.0
        for v in values:
            if v > peak:
                peak = v
            if peak > 0:
                dd = (peak - v) / peak
                if dd > max_dd:
                    max_dd = dd
        return round(max_dd * 100, 2)

    @staticmethod
    def _calc_sharpe(values: List[float], steps_per_year: int = 105120) -> float:
        """
        计算年化夏普率（无风险利率=0，假设5分钟K线）
        steps_per_year = 365 * 24 * 12 = 105120
        """
        if len(values) < 3:
            return 0.0
        returns = [
            (values[i] - values[i - 1]) / values[i - 1]
            for i in range(1, len(values))
            if values[i - 1] > 0
        ]
        if len(returns) < 2:
            return 0.0
        n = len(returns)
        mean_r = sum(returns) / n
        variance = sum((r - mean_r) ** 2 for r in returns) / n
        std_r = math.sqrt(variance)
        if std_r == 0:
            return 0.0
        return round((mean_r / std_r) * math.sqrt(steps_per_year), 4)
