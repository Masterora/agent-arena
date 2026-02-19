"""数据库管理脚本"""
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import click
from loguru import logger
from app.database import init_db, drop_db, engine
from app.db.crud import StrategyCRUD
from app.models.strategy import StrategyCreate, StrategyType, StrategyParams


@click.group()
def cli():
    """数据库管理工具"""
    pass


@cli.command()
def init():
    """初始化数据库"""
    logger.info("初始化数据库...")
    init_db()
    logger.info("✅ 数据库初始化完成")


@cli.command()
def drop():
    """删除所有表"""
    if click.confirm("⚠️  确定要删除所有数据吗？", abort=True):
        logger.warning("删除所有表...")
        drop_db()
        logger.info("✅ 数据库已清空")


@cli.command()
def reset():
    """重置数据库"""
    if click.confirm("⚠️  确定要重置数据库吗？", abort=True):
        logger.warning("重置数据库...")
        drop_db()
        init_db()
        logger.info("✅ 数据库已重置")


@cli.command()
def seed():
    """填充测试数据"""
    from app.database import SessionLocal

    logger.info("填充测试数据...")
    db = SessionLocal()

    try:
        # 创建测试策略
        strategies_data = [
            {
                "name": "均值回归策略",
                "type": StrategyType.MEAN_REVERSION,
                "params": StrategyParams(
                    lookback_period=20,
                    buy_threshold=0.97,
                    sell_threshold=1.03,
                    position_size=0.2
                )
            },
            {
                "name": "动量追踪策略",
                "type": StrategyType.MOMENTUM,
                "params": StrategyParams(
                    lookback_period=10,
                    buy_threshold=1.02,
                    sell_threshold=0.98,
                    position_size=0.3
                )
            },
            {
                "name": "定投策略",
                "type": StrategyType.DCA,
                "params": StrategyParams(
                    lookback_period=10,
                    buy_threshold=0.97,
                    sell_threshold=1.03,
                    position_size=0.1
                )
            }
        ]

        for data in strategies_data:
            strategy = StrategyCreate(**data)
            db_strategy = StrategyCRUD.create(db, strategy)
            logger.info(f"创建策略: {db_strategy.name} ({db_strategy.id})")

        logger.info("✅ 测试数据填充完成")

    except Exception as e:
        logger.error(f"填充数据失败: {str(e)}")
        db.rollback()
    finally:
        db.close()


@cli.command()
def info():
    """显示数据库信息"""
    from sqlalchemy import inspect

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    logger.info(f"数据库: {engine.url}")
    logger.info(f"表数量: {len(tables)}")

    for table in tables:
        columns = inspector.get_columns(table)
        logger.info(f"\n📋 表: {table}")
        logger.info(f"   列数: {len(columns)}")
        for col in columns:
            logger.info(f"   - {col['name']}: {col['type']}")


if __name__ == "__main__":
    cli()
