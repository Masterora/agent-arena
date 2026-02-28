from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional
from loguru import logger

from app.db import models
from app.models import strategy as strategy_schema


# ==================== 策略 CRUD ====================
class StrategyCRUD:

    @staticmethod
    def create(
            db: Session,
            strategy: strategy_schema.StrategyCreate,
            user_id: Optional[str] = None
    ) -> models.Strategy:
        """创建策略"""
        db_strategy = models.Strategy(
            user_id=user_id,
            name=strategy.name,
            type=strategy.type.value,
            params=strategy.params.model_dump(),
            code=strategy.code
        )
        db.add(db_strategy)
        db.commit()
        db.refresh(db_strategy)
        logger.info(f"创建策略: {db_strategy.id} - {db_strategy.name}")
        return db_strategy

    @staticmethod
    def get(db: Session, strategy_id: str) -> Optional[models.Strategy]:
        """获取单个策略"""
        return db.get(models.Strategy, strategy_id)

    @staticmethod
    def get_all(
            db: Session,
            skip: int = 0,
            limit: int = 100,
            user_id: Optional[str] = None,
            is_public: Optional[bool] = None
    ) -> List[models.Strategy]:
        """获取策略列表"""
        stmt = select(models.Strategy)

        if user_id:
            stmt = stmt.where(models.Strategy.user_id == user_id)

        if is_public is not None:
            stmt = stmt.where(models.Strategy.is_public == is_public)

        stmt = stmt.offset(skip).limit(limit).order_by(models.Strategy.created_at.desc())

        return list(db.scalars(stmt).all())

    @staticmethod
    def update(
            db: Session,
            strategy_id: str,
            **kwargs
    ) -> Optional[models.Strategy]:
        """更新策略"""
        db_strategy = StrategyCRUD.get(db, strategy_id)
        if not db_strategy:
            return None

        for key, value in kwargs.items():
            if hasattr(db_strategy, key):
                setattr(db_strategy, key, value)

        db.commit()
        db.refresh(db_strategy)
        logger.info(f"更新策略: {strategy_id}")
        return db_strategy

    @staticmethod
    def delete(db: Session, strategy_id: str) -> bool:
        """删除策略"""
        db_strategy = StrategyCRUD.get(db, strategy_id)
        if not db_strategy:
            return False

        db.delete(db_strategy)
        db.commit()
        logger.info(f"删除策略: {strategy_id}")
        return True

    @staticmethod
    def update_stats(
            db: Session,
            strategy_id: str,
            match_result: dict
    ):
        """更新策略统计数据"""
        db_strategy = StrategyCRUD.get(db, strategy_id)
        if not db_strategy:
            return

        db_strategy.total_matches += 1
        if match_result.get("rank") == 1:
            db_strategy.wins += 1

        db_strategy.win_rate = db_strategy.wins / db_strategy.total_matches

        # 滚动更新平均收益率
        old_total = db_strategy.avg_return * (db_strategy.total_matches - 1)
        db_strategy.avg_return = (old_total + match_result.get("return_pct", 0)) / db_strategy.total_matches

        # 滚动更新最大回撤（取最大值记录历史最坏情况）
        new_dd = match_result.get("max_drawdown", 0.0)
        if new_dd > db_strategy.max_drawdown:
            db_strategy.max_drawdown = new_dd

        # 滚动更新夏普率（滑动平均）
        old_sharpe_total = db_strategy.sharpe_ratio * (db_strategy.total_matches - 1)
        db_strategy.sharpe_ratio = (
            old_sharpe_total + match_result.get("sharpe_ratio", 0.0)
        ) / db_strategy.total_matches

        db.commit()


# ==================== 比赛 CRUD ====================
class MatchCRUD:

    @staticmethod
    def create(
            db: Session,
            config: dict,
            strategy_ids: List[str],
            creator_id: Optional[str] = None
    ) -> models.Match:
        """创建比赛"""
        db_match = models.Match(
            creator_id=creator_id,
            status="pending",
            initial_capital=config["initial_capital"],
            trading_pair=config["trading_pair"],
            timeframe=config["timeframe"],
            duration_steps=config["duration_steps"],
            market_type=config.get("market_type"),
            market_source=config.get("market_source"),
            coin_id=config.get("coin_id"),
        )
        db.add(db_match)
        db.flush()  # 获取 ID 但不提交

        # 创建参与记录
        for strategy_id in strategy_ids:
            participant = models.MatchParticipant(
                match_id=db_match.id,
                strategy_id=strategy_id
            )
            db.add(participant)

        db.commit()
        db.refresh(db_match)
        logger.info(f"创建比赛: {db_match.id}, 参赛策略数: {len(strategy_ids)}")
        return db_match

    @staticmethod
    def get(db: Session, match_id: str) -> Optional[models.Match]:
        """获取比赛"""
        return db.get(models.Match, match_id)

    @staticmethod
    def get_all(
            db: Session,
            skip: int = 0,
            limit: int = 100,
            status: Optional[str] = None
    ) -> List[models.Match]:
        """获取比赛列表"""
        stmt = select(models.Match)

        if status:
            stmt = stmt.where(models.Match.status == status)

        stmt = stmt.offset(skip).limit(limit).order_by(models.Match.created_at.desc())

        return list(db.scalars(stmt).all())

    @staticmethod
    def update_status(
            db: Session,
            match_id: str,
            status: str
    ):
        """更新比赛状态"""
        db_match = MatchCRUD.get(db, match_id)
        if db_match:
            db_match.status = status
            db.commit()

    @staticmethod
    def save_results(
            db: Session,
            match_id: str,
            results: List[dict]
    ):
        """保存比赛结果"""
        for result in results:
            stmt = (
                update(models.MatchParticipant)
                .where(
                    models.MatchParticipant.match_id == match_id,
                    models.MatchParticipant.strategy_id == result["strategy_id"]
                )
                .values(
                    final_value=result["final_value"],
                    return_pct=result["return_pct"],
                    total_trades=result["total_trades"],
                    win_trades=result["win_trades"],
                    rank=result["rank"],
                    max_drawdown=result.get("max_drawdown", 0.0),
                    sharpe_ratio=result.get("sharpe_ratio", 0.0),
                    value_history=result.get("value_history", []),
                )
            )
            db.execute(stmt)

        db.commit()
        logger.info(f"保存比赛结果: {match_id}")

    @staticmethod
    def set_error(db: Session, match_id: str, error: str):
        """记录比赛失败原因"""
        db_match = MatchCRUD.get(db, match_id)
        if db_match:
            db_match.error_message = error
            db.commit()

    @staticmethod
    def delete(db: Session, match_id: str) -> bool:
        """删除比赛"""
        db_match = MatchCRUD.get(db, match_id)
        if not db_match:
            return False
        db.delete(db_match)
        db.commit()
        logger.info(f"删除比赛: {match_id}")
        return True

    @staticmethod
    def add_log(
            db: Session,
            match_id: str,
            step: int,
            data: dict
    ):
        """添加执行日志"""
        log = models.MatchLog(
            match_id=match_id,
            step=step,
            data=data
        )
        db.add(log)
        # 注意：不立即提交，由调用方批量提交
