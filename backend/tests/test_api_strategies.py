"""策略 API 集成测试"""
import pytest
from fastapi.testclient import TestClient


def test_create_and_list_strategies(client: TestClient):
    """创建策略并拉取列表"""
    payload = {
        "name": "测试均值回归",
        "type": "mean_reversion",
        "params": {
            "lookback_period": 20,
            "buy_threshold": 0.97,
            "sell_threshold": 1.03,
            "position_size": 0.2,
            "max_position_pct": 0.5,
        },
    }
    r = client.post("/api/strategies/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["type"] == payload["type"]
    strategy_id = data["id"]

    r2 = client.get("/api/strategies/")
    assert r2.status_code == 200
    items = r2.json()
    assert isinstance(items, list)
    assert any(s["id"] == strategy_id for s in items)


def test_get_strategy_by_id(client: TestClient):
    """创建后按 id 获取"""
    payload = {
        "name": "单策略",
        "type": "dca",
        "params": {
            "lookback_period": 10,
            "buy_threshold": 0.97,
            "sell_threshold": 1.03,
            "position_size": 0.1,
            "max_position_pct": 0.5,
        },
    }
    r = client.post("/api/strategies/", json=payload)
    assert r.status_code == 201
    sid = r.json()["id"]

    r2 = client.get(f"/api/strategies/{sid}")
    assert r2.status_code == 200
    assert r2.json()["id"] == sid
    assert r2.json()["name"] == payload["name"]


def test_get_strategy_404(client: TestClient):
    """不存在的 id 返回 404"""
    r = client.get("/api/strategies/non-existent-id")
    assert r.status_code == 404


def test_create_strategy_validation(client: TestClient):
    """错误 type 返回 422"""
    r = client.post(
        "/api/strategies/",
        json={
            "name": "x",
            "type": "invalid_type",
            "params": {"lookback_period": 10, "buy_threshold": 0.97, "sell_threshold": 1.03},
        },
    )
    assert r.status_code == 422
