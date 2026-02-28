"""完整流程测试"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import requests
import json
from loguru import logger

# 与 README 一致：后端默认 9000，可通过环境变量覆盖
BASE_URL = os.environ.get("AGENT_ARENA_API_URL", "http://localhost:9000")


def test_full_flow():
    """测试完整流程"""

    logger.info("🧪 开始完整流程测试")

    # 1. 创建策略
    logger.info("\n1️⃣ 创建策略...")
    strategies = []

    strategy_data = [
        {
            "name": "均值回归策略",
            "type": "mean_reversion",
            "params": {
                "lookback_period": 20,
                "buy_threshold": 0.97,
                "sell_threshold": 1.03,
                "position_size": 0.2,
                "max_position_pct": 0.5
            }
        },
        {
            "name": "动量策略",
            "type": "momentum",
            "params": {
                "lookback_period": 10,
                "buy_threshold": 1.02,
                "sell_threshold": 0.98,
                "position_size": 0.3,
                "max_position_pct": 0.5
            }
        },
        {
            "name": "定投策略",
            "type": "dca",
            "params": {
                "lookback_period": 10,
                "buy_threshold": 0.97,
                "sell_threshold": 1.03,
                "position_size": 0.1,
                "max_position_pct": 0.5
            }
        }
    ]

    for data in strategy_data:
        response = requests.post(f"{BASE_URL}/api/strategies/", json=data)
        if response.status_code == 201:
            strategy = response.json()
            strategies.append(strategy)
            logger.info(f"✅ 创建策略: {strategy['name']} ({strategy['id']})")
        else:
            logger.error(f"❌ 创建策略失败: {response.text}")
            return

    # 2. 查看策略列表
    logger.info("\n2️⃣ 查看策略列表...")
    response = requests.get(f"{BASE_URL}/api/strategies/")
    if response.status_code == 200:
        all_strategies = response.json()
        logger.info(f"✅ 共有 {len(all_strategies)} 个策略")

    # 3. 运行比赛
    logger.info("\n3️⃣ 运行比赛...")
    match_request = {
        "strategy_ids": [s["id"] for s in strategies],
        "market_type": "trending",
        "duration_steps": 100,
        "initial_capital": 10000.0
    }

    response = requests.post(f"{BASE_URL}/api/matches/run", json=match_request)
    if response.status_code == 200:
        match_result = response.json()
        match_id = match_result["match_id"]
        logger.info(f"✅ 比赛创建成功: {match_id}")
        logger.info(f"   状态: {match_result['status']}")

        # 显示结果
        logger.info("\n📊 比赛结果:")
        for result in match_result["results"]:
            strategy_name = next(s["name"] for s in strategies if s["id"] == result["strategy_id"])
            logger.info(f"   #{result['rank']} {strategy_name}")
            logger.info(f"      收益率: {result['return_pct']:.2f}%")
            logger.info(f"      最终价值: ${result['final_value']:.2f}")
            logger.info(f"      交易次数: {result['total_trades']}")
    else:
        logger.error(f"❌ 运行比赛失败: {response.text}")
        return

    # 4. 查看比赛详情
    logger.info("\n4️⃣ 查看比赛详情...")
    response = requests.get(f"{BASE_URL}/api/matches/{match_id}")
    if response.status_code == 200:
        match_detail = response.json()
        logger.info(f"✅ 比赛详情:")
        logger.info(f"   ID: {match_detail['id']}")
        logger.info(f"   状态: {match_detail['status']}")
        logger.info(f"   参赛策略: {len(match_detail['participants'])}")

    # 5. 查看更新后的策略统计
    logger.info("\n5️⃣ 查看策略统计...")
    for strategy in strategies:
        response = requests.get(f"{BASE_URL}/api/strategies/{strategy['id']}")
        if response.status_code == 200:
            updated_strategy = response.json()
            logger.info(f"\n📈 {updated_strategy['name']}")
            logger.info(f"   总比赛数: {updated_strategy['total_matches']}")
            logger.info(f"   胜场: {updated_strategy['wins']}")
            logger.info(f"   胜率: {updated_strategy['win_rate']:.2%}")
            logger.info(f"   平均收益: {updated_strategy['avg_return']:.2f}%")

    logger.info("\n🎉 完整流程测试通过！")


if __name__ == "__main__":
    test_full_flow()
