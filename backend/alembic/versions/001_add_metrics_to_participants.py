"""add max_drawdown and sharpe_ratio to match_participants

Revision ID: 001
Revises:
Create Date: 2026-02-27
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add max_drawdown column (nullable=False with default 0.0)
    with op.batch_alter_table('match_participants') as batch_op:
        batch_op.add_column(
            sa.Column('max_drawdown', sa.Float(), nullable=False, server_default='0.0')
        )
        batch_op.add_column(
            sa.Column('sharpe_ratio', sa.Float(), nullable=False, server_default='0.0')
        )


def downgrade() -> None:
    with op.batch_alter_table('match_participants') as batch_op:
        batch_op.drop_column('sharpe_ratio')
        batch_op.drop_column('max_drawdown')
