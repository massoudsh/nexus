"""Payment (ZarinPal) schemas."""
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class ZarinPalRequestIn(BaseModel):
    """Request a ZarinPal payment (amount in Rials)."""
    amount_rials: int = Field(..., ge=1000, description="Amount in Rials (min 1000)")
    description: str = Field("", max_length=255)
    email: Optional[str] = None
    mobile: Optional[str] = None


class ZarinPalRequestOut(BaseModel):
    """Response after creating payment request: redirect user to payment_url."""
    payment_url: str
    authority: str
    amount_rials: int


class ZarinPalCallbackRedirect(BaseModel):
    """After verify: where to redirect the user (frontend)."""
    success: bool
    message: Optional[str] = None
    ref_id: Optional[str] = None
    amount_rials: Optional[int] = None


class PaymentOut(BaseModel):
    """Payment record (for list/detail)."""
    id: int
    amount_rials: int
    description: Optional[str]
    authority: Optional[str]
    status: str
    ref_id: Optional[str]
    gateway: str
    created_at: Optional[str]

    class Config:
        from_attributes = True


class RecordIncomeIn(BaseModel):
    """Record a completed payment as income in an account."""
    account_id: int
