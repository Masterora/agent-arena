"""add max_drawdown and sharpe_ratio to match_participants

Revision ID: 001
Revises:
Create Date: 2026-02-27
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def _table_columns(conn, table_name: str):
    return [c["name"] for c in inspect(conn).get_columns(table_name)]


def upgrade() -> None:
    conn = op.get_bind()
    cols = _table_columns(conn, "match_participants")
    with op.batch_alter_table('match_participants') as batch_op:
        if 'max_drawdown' not in cols:
            batch_op.add_column(
                sa.Column('max_drawdown', sa.Float(), nullable=False, server_default='0.0')
            )
        if 'sharpe_ratio' not in cols:
            batch_op.add_column(
                sa.Column('sharpe_ratio', sa.Float(), nullable=False, server_default='0.0')
            )


def downgrade() -> None:
    with op.batch_alter_table('match_participants') as batch_op:
        batch_op.drop_column('sharpe_ratio')
        batch_op.drop_column('max_drawdown')
