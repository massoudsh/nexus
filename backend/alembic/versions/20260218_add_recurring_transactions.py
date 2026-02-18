"""add recurring_transactions table

Revision ID: 20260218_rec
Revises: 20260216_pay
Create Date: 2026-02-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260218_rec"
down_revision: Union[str, None] = "20260216_pay"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "recurring_transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("transaction_type", sa.String(20), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("frequency", sa.Enum("weekly", "monthly", "yearly", name="recurrencefrequency"), nullable=False),
        sa.Column("next_run_date", sa.Date(), nullable=False),
        sa.Column("is_active", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recurring_transactions_next_run_date"), "recurring_transactions", ["next_run_date"], unique=False)
    op.create_index(op.f("ix_recurring_transactions_id"), "recurring_transactions", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_recurring_transactions_id"), table_name="recurring_transactions")
    op.drop_index(op.f("ix_recurring_transactions_next_run_date"), table_name="recurring_transactions")
    op.drop_table("recurring_transactions")
