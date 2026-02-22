"""add user totp_secret for 2FA

Revision ID: 20260219_2fa
Revises: 20260219_ak
Create Date: 2026-02-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260219_2fa"
down_revision: Union[str, None] = "20260219_ak"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("totp_secret", sa.String(32), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "totp_secret")
