"""
Backup and restore user data.
"""
import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.recurring import RecurringTransaction

router = APIRouter()
SCHEMA_VERSION = 1


def _serialize(obj):
    if hasattr(obj, "__dict__"):
        d = {}
        for k, v in obj.__dict__.items():
            if k.startswith("_"):
                continue
            if hasattr(v, "isoformat"):
                v = v.isoformat()
            elif hasattr(v, "value"):
                v = v.value
            d[k] = v
        return d
    return obj


@router.get("")
async def export_backup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export all user data as JSON (accounts, transactions, budgets, goals, recurring)."""
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    account_ids = [a.id for a in accounts]
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    recurring = db.query(RecurringTransaction).filter(RecurringTransaction.user_id == current_user.id).all()
    payload = {
        "schema_version": SCHEMA_VERSION,
        "user_id": current_user.id,
        "accounts": [_serialize(a) for a in accounts],
        "transactions": [_serialize(t) for t in transactions],
        "budgets": [_serialize(b) for b in budgets],
        "goals": [_serialize(g) for g in goals],
        "recurring": [_serialize(r) for r in recurring],
    }
    return payload


@router.post("/restore")
async def restore_backup(
    file: UploadFile = File(...),
    confirm: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Restore from a backup JSON file. Requires confirm=true."""
    if not confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Set confirm=true to restore.")
    if not file.filename or not file.filename.lower().endswith(".json"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be a JSON backup.")
    content = await file.read()
    try:
        data = json.loads(content.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid JSON: {e}")
    if data.get("schema_version") != SCHEMA_VERSION or data.get("user_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Backup user_id or version mismatch.")
    # Dry-run: only validate structure; actual restore would require mapping old IDs and clearing/inserting.
    return {"message": "Backup file validated. Full restore not implemented in this version; use export for backup."}