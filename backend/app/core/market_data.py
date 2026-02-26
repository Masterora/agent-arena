import numpy as np
import httpx
import json
import time
from pathlib import Path
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
                "timestamp": (base_time + timedelta(minutes=i * 5)).isoformat(),
                "open": round(price * (1 + np.random.uniform(-0.005, 0.005)), 2),
                "high": round(price * (1 + abs(np.random.uniform(0, 0.01))), 2),
                "low": round(price * (1 - abs(np.random.uniform(0, 0.01))), 2),
                "close": round(price, 2),
                "volume": round(np.random.uniform(100, 1000), 2)
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
                "timestamp": (base_time + timedelta(minutes=i * 5)).isoformat(),
                "open": round(price * (1 + np.random.uniform(-0.005, 0.005)), 2),
                "high": round(price * (1 + abs(np.random.uniform(0, 0.01))), 2),
                "low": round(price * (1 - abs(np.random.uniform(0, 0.01))), 2),
                "close": round(price, 2),
                "volume": round(np.random.uniform(100, 1000), 2)
            })

        return klines


class CoinGeckoFetcher:
    """CoinGecko 真实行情数据获取器"""

    BASE_URL = "https://api.coingecko.com/api/v3"
    CACHE_DIR = Path("data/market_data")
    CACHE_TTL = 3600  # 缓存 1 小时

    SUPPORTED_COINS = [
        {"id": "bitcoin",      "symbol": "BTC",  "name": "Bitcoin"},
        {"id": "ethereum",     "symbol": "ETH",  "name": "Ethereum"},
        {"id": "binancecoin",  "symbol": "BNB",  "name": "BNB"},
        {"id": "solana",       "symbol": "SOL",  "name": "Solana"},
        {"id": "ripple",       "symbol": "XRP",  "name": "XRP"},
        {"id": "cardano",      "symbol": "ADA",  "name": "Cardano"},
        {"id": "dogecoin",     "symbol": "DOGE", "name": "Dogecoin"},
        {"id": "polkadot",     "symbol": "DOT",  "name": "Polkadot"},
        {"id": "avalanche-2",  "symbol": "AVAX", "name": "Avalanche"},
        {"id": "chainlink",    "symbol": "LINK", "name": "Chainlink"},
    ]

    @classmethod
    def get_supported_coins(cls) -> List[Dict[str, str]]:
        """返回支持的币种列表"""
        return cls.SUPPORTED_COINS

    @classmethod
    def _cache_path(cls, coin_id: str, days: int) -> Path:
        return cls.CACHE_DIR / f"{coin_id}_{days}days.json"

    @classmethod
    def _load_cache(cls, coin_id: str, days: int):
        path = cls._cache_path(coin_id, days)
        if path.exists() and (time.time() - path.stat().st_mtime) < cls.CACHE_TTL:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

    @classmethod
    def _save_cache(cls, coin_id: str, days: int, data: List) -> None:
        cls.CACHE_DIR.mkdir(parents=True, exist_ok=True)
        with open(cls._cache_path(coin_id, days), "w", encoding="utf-8") as f:
            json.dump(data, f)

    @classmethod
    def _convert_ohlc(cls, raw: List) -> List[Dict[str, Any]]:
        """将 CoinGecko OHLC 格式转换为内部 K 线格式
        CoinGecko 返回: [[timestamp_ms, open, high, low, close], ...]
        """
        klines = []
        for candle in raw:
            ts = datetime.fromtimestamp(candle[0] / 1000)
            open_, high, low, close = (float(candle[i]) for i in range(1, 5))
            klines.append({
                "timestamp": ts.isoformat(),
                "open": round(open_, 6),
                "high": round(high, 6),
                "low": round(low, 6),
                "close": round(close, 6),
                # OHLC 接口不含成交量，用随机值模拟
                "volume": round(abs(np.random.normal(500, 200)), 2),
            })
        return klines

    @classmethod
    async def fetch_historical(
        cls, coin_id: str, days: int = 30, steps: int = 100
    ) -> List[Dict[str, Any]]:
        """获取历史 OHLC 数据（带磁盘缓存）

        Args:
            coin_id: CoinGecko 币种 ID（如 "bitcoin"）
            days: 获取天数（1/7/14/30/90/180/365）
            steps: 需要的步数，超出则随机截取一段

        Returns:
            长度为 steps 的 K 线列表
        """
        raw = cls._load_cache(coin_id, days)
        if raw is None:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    f"{cls.BASE_URL}/coins/{coin_id}/ohlc",
                    params={"vs_currency": "usd", "days": str(days)},
                    headers={"Accept": "application/json"},
                )
                resp.raise_for_status()
                raw = resp.json()
            cls._save_cache(coin_id, days, raw)

        klines = cls._convert_ohlc(raw)

        # 截取所需步数
        if len(klines) < steps:
            # 数据不足时用最后一根收盘价补充模拟数据
            last_price = klines[-1]["close"] if klines else 2000.0
            extra = MarketDataGenerator.generate_random_walk(
                initial_price=last_price,
                steps=steps - len(klines) + 1,
            )
            klines = klines + extra[1:]  # 避免首尾重复
        if len(klines) == steps:
            return klines
        # 从随机起始位置截取连续 steps 段
        start = int(np.random.randint(0, len(klines) - steps))
        return klines[start: start + steps]

    @classmethod
    async def fetch_realtime(
        cls, coin_id: str, steps: int = 100
    ) -> List[Dict[str, Any]]:
        """获取近 1 天的 OHLC 作为实时行情（基于 days=1 的最新数据）"""
        return await cls.fetch_historical(coin_id, days=1, steps=steps)

    @classmethod
    def coin_symbol(cls, coin_id: str) -> str:
        """根据 coin_id 返回交易对字符串，例如 BTC/USDT"""
        for c in cls.SUPPORTED_COINS:
            if c["id"] == coin_id:
                return f"{c['symbol']}/USDT"
        return "CRYPTO/USDT"
