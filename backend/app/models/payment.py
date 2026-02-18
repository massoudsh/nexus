"""
Payment model for gateway transactions (e.g. ZarinPal).
Stores payment request and verification state.
"""
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Payment(Base):
    """Payment record for gateway (ZarinPal) flow: request → redirect → callback verify."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_rials = Column(Numeric(14, 0), nullable=False)  # ZarinPal uses Rials
    description = Column(Text, nullable=True)
    authority = Column(String(64), nullable=True, index=True)  # from ZarinPal request
    status = Column(String(20), nullable=False, default="pending")  # pending | completed | failed | cancelled
    ref_id = Column(String(64), nullable=True)  # from ZarinPal verify (success)
    gateway = Column(String(32), nullable=False, default="zarinpal")
    extra_data = Column(Text, nullable=True)  # optional JSON: email, mobile
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="payments")

    def __repr__(self):
        return f"<Payment(id={self.id}, authority={self.authority}, status={self.status})>"
