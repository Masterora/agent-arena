from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
from pathlib import Path
from app.config import settings
from loguru import logger


# SQLAlchemy 2.0 风格的 Base
class Base(DeclarativeBase):
    pass


# 创建引擎
def create_db_engine():
    """根据配置创建数据库引擎"""

    if settings.is_sqlite:
        # SQLite 配置 - 确保数据库目录存在
        db_path = settings.database_url.replace("sqlite:///", "")
        db_file = Path(db_path)
        db_file.parent.mkdir(parents=True, exist_ok=True)
        logger.info(f"确保数据库目录存在: {db_file.parent}")

        # SQLite 配置
        engine = create_engine(
            settings.database_url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,  # SQLite 使用单例连接池
            echo=settings.db_echo,
        )

        # SQLite 启用外键约束
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_conn, connection_record):
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    else:
        # PostgreSQL/MySQL 配置
        engine = create_engine(
            settings.database_url,
            pool_size=settings.db_pool_size,
            max_overflow=settings.db_max_overflow,
            pool_timeout=settings.db_pool_timeout,
            pool_recycle=settings.db_pool_recycle,
            pool_pre_ping=True,
            echo=settings.db_echo,
        )

    return engine


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """依赖注入：获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库(创建所有表)"""
    logger.info(f"初始化数据库: {settings.database_url}")

    # 导入所有模型(确保被注册)
    from app.db import models

    # 创建所有表
    Base.metadata.create_all(bind=engine)

    logger.info("✅ 数据库初始化完成")


def drop_db():
    """删除所有表(仅用于测试)"""
    logger.warning("⚠️  删除所有数据库表")
    Base.metadata.drop_all(bind=engine)
