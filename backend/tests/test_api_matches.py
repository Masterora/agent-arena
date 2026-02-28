"""比赛 API 集成测试（创建策略 → 运行比赛 → 查列表/详情）"""
import pytest
from fastapi.testclient import TestClient


def _create_two_strategies(client: TestClient):
    """创建两个策略，返回 id 列表"""
    ids = []
    for name, stype in [("策略A", "mean_reversion"), ("策略B", "dca")]:
        r = client.post(
            "/api/strategies/",
            json={
                "name": name,
                "type": stype,
                "params": {
                    "lookback_period": 10,
                    "buy_threshold": 0.97,
                    "sell_threshold": 1.03,
                    "position_size": 0.1,
                    "max_position_pct": 0.5,
                },
            },
        )
        assert r.status_code == 201
        ids.append(r.json()["id"])
    return ids


def test_run_match_returns_pending(client: TestClient):
    """POST /run 返回 200 且 status pending，含 match_id"""
    ids = _create_two_strategies(client)
    r = client.post(
        "/api/matches/run",
        json={
            "strategy_ids": ids,
            "market_type": "random",
            "market_source": "simulated",
            "duration_steps": 20,
            "initial_capital": 10000,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "match_id" in data
    assert data.get("status") == "pending"


def test_list_matches(client: TestClient):
    """运行一场后列表能查到该比赛"""
    ids = _create_two_strategies(client)
    client.post(
        "/api/matches/run",
        json={
            "strategy_ids": ids,
            "market_type": "random",
            "market_source": "simulated",
            "duration_steps": 15,
            "initial_capital": 5000,
        },
    )
    r = client.get("/api/matches/")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    # 可能已有后台完成，至少有一条
    assert len(items) >= 1
    assert "id" in items[0] and "status" in items[0] and "config" in items[0]


def test_run_match_requires_two_strategies(client: TestClient):
    """少于 2 个策略：请求体 min_length=2 触发 422 校验失败"""
    r = client.post(
        "/api/strategies/",
        json={
            "name": "Only",
            "type": "dca",
            "params": {
                "lookback_period": 10,
                "buy_threshold": 0.97,
                "sell_threshold": 1.03,
                "position_size": 0.1,
                "max_position_pct": 0.5,
            },
        },
    )
    assert r.status_code == 201
    sid = r.json()["id"]
    r2 = client.post(
        "/api/matches/run",
        json={
            "strategy_ids": [sid],
            "market_type": "random",
            "duration_steps": 10,
            "initial_capital": 10000,
        },
    )
    # Pydantic 校验 strategy_ids 最少 2 个，返回 422
    assert r2.status_code == 422
