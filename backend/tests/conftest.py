"""
pytest 配置：测试用内存 SQLite，避免污染开发库。
必须在导入 app 前设置 DATABASE_URL。
"""
import os
import pytest

# 最先设置，再导入 app（database 会读 settings.database_url）
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base, init_db


@pytest.fixture(scope="session")
def _init_test_db():
    """会话级：建表（lifespan 会调 init_db，此处仅做清理用）"""
    init_db()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_clean(_init_test_db):
    """每个测试前清空表，保持隔离"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client(db_clean):
    """FastAPI TestClient，使用内存库"""
    with TestClient(app) as c:
        yield c
