from fastapi import APIRouter, HTTPException
from loguru import logger

from app.core.market_data import CoinGeckoFetcher

router = APIRouter()


@router.get("/coins")
async def get_supported_coins():
    """获取支持的币种列表"""
    return CoinGeckoFetcher.get_supported_coins()


@router.get("/coins/{coin_id}/ohlc")
async def get_coin_ohlc(coin_id: str, days: int = 30, steps: int = 100):
    """获取指定币种的 OHLC 历史数据（带缓存）

    Args:
        coin_id: CoinGecko 币种 ID（如 bitcoin、ethereum）
        days: 历史天数（1/7/14/30/90/180/365）
        steps: 返回的 K 线数量
    """
    supported_ids = {c["id"] for c in CoinGeckoFetcher.get_supported_coins()}
    if coin_id not in supported_ids:
        raise HTTPException(status_code=400, detail=f"不支持的币种: {coin_id}")

    try:
        klines = await CoinGeckoFetcher.fetch_historical(
            coin_id=coin_id, days=days, steps=steps
        )
        return {
            "coin_id": coin_id,
            "symbol": CoinGeckoFetcher.coin_symbol(coin_id),
            "days": days,
            "count": len(klines),
            "klines": klines,
        }
    except Exception as e:
        logger.error(f"获取 CoinGecko 数据失败 [{coin_id}]: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"获取行情数据失败: {str(e)}",
        )
