from sqlalchemy import String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import List, Optional
import uuid

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


# ==================== 用户表 ====================
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    strategies: Mapped[List["Strategy"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    matches: Mapped[List["Match"]] = relationship(back_populates="creator")

    def __repr__(self):
        return f"<User {self.username}>"


# ==================== 策略表 ====================
class Strategy(Base):
    __tablename__ = "strategies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    params: Mapped[dict] = mapped_column(JSON, nullable=False)
    code: Mapped[Optional[str]] = mapped_column(Text)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)

    # 统计数据
    total_matches: Mapped[int] = mapped_column(Integer, default=0)
    wins: Mapped[int] = mapped_column(Integer, default=0)
    win_rate: Mapped[float] = mapped_column(Float, default=0.0)
    avg_return: Mapped[float] = mapped_column(Float, default=0.0)
    total_return: Mapped[float] = mapped_column(Float, default=0.0)
    sharpe_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    max_drawdown: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    user: Mapped[Optional["User"]] = relationship(back_populates="strategies")
    participants: Mapped[List["MatchParticipant"]] = relationship(back_populates="strategy")

    def __repr__(self):
        return f"<Strategy {self.name} ({self.type})>"


# ==================== 比赛表 ====================
class Match(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    creator_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), nullable=False)

    # 配置
    initial_capital: Mapped[float] = mapped_column(Float, nullable=False)
    trading_pair: Mapped[str] = mapped_column(String(20), nullable=False)
    timeframe: Mapped[str] = mapped_column(String(10), nullable=False)
    duration_steps: Mapped[int] = mapped_column(Integer, nullable=False)
    market_type: Mapped[Optional[str]] = mapped_column(String(20))

    # 时间
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # 关系
    creator: Mapped[Optional["User"]] = relationship(back_populates="matches")
    participants: Mapped[List["MatchParticipant"]] = relationship(back_populates="match", cascade="all, delete-orphan")
    logs: Mapped[List["MatchLog"]] = relationship(back_populates="match", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Match {self.id} ({self.status})>"


# ==================== 比赛参与表 ====================
class MatchParticipant(Base):
    __tablename__ = "match_participants"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    match_id: Mapped[str] = mapped_column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    strategy_id: Mapped[str] = mapped_column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"),
                                             nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"))

    # 结果
    final_value: Mapped[Optional[float]] = mapped_column(Float)
    return_pct: Mapped[Optional[float]] = mapped_column(Float)
    total_trades: Mapped[int] = mapped_column(Integer, default=0)
    win_trades: Mapped[int] = mapped_column(Integer, default=0)
    rank: Mapped[Optional[int]] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # 关系
    match: Mapped["Match"] = relationship(back_populates="participants")
    strategy: Mapped["Strategy"] = relationship(back_populates="participants")

    # 唯一约束（保留，这不是索引）
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


# ==================== 比赛日志表 ====================
class MatchLog(Base):
    __tablename__ = "match_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    match_id: Mapped[str] = mapped_column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    step: Mapped[int] = mapped_column(Integer, nullable=False)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # 关系
    match: Mapped["Match"] = relationship(back_populates="logs")


# ==================== 市场数据表 ====================
class MarketData(Base):
    __tablename__ = "market_data"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timeframe: Mapped[str] = mapped_column(String(10), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)


# ==================== 投注表（未来功能）====================
class Bet(Base):
    __tablename__ = "bets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"))
    match_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("matches.id"))
    strategy_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("strategies.id"))

    amount: Mapped[float] = mapped_column(Float, nullable=False)
    odds: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    payout: Mapped[Optional[float]] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
