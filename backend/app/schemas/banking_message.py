"""
Banking message schemas.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Any
from pydantic import BaseModel


class BankingMessageCreate(BaseModel):
    raw_text: str
    source: Optional[str] = None


class BankingMessage(BaseModel):
    id: int
    user_id: int
    raw_text: str
    source: Optional[str] = None
    parsed_amount: Optional[float] = None
    parsed_date: Optional[datetime] = None
    parsed_description: Optional[str] = None
    parsed_type: Optional[str] = None
    suggested_category_id: Optional[int] = None
    transaction_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ParseResult(BaseModel):
    amount: Optional[float] = None
    date: Optional[str] = None
    description: Optional[str] = None
    transaction_type: str = "expense"
    suggested_category_id: Optional[int] = None
    suggested_category_name: Optional[str] = None


class CreateTransactionFromMessage(BaseModel):
    account_id: int
    category_id: Optional[int] = None  # override AI suggestion
