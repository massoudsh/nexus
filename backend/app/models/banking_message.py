"""
Banking message model for storing and parsing bank SMS/notifications.
"""
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class BankingMessage(Base):
    """Raw banking message (e.g. SMS, push) for parsing into transactions."""
    __tablename__ = "banking_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    raw_text = Column(Text, nullable=False)
    source = Column(String(50), nullable=True)  # e.g. "sms", "push", "email"
    parsed_amount = Column(Numeric(10, 2), nullable=True)
    parsed_date = Column(DateTime(timezone=True), nullable=True)
    parsed_description = Column(String(500), nullable=True)
    parsed_type = Column(String(20), nullable=True)  # "income" or "expense"
    suggested_category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)  # set when converted
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="banking_messages")

    def __repr__(self):
        return f"<BankingMessage(id={self.id}, amount={self.parsed_amount})>"
