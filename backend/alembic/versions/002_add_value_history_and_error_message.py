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

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # match_participants 新增 value_history 列
    with op.batch_alter_table('match_participants') as batch_op:
        batch_op.add_column(
            sa.Column('value_history', sa.JSON(), nullable=True)
        )

    # matches 新增 error_message 列
    with op.batch_alter_table('matches') as batch_op:
        batch_op.add_column(
            sa.Column('error_message', sa.Text(), nullable=True)
        )


def downgrade() -> None:
    with op.batch_alter_table('match_participants') as batch_op:
        batch_op.drop_column('value_history')

    with op.batch_alter_table('matches') as batch_op:
        batch_op.drop_column('error_message')
