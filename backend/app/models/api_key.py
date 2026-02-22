"""
API key model for programmatic access.
"""
import hashlib
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


def hash_key(plain: str) -> str:
    """Hash an API key for storage (SHA-256)."""
    return hashlib.sha256(plain.encode()).hexdigest()


class ApiKey(Base):
    """API key for programmatic access; key stored as hash."""
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    key_hash = Column(String(64), nullable=False, unique=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="api_keys")
