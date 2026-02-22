"""
User schemas for request/response validation.
"""
import json
import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Any
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user creation. Password policy: min 8 chars, at least one letter and one digit."""
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_policy(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserUpdate(BaseModel):
    """Schema for user update."""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    dashboard_preferences: Optional[dict] = None


class UserInDB(UserBase):
    """User schema with database fields."""
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    totp_enabled: bool = False
    dashboard_preferences: Optional[dict] = None

    @field_validator("dashboard_preferences", mode="before")
    @classmethod
    def parse_dashboard_prefs(cls, v: Any) -> Optional[dict]:
        if v is None:
            return None
        if isinstance(v, dict):
            return v
        if isinstance(v, str):
            return json.loads(v) if v.strip() else None
        return None

    class Config:
        from_attributes = True


class User(UserInDB):
    """User response schema (excludes totp_secret; totp_enabled from model property)."""
    pass


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str
    password: str


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token data schema."""
    user_id: Optional[int] = None


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot-password (stub: no email sent)."""
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """Generic response to avoid revealing whether email exists."""
    message: str = "If an account exists with this email, you will receive reset instructions."


class ResetPasswordRequest(BaseModel):
    """Schema for reset-password (token from email link + new password)."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_policy(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class ResetPasswordResponse(BaseModel):
    message: str = "Password has been reset. You can sign in with your new password."


class TwoFactorSetupResponse(BaseModel):
    """2FA setup: secret and provisioning URI for QR."""
    secret: str
    provisioning_uri: str


class TwoFactorEnableRequest(BaseModel):
    """Enable 2FA with code from authenticator app."""
    code: str
    secret: str


class TwoFactorDisableRequest(BaseModel):
    """Disable 2FA (require password)."""
    password: str


class TwoFactorVerifyLoginRequest(BaseModel):
    """Verify 2FA code after password login."""
    temp_token: str
    code: str

