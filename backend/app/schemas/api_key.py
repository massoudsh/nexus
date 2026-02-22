"""API key schemas."""
from datetime import datetime
from pydantic import BaseModel, Field


class ApiKeyCreate(BaseModel):
    """Create an API key (name only; key is generated server-side)."""
    name: str = Field(..., min_length=1, max_length=100)


class ApiKeyOut(BaseModel):
    """API key list item (no secret)."""
    id: int
    name: str
    last_used_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class ApiKeyCreateResponse(BaseModel):
    """Response when creating a key: full key shown once."""
    id: int
    name: str
    key: str
    message: str = "Store this key securely; it will not be shown again."
