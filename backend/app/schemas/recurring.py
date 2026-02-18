"""Recurring transaction schemas."""
from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.models.recurring import RecurrenceFrequency


class RecurringTransactionBase(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    amount: Decimal = Field(..., ge=0)
    transaction_type: str = Field(..., pattern="^(income|expense)$")
    description: Optional[str] = None
    frequency: RecurrenceFrequency
    next_run_date: date


class RecurringTransactionCreate(RecurringTransactionBase):
    pass


class RecurringTransactionUpdate(BaseModel):
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, ge=0)
    transaction_type: Optional[str] = Field(None, pattern="^(income|expense)$")
    description: Optional[str] = None
    frequency: Optional[RecurrenceFrequency] = None
    next_run_date: Optional[date] = None
    is_active: Optional[int] = None


class RecurringTransactionOut(RecurringTransactionBase):
    id: int
    user_id: int
    is_active: int
    created_at: Optional[str] = None
    next_run_date: date

    class Config:
        from_attributes = True
