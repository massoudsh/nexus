"""
Banking message parsing and AI-backed category suggestion.
"""
import re
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.models.banking_message import BankingMessage
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.models.account import Account
from app.schemas.transaction import TransactionCreate

# Common keywords -> category name (must match DEFAULT_CATEGORIES or existing categories)
CATEGORY_KEYWORDS: Dict[str, str] = {
    "grocery": "Groceries",
    "supermarket": "Groceries",
    "food": "Groceries",
    "restaurant": "Dining",
    "dining": "Dining",
    "uber": "Transport",
    "lyft": "Transport",
    "petrol": "Transport",
    "fuel": "Transport",
    "parking": "Transport",
    "rent": "Rent & Utilities",
    "electricity": "Rent & Utilities",
    "water": "Rent & Utilities",
    "amazon": "Shopping",
    "flipkart": "Shopping",
    "shopping": "Shopping",
    "medical": "Healthcare",
    "pharmacy": "Healthcare",
    "hospital": "Healthcare",
    "netflix": "Subscriptions",
    "spotify": "Subscriptions",
    "subscription": "Subscriptions",
    "salary": "Income",
    "deposit": "Income",
    "credited": "Income",
    "refund": "Income",
}


def _extract_amount(text: str) -> Optional[Decimal]:
    """Extract numeric amount from message. Handles INR 500, $10.50, Rs 1,234.56, etc."""
    # Try common patterns: currency symbol/code followed by digits
    patterns = [
        r"(?:INR|Rs\.?|USD|\$|EUR|€)\s*([\d,]+(?:\.\d{2})?)",
        r"([\d,]+(?:\.\d{2})?)\s*(?:INR|Rs\.?|USD|EUR)",
        r"amount[:\s]+([\d,]+(?:\.\d{2})?)",
        r"debited[:\s]+([\d,]+(?:\.\d{2})?)",
        r"credited[:\s]+([\d,]+(?:\.\d{2})?)",
        r"(?:spent|paid|withdrawn)[:\s]+([\d,]+(?:\.\d{2})?)",
        r"\b([\d,]+\.\d{2})\b",  # any XX.XX
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            try:
                cleaned = m.group(1).replace(",", "")
                return Decimal(cleaned)
            except Exception:
                continue
    return None


def _extract_date(text: str) -> Optional[datetime]:
    """Extract date from message."""
    # DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD
    patterns = [
        r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
        r"(\d{4})[/-](\d{1,2})[/-](\d{1,2})",
        r"on\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
        r"date[:\s]+(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            g = m.groups()
            try:
                if len(g[0]) == 4:  # year first
                    y, mo, d = int(g[0]), int(g[1]), int(g[2])
                else:
                    d, mo, y = int(g[0]), int(g[1]), int(g[2])
                return datetime(y, mo, d)
            except (ValueError, IndexError):
                continue
    return datetime.utcnow()


def _extract_description(text: str, max_len: int = 500) -> str:
    """Use first line or first sentence as description, or truncated raw."""
    text = text.strip()
    line = text.split("\n")[0].strip()
    if not line:
        line = text
    if len(line) > max_len:
        line = line[: max_len - 3] + "..."
    return line or "From banking message"


def _infer_type(text: str, amount: Optional[Decimal]) -> str:
    """Infer income vs expense from keywords."""
    lower = text.lower()
    if any(k in lower for k in ("credited", "deposit", "salary", "received", "refund")):
        return "income"
    if any(k in lower for k in ("debited", "withdrawn", "spent", "paid", "purchase")):
        return "expense"
    return "expense"


def parse_message(text: str) -> Dict[str, Any]:
    """Parse raw banking message into amount, date, description, type."""
    amount = _extract_amount(text)
    date = _extract_date(text)
    description = _extract_description(text)
    tx_type = _infer_type(text, amount)
    return {
        "amount": float(amount) if amount else None,
        "date": date.isoformat() if date else None,
        "description": description,
        "transaction_type": tx_type,
    }


def suggest_category_for_amount_description(
    db: Session, amount: Optional[float], description: str, transaction_type: str
) -> Optional[int]:
    """
    Suggest category_id based on amount and description (rule-based; extend with LLM if needed).
    """
    categories = {c.name: c.id for c in db.query(Category).all()}
    if not categories:
        return None
    desc_lower = (description or "").lower()
    # Keyword match
    for keyword, cat_name in CATEGORY_KEYWORDS.items():
        if keyword in desc_lower and cat_name in categories:
            return categories[cat_name]
    # Amount heuristics: large amounts often rent/utilities
    if transaction_type == "expense" and amount is not None:
        if amount >= 5000 and "Rent & Utilities" in categories:
            return categories["Rent & Utilities"]
        if amount <= 500 and "Groceries" in categories:
            return categories["Groceries"]
    # Default expense category
    if transaction_type == "expense":
        for name in ("Shopping", "Groceries", "Dining"):
            if name in categories:
                return categories[name]
    if transaction_type == "income" and "Income" in categories:
        return categories["Income"]
    return list(categories.values())[0] if categories else None


class BankingMessageService:
    def __init__(self, db: Session):
        self.db = db

    def create_message(self, user_id: int, raw_text: str, source: Optional[str] = None) -> BankingMessage:
        """Store and parse a banking message."""
        parsed = parse_message(raw_text)
        suggested_id = None
        if parsed.get("amount") is not None and parsed.get("description"):
            suggested_id = suggest_category_for_amount_description(
                self.db,
                parsed["amount"],
                parsed["description"],
                parsed.get("transaction_type", "expense"),
            )
        msg = BankingMessage(
            user_id=user_id,
            raw_text=raw_text,
            source=source or "manual",
            parsed_amount=Decimal(str(parsed["amount"])) if parsed.get("amount") else None,
            parsed_date=datetime.fromisoformat(parsed["date"]) if parsed.get("date") else None,
            parsed_description=parsed.get("description"),
            parsed_type=parsed.get("transaction_type"),
            suggested_category_id=suggested_id,
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def list_messages(self, user_id: int, limit: int = 50) -> List[BankingMessage]:
        """List user's banking messages."""
        return (
            self.db.query(BankingMessage)
            .filter(BankingMessage.user_id == user_id)
            .order_by(BankingMessage.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_message(self, message_id: int, user_id: int) -> Optional[BankingMessage]:
        return (
            self.db.query(BankingMessage)
            .filter(BankingMessage.id == message_id, BankingMessage.user_id == user_id)
            .first()
        )

    def create_transaction_from_message(
        self,
        message_id: int,
        user_id: int,
        account_id: int,
        category_id_override: Optional[int] = None,
    ) -> Optional[Transaction]:
        """Create a transaction from a parsed banking message."""
        msg = self.get_message(message_id, user_id)
        if not msg or msg.parsed_amount is None:
            return None
        account = self.db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()
        if not account:
            return None
        category_id = category_id_override or msg.suggested_category_id
        tx_type = TransactionType.EXPENSE if (msg.parsed_type or "expense") == "expense" else TransactionType.INCOME
        create_data = TransactionCreate(
            account_id=account_id,
            category_id=category_id,
            amount=msg.parsed_amount,
            transaction_type=tx_type,
            description=msg.parsed_description or "From banking message",
            date=msg.parsed_date or datetime.utcnow(),
            notes=None,
        )
        from app.services.transactions_service import TransactionsService
        tx_service = TransactionsService(self.db)
        transaction = tx_service.create_transaction(create_data, user_id)
        msg.transaction_id = transaction.id
        self.db.commit()
        self.db.refresh(msg)
        return transaction
