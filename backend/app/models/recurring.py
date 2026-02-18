"""
Recurring transaction model for scheduled income/expenses.
"""
import enum
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class RecurrenceFrequency(str, enum.Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class RecurringTransaction(Base):
    """Recurring transaction template (e.g. monthly rent, salary)."""
    __tablename__ = "recurring_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # income | expense
    description = Column(Text, nullable=True)
    frequency = Column(Enum(RecurrenceFrequency), nullable=False)
    next_run_date = Column(Date, nullable=False, index=True)
    is_active = Column(Integer, default=1, nullable=False)  # 1=active, 0=paused
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="recurring_transactions")
    account = relationship("Account", back_populates="recurring_transactions")

    def __repr__(self):
        return f"<RecurringTransaction(id={self.id}, amount={self.amount}, frequency={self.frequency}, next={self.next_run_date})>"
