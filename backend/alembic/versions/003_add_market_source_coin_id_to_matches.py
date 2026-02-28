"""add market_source and coin_id to matches

Revision ID: 003
Revises: 002
Create Date: 2026-02-28

新增字段：
- matches.market_source — 行情来源：simulated | coingecko_historical | coingecko_realtime
- matches.coin_id       — CoinGecko 币种 ID，模拟行情时为 NULL
"""

from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("matches") as batch_op:
        batch_op.add_column(sa.Column("market_source", sa.String(30), nullable=True))
        batch_op.add_column(sa.Column("coin_id", sa.String(50), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("matches") as batch_op:
        batch_op.drop_column("market_source")
        batch_op.drop_column("coin_id")
