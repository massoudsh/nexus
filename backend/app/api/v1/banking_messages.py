"""
Banking messages API: ingest messages, parse, suggest category, create transaction.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.category import Category
from app.schemas.banking_message import (
    BankingMessageCreate,
    BankingMessage,
    ParseResult,
    CreateTransactionFromMessage,
)
from app.schemas.transaction import Transaction as TransactionSchema
from app.services.banking_message_service import (
    BankingMessageService,
    parse_message,
    suggest_category_for_amount_description,
)

router = APIRouter()


@router.post("/parse", response_model=ParseResult)
async def parse_banking_message(
    body: BankingMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Parse a banking message without saving. Returns extracted amount, date, description
    and AI-suggested category based on amount and text.
    """
    parsed = parse_message(body.raw_text)
    suggested_id = None
    suggested_name = None
    if parsed.get("amount") is not None and parsed.get("description"):
        suggested_id = suggest_category_for_amount_description(
            db,
            parsed["amount"],
            parsed["description"],
            parsed.get("transaction_type", "expense"),
        )
        if suggested_id:
            cat = db.query(Category).filter(Category.id == suggested_id).first()
            if cat:
                suggested_name = cat.name
    return ParseResult(
        amount=parsed.get("amount"),
        date=parsed.get("date"),
        description=parsed.get("description"),
        transaction_type=parsed.get("transaction_type", "expense"),
        suggested_category_id=suggested_id,
        suggested_category_name=suggested_name,
    )


@router.post("/", response_model=BankingMessage, status_code=status.HTTP_201_CREATED)
async def create_banking_message(
    body: BankingMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a banking message and parse it; store suggested category."""
    service = BankingMessageService(db)
    return service.create_message(current_user.id, body.raw_text, body.source)


@router.get("/", response_model=List[BankingMessage])
async def list_banking_messages(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List current user's banking messages."""
    service = BankingMessageService(db)
    return service.list_messages(current_user.id, limit=limit)


@router.get("/{message_id}", response_model=BankingMessage)
async def get_banking_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single banking message."""
    service = BankingMessageService(db)
    msg = service.get_message(message_id, current_user.id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return msg


@router.post("/{message_id}/create-transaction", response_model=TransactionSchema, status_code=status.HTTP_201_CREATED)
async def create_transaction_from_message(
    message_id: int,
    body: CreateTransactionFromMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a transaction from a parsed banking message. Uses AI-suggested category unless overridden."""
    service = BankingMessageService(db)
    tx = service.create_transaction_from_message(
        message_id, current_user.id, body.account_id, body.category_id
    )
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create transaction (message not found or missing parsed amount)",
        )
    return tx
