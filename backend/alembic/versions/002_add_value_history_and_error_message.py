"""add value_history and error_message

Revision ID: 002
Revises: 001
Create Date: 2026-02-27

新增字段：
- match_participants.value_history  — 每步资产价值序列（JSON）
- matches.error_message             — 比赛失败原因（Text）
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def _table_columns(conn, table_name: str):
    return [c["name"] for c in inspect(conn).get_columns(table_name)]


def upgrade() -> None:
    conn = op.get_bind()
    part_cols = _table_columns(conn, 'match_participants')
    match_cols = _table_columns(conn, 'matches')
    if 'value_history' not in part_cols:
        with op.batch_alter_table('match_participants') as batch_op:
            batch_op.add_column(sa.Column('value_history', sa.JSON(), nullable=True))
    if 'error_message' not in match_cols:
        with op.batch_alter_table('matches') as batch_op:
            batch_op.add_column(sa.Column('error_message', sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('match_participants') as batch_op:
        batch_op.drop_column('value_history')

    with op.batch_alter_table('matches') as batch_op:
        batch_op.drop_column('error_message')
