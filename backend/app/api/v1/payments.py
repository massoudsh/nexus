"""
Payments API: ZarinPal gateway (request payment, callback verify).
"""
from typing import List
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.services import zarinpal_service
from app.core.config import settings
from app.db.session import get_db
from app.dependencies import get_current_user
from datetime import datetime, timezone
from app.models.user import User
from app.models.payment import Payment
from app.models.transaction import TransactionType
from app.schemas.payment import ZarinPalRequestIn, ZarinPalRequestOut, PaymentOut, RecordIncomeIn
from app.schemas.transaction import Transaction as TransactionSchema
from app.services.transactions_service import TransactionsService
from app.schemas.transaction import TransactionCreate

router = APIRouter()

# Frontend URLs for redirect after callback (query params added by backend)
FRONTEND_SUCCESS_DEFAULT = "http://localhost:3000/dashboard?payment=success"
FRONTEND_FAIL_DEFAULT = "http://localhost:3000/dashboard?payment=failed"


def _frontend_success_url(ref_id: str = "", amount_rials: int = 0) -> str:
    base = getattr(settings, "FRONTEND_URL", None) or "http://localhost:3000"
    return f"{base.rstrip('/')}/dashboard?payment=success&ref_id={ref_id}&amount_rials={amount_rials}"


def _frontend_fail_url(message: str = "") -> str:
    base = getattr(settings, "FRONTEND_URL", None) or "http://localhost:3000"
    return f"{base.rstrip('/')}/dashboard?payment=failed&message={quote(message, safe='')}"


@router.post("/zarinpal/request", response_model=ZarinPalRequestOut)
async def zarinpal_request(
    body: ZarinPalRequestIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a ZarinPal payment request. Frontend should redirect the user to `payment_url`."""
    if not zarinpal_service.is_enabled():
        raise HTTPException(status_code=503, detail="ZarinPal payment gateway is not configured.")
    payment_url, authority, err = await zarinpal_service.request_payment(
        db,
        current_user.id,
        body.amount_rials,
        body.description or "Nexus payment",
        email=body.email,
        mobile=body.mobile,
    )
    if err:
        raise HTTPException(status_code=400, detail=err)
    return ZarinPalRequestOut(
        payment_url=payment_url,
        authority=authority,
        amount_rials=body.amount_rials,
    )


@router.get("/zarinpal/callback")
async def zarinpal_callback(
    Authority: str = Query(..., alias="Authority"),
    Status: str = Query(..., alias="Status"),
    db: Session = Depends(get_db),
):
    """
    ZarinPal redirects the user here after payment. We verify the payment and redirect to frontend.
    Query params: Authority, Status (from ZarinPal).
    """
    if Status != "OK":
        return RedirectResponse(url=_frontend_fail_url(message="payment_cancelled_or_failed"))
    payment, err = await zarinpal_service.verify_payment(db, Authority)
    if err or not payment:
        return RedirectResponse(url=_frontend_fail_url(message=err or "verification_failed"))
    return RedirectResponse(
        url=_frontend_success_url(
            ref_id=payment.ref_id or "",
            amount_rials=int(payment.amount_rials),
        )
    )


@router.get("/", response_model=List[PaymentOut])
async def list_payments(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List current user's payments (ZarinPal and others)."""
    payments = (
        db.query(Payment)
        .filter(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        PaymentOut(
            id=p.id,
            amount_rials=int(p.amount_rials),
            description=p.description,
            authority=p.authority,
            status=p.status,
            ref_id=p.ref_id,
            gateway=p.gateway,
            created_at=p.created_at.isoformat() if p.created_at else None,
        )
        for p in payments
    ]


@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single payment by ID."""
    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id, Payment.user_id == current_user.id)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return PaymentOut(
        id=payment.id,
        amount_rials=int(payment.amount_rials),
        description=payment.description,
        authority=payment.authority,
        status=payment.status,
        ref_id=payment.ref_id,
        gateway=payment.gateway,
        created_at=payment.created_at.isoformat() if payment.created_at else None,
    )


@router.post("/{payment_id}/record-income", response_model=TransactionSchema, status_code=201)
async def record_payment_as_income(
    payment_id: int,
    body: RecordIncomeIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record a completed payment as an income transaction in the given account."""
    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id, Payment.user_id == current_user.id)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.status != "completed":
        raise HTTPException(status_code=400, detail="Only completed payments can be recorded as income")
    amount = float(payment.amount_rials)
    description = f"ZarinPal payment"
    if payment.ref_id:
        description += f" (Ref: {payment.ref_id})"
    if payment.description:
        description += f" — {payment.description}"
    tx_data = TransactionCreate(
        account_id=body.account_id,
        category_id=None,
        amount=amount,
        transaction_type=TransactionType.INCOME,
        description=description,
        date=datetime.now(timezone.utc),
        notes=None,
    )
    service = TransactionsService(db)
    try:
        transaction = service.create_transaction(tx_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return transaction
