"""MatchEngine 与手续费/滑点单元测试"""
from datetime import datetime
import pytest
from app.models.match import MatchConfig, MatchStatus
from app.models.strategy import Strategy, StrategyType, StrategyParams
from app.core.match_engine import MatchEngine, STRATEGY_CLASSES


def _make_dca_strategy(sid: str, lookback: int = 1, position_size: float = 0.1):
    """DCA：lookback_period=1 时每步都买，position_size*10000 为金额"""
    return Strategy(
        id=sid,
        name="DCA",
        type=StrategyType.DCA,
        params=StrategyParams(
            lookback_period=lookback,
            buy_threshold=0.97,
            sell_threshold=1.03,
            position_size=position_size,
            max_position_pct=0.5,
        ),
        code=None,
        author=None,
        created_at=datetime(2020, 1, 1),
        total_matches=0,
        wins=0,
        win_rate=0.0,
        avg_return=0.0,
    )


def test_engine_uses_fee_and_slippage():
    """手续费与滑点从引擎参数读取，买入后持仓数量会减少"""
    config = MatchConfig(
        initial_capital=10_000.0,
        trading_pair="ETH/USDC",
        timeframe="5m",
        duration_steps=5,
    )
    # 无费无滑点
    engine_zero = MatchEngine(config, fee_rate=0.0, slippage_rate=0.0)
    strategies_zero = [_make_dca_strategy("s1", lookback=1, position_size=0.1)]
    match_zero = engine_zero.initialize_match(strategies_zero)
    market = [{"close": 100.0}] * 2
    engine_zero.execute_step(match_zero, market, 0, 100.0)
    qty_zero = engine_zero.portfolios["s1"].positions.get("ETH", 0)

    # 有手续费 10%，无滑点：买入 1000，扣费 100，实际买入 900/100 = 9
    engine_fee = MatchEngine(config, fee_rate=0.1, slippage_rate=0.0)
    strategies_fee = [_make_dca_strategy("s1", lookback=1, position_size=0.1)]
    match_fee = engine_fee.initialize_match(strategies_fee)
    engine_fee.execute_step(match_fee, market, 0, 100.0)
    qty_fee = engine_fee.portfolios["s1"].positions.get("ETH", 0)

    assert qty_zero > 0
    assert qty_fee < qty_zero
    # 无费约 10 ETH（1000/100），有费约 9 ETH（900/100）
    assert abs(qty_zero - 10.0) < 0.01
    assert abs(qty_fee - 9.0) < 0.01


def test_initialize_match():
    """初始化后每个策略有独立 portfolio 与 value_history"""
    config = MatchConfig(
        initial_capital=5000.0,
        trading_pair="ETH/USDC",
        timeframe="5m",
        duration_steps=10,
    )
    engine = MatchEngine(config, fee_rate=0.0, slippage_rate=0.0)
    strategies = [
        _make_dca_strategy("s1"),
        _make_dca_strategy("s2"),
    ]
    match = engine.initialize_match(strategies)

    assert match.status == MatchStatus.RUNNING
    assert len(match.strategy_ids) == 2
    assert "s1" in engine.portfolios and "s2" in engine.portfolios
    for sid in ["s1", "s2"]:
        assert engine.portfolios[sid].cash == 5000.0
        assert engine.portfolios[sid].total_value == 5000.0
        assert engine.value_history[sid] == [5000.0]


def test_finalize_match_returns_ranked_results():
    """跑完若干步后 finalize 返回按收益排序的结果"""
    config = MatchConfig(
        initial_capital=10_000.0,
        trading_pair="ETH/USDC",
        timeframe="5m",
        duration_steps=3,
    )
    engine = MatchEngine(config, fee_rate=0.0, slippage_rate=0.0)
    strategies = [_make_dca_strategy("s1"), _make_dca_strategy("s2")]
    match = engine.initialize_match(strategies)
    market = [{"close": 100.0 + i} for i in range(5)]
    for step in range(3):
        engine.execute_step(match, market[: step + 2], step, market[step + 1]["close"])

    results = engine.finalize_match(match)

    assert len(results) == 2
    assert match.status == MatchStatus.COMPLETED
    ranks = [r.rank for r in results]
    assert sorted(ranks) == [1, 2]
    for r in results:
        assert r.strategy_id in ("s1", "s2")
        assert hasattr(r, "return_pct") and hasattr(r, "max_drawdown") and hasattr(r, "sharpe_ratio")


def test_strategy_registry():
    """STRATEGY_CLASSES 包含所有内置类型"""
    for key in ("mean_reversion", "momentum", "dca"):
        assert key in STRATEGY_CLASSES
    assert len(STRATEGY_CLASSES) >= 3
