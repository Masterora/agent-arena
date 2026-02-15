import numpy as np
from typing import List, Dict, Any
from datetime import datetime, timedelta


class MarketDataGenerator:
    """市场数据生成器（模拟）"""

    @staticmethod
    def generate_random_walk(
            initial_price: float = 2000.0,
            steps: int = 100,
            volatility: float = 0.02,
            trend: float = 0.0
    ) -> List[Dict[str, Any]]:
        """生成随机游走价格数据"""
        prices = [initial_price]

        for _ in range(steps - 1):
            change = np.random.normal(trend, volatility)
            new_price = prices[-1] * (1 + change)
            prices.append(max(new_price, 100))  # 价格不低于 100

        # 生成 K 线数据
        klines = []
        base_time = datetime.now() - timedelta(minutes=steps * 5)

        for i, price in enumerate(prices):
            klines.append({
                "timestamp": base_time + timedelta(minutes=i * 5),
                "open": price * (1 + np.random.uniform(-0.005, 0.005)),
                "high": price * (1 + abs(np.random.uniform(0, 0.01))),
                "low": price * (1 - abs(np.random.uniform(0, 0.01))),
                "close": price,
                "volume": np.random.uniform(100, 1000)
            })

        return klines

    @staticmethod
    def generate_trending(
            initial_price: float = 2000.0,
            steps: int = 100,
            trend: float = 0.001,  # 每步 0.1% 上涨
            volatility: float = 0.015
    ) -> List[Dict[str, Any]]:
        """生成趋势行情"""
        return MarketDataGenerator.generate_random_walk(
            initial_price, steps, volatility, trend
        )

    @staticmethod
    def generate_ranging(
            center_price: float = 2000.0,
            steps: int = 100,
            range_pct: float = 0.05  # 5% 震荡范围
    ) -> List[Dict[str, Any]]:
        """生成震荡行情"""
        klines = []
        base_time = datetime.now() - timedelta(minutes=steps * 5)

        for i in range(steps):
            # 在中心价格附近震荡
            price = center_price * (1 + np.random.uniform(-range_pct, range_pct))

            klines.append({
                "timestamp": base_time + timedelta(minutes=i * 5),
                "open": price * (1 + np.random.uniform(-0.005, 0.005)),
                "high": price * (1 + abs(np.random.uniform(0, 0.01))),
                "low": price * (1 - abs(np.random.uniform(0, 0.01))),
                "close": price,
                "volume": np.random.uniform(100, 1000)
            })

        return klines
