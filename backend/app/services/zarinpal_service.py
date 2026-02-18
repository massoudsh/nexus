"""
ZarinPal payment gateway service.
Request payment → redirect user → callback with Authority → verify.
Uses ZarinPal WebGate API (PaymentRequest.json / PaymentVerification.json).
"""
import logging
from decimal import Decimal
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.payment import Payment

logger = logging.getLogger(__name__)

# WebGate endpoints (amount in Rials)
ZARINPAL_SANDBOX_BASE = "https://sandbox.zarinpal.com/pg/rest/WebGate"
ZARINPAL_PROD_BASE = "https://api.zarinpal.com/pg/rest/WebGate"
# Start pay URL (user redirect)
ZARINPAL_SANDBOX_STARTPAY = "https://sandbox.zarinpal.com/pg/StartPay"
ZARINPAL_PROD_STARTPAY = "https://www.zarinpal.com/pg/StartPay"


def _base_url() -> str:
    return ZARINPAL_SANDBOX_BASE if settings.ZARINPAL_SANDBOX else ZARINPAL_PROD_BASE


def _start_pay_url() -> str:
    return ZARINPAL_SANDBOX_STARTPAY if settings.ZARINPAL_SANDBOX else ZARINPAL_PROD_STARTPAY


def is_enabled() -> bool:
    return bool(settings.ZARINPAL_MERCHANT_ID and settings.ZARINPAL_CALLBACK_BASE_URL)


async def request_payment(
    db: Session,
    user_id: int,
    amount_rials: int,
    description: str,
    *,
    email: Optional[str] = None,
    mobile: Optional[str] = None,
) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Request a payment from ZarinPal. Returns (payment_url, authority, error_message).
    If success, redirect user to payment_url; store authority for verification in callback.
    """
    if not is_enabled():
        return None, None, "ZarinPal is not configured (merchant ID or callback URL missing)."
    if amount_rials < 1000:  # minimum typically 1000 Rials
        return None, None, "Amount must be at least 1000 Rials."

    callback_url = f"{settings.ZARINPAL_CALLBACK_BASE_URL.rstrip('/')}{settings.API_V1_STR}/payments/zarinpal/callback"
    payload = {
        "MerchantID": settings.ZARINPAL_MERCHANT_ID,
        "Amount": amount_rials,
        "Description": description[:255] if description else "Nexus payment",
        "CallbackURL": callback_url,
    }
    if email:
        payload["Email"] = email
    if mobile:
        payload["Mobile"] = mobile

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(f"{_base_url()}/PaymentRequest.json", json=payload)
            data = r.json()
    except Exception as e:
        logger.exception("ZarinPal PaymentRequest failed: %s", e)
        return None, None, "Payment gateway request failed."

    status = data.get("Status")
    authority = data.get("Authority") if status == 100 else None
    if status != 100 or not authority:
        err = data.get("errors", {}).get("message", data.get("errors", "Unknown error"))
        return None, None, f"Gateway error: {err}"

    # Persist payment record for verification in callback
    payment = Payment(
        user_id=user_id,
        amount_rials=Decimal(amount_rials),
        description=description or None,
        authority=authority,
        status="pending",
        gateway="zarinpal",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    payment_url = f"{_start_pay_url()}/{authority}"
    return payment_url, authority, None


async def verify_payment(
    db: Session,
    authority: str,
) -> tuple[Optional[Payment], Optional[str]]:
    """
    Verify payment with ZarinPal using Authority from callback.
    Returns (payment, error_message). If success, payment is updated with ref_id and status=completed.
    """
    if not is_enabled():
        return None, "ZarinPal is not configured."

    payment = db.query(Payment).filter(
        Payment.authority == authority,
        Payment.gateway == "zarinpal",
        Payment.status == "pending",
    ).first()
    if not payment:
        return None, "Payment not found or already processed."

    payload = {
        "MerchantID": settings.ZARINPAL_MERCHANT_ID,
        "Authority": authority,
        "Amount": int(payment.amount_rials),
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(f"{_base_url()}/PaymentVerification.json", json=payload)
            data = r.json()
    except Exception as e:
        logger.exception("ZarinPal PaymentVerification failed: %s", e)
        payment.status = "failed"
        db.commit()
        return None, "Verification request failed."

    status = data.get("Status")
    ref_id = data.get("RefID") if status == 100 else None
    if status != 100:
        payment.status = "failed"
        db.commit()
        err = data.get("errors", {}).get("message", data.get("errors", "Verification failed"))
        return None, str(err)

    payment.status = "completed"
    payment.ref_id = str(ref_id) if ref_id else None
    db.commit()
    db.refresh(payment)
    return payment, None
