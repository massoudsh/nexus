"""Recurring transactions API."""
from datetime import date, datetime, time as dt_time
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.recurring import RecurringTransaction, RecurrenceFrequency
from app.models.account import Account
from app.schemas.recurring import RecurringTransactionCreate, RecurringTransactionUpdate, RecurringTransactionOut
from app.schemas.transaction import TransactionCreate
from app.models.transaction import TransactionType
from app.services.transactions_service import TransactionsService

router = APIRouter()


def _next_run(freq: RecurrenceFrequency, from_date: date) -> date:
    if freq == RecurrenceFrequency.WEEKLY:
        from datetime import timedelta
        return from_date + timedelta(days=7)
    if freq == RecurrenceFrequency.MONTHLY:
        if from_date.month == 12:
            return from_date.replace(year=from_date.year + 1, month=1)
        return from_date.replace(month=from_date.month + 1)
    if freq == RecurrenceFrequency.YEARLY:
        return from_date.replace(year=from_date.year + 1)
    return from_date


@router.get("/", response_model=List[RecurringTransactionOut])
async def list_recurring(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List current user's recurring transactions."""
    rows = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.user_id == current_user.id)
        .order_by(RecurringTransaction.next_run_date.asc())
        .limit(limit)
        .all()
    )
    return [
        RecurringTransactionOut(
            id=r.id,
            user_id=r.user_id,
            account_id=r.account_id,
            category_id=r.category_id,
            amount=r.amount,
            transaction_type=r.transaction_type,
            description=r.description,
            frequency=r.frequency,
            next_run_date=r.next_run_date,
            is_active=r.is_active,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in rows
    ]


@router.post("/", response_model=RecurringTransactionOut, status_code=status.HTTP_201_CREATED)
async def create_recurring(
    body: RecurringTransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a recurring transaction."""
    account = db.query(Account).filter(
        Account.id == body.account_id,
        Account.user_id == current_user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    rec = RecurringTransaction(
        user_id=current_user.id,
        account_id=body.account_id,
        category_id=body.category_id,
        amount=body.amount,
        transaction_type=body.transaction_type,
        description=body.description,
        frequency=body.frequency,
        next_run_date=body.next_run_date,
        is_active=1,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return RecurringTransactionOut(
        id=rec.id,
        user_id=rec.user_id,
        account_id=rec.account_id,
        category_id=rec.category_id,
        amount=rec.amount,
        transaction_type=rec.transaction_type,
        description=rec.description,
        frequency=rec.frequency,
        next_run_date=rec.next_run_date,
        is_active=rec.is_active,
        created_at=rec.created_at.isoformat() if rec.created_at else None,
    )


@router.get("/{rec_id}", response_model=RecurringTransactionOut)
async def get_recurring(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single recurring transaction."""
    rec = db.query(RecurringTransaction).filter(
        RecurringTransaction.id == rec_id,
        RecurringTransaction.user_id == current_user.id,
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    return RecurringTransactionOut(
        id=rec.id,
        user_id=rec.user_id,
        account_id=rec.account_id,
        category_id=rec.category_id,
        amount=rec.amount,
        transaction_type=rec.transaction_type,
        description=rec.description,
        frequency=rec.frequency,
        next_run_date=rec.next_run_date,
        is_active=rec.is_active,
        created_at=rec.created_at.isoformat() if rec.created_at else None,
    )


@router.patch("/{rec_id}", response_model=RecurringTransactionOut)
async def update_recurring(
    rec_id: int,
    body: RecurringTransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a recurring transaction."""
    rec = db.query(RecurringTransaction).filter(
        RecurringTransaction.id == rec_id,
        RecurringTransaction.user_id == current_user.id,
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    data = body.model_dump(exclude_unset=True)
    if "account_id" in data:
        acc = db.query(Account).filter(Account.id == data["account_id"], Account.user_id == current_user.id).first()
        if not acc:
            raise HTTPException(status_code=400, detail="Account not found")
    for k, v in data.items():
        setattr(rec, k, v)
    db.commit()
    db.refresh(rec)
    return RecurringTransactionOut(
        id=rec.id,
        user_id=rec.user_id,
        account_id=rec.account_id,
        category_id=rec.category_id,
        amount=rec.amount,
        transaction_type=rec.transaction_type,
        description=rec.description,
        frequency=rec.frequency,
        next_run_date=rec.next_run_date,
        is_active=rec.is_active,
        created_at=rec.created_at.isoformat() if rec.created_at else None,
    )


@router.delete("/{rec_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recurring(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a recurring transaction."""
    rec = db.query(RecurringTransaction).filter(
        RecurringTransaction.id == rec_id,
        RecurringTransaction.user_id == current_user.id,
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    db.delete(rec)
    db.commit()


@router.post("/run-now")
async def run_recurring_now(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Process due recurring transactions: create a transaction for each where next_run_date <= today,
    then advance next_run_date. Idempotent per (recurring_id, next_run_date). Call from cron or manually.
    """
    today = date.today()
    due = (
        db.query(RecurringTransaction)
        .filter(
            RecurringTransaction.user_id == current_user.id,
            RecurringTransaction.is_active == 1,
            RecurringTransaction.next_run_date <= today,
        )
        .all()
    )
    tx_service = TransactionsService(db)
    created = 0
    for rec in due:
        run_date = rec.next_run_date
        tx_date = datetime.combine(run_date, dt_time.min)
        try:
            tx_service.create_transaction(
                TransactionCreate(
                    account_id=rec.account_id,
                    category_id=rec.category_id,
                    amount=rec.amount,
                    transaction_type=TransactionType(rec.transaction_type) if isinstance(rec.transaction_type, str) else rec.transaction_type,
                    description=rec.description or f"Recurring #{rec.id}",
                    date=tx_date,
                ),
                current_user.id,
                skip_duplicate_check=True,
            )
        except Exception:
            continue
        rec.next_run_date = _next_run(rec.frequency, run_date)
        created += 1
    db.commit()
    return {"processed": len(due), "created": created}
