"""add user dashboard_preferences

Revision ID: 20260219_dash
Revises: 20260219_2fa
Create Date: 2026-02-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260219_dash"
down_revision: Union[str, None] = "20260219_2fa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("dashboard_preferences", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "dashboard_preferences")
