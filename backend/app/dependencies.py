"""
Dependency injection for FastAPI routes.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.core.config import settings
from app.models.user import User
from app.models.api_key import ApiKey, hash_key

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
http_bearer = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    api_key: Optional[str] = Depends(api_key_header),
    db: Session = Depends(get_db),
) -> User:
    """Get the current user from JWT Bearer token or X-API-Key header."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Try Bearer token first
    if credentials and credentials.credentials:
        payload = decode_token(credentials.credentials)
        if payload is not None:
            user_id = payload.get("sub")
            if user_id is not None:
                user = db.query(User).filter(User.id == user_id).first()
                if user is not None and user.is_active:
                    return user

    # Try API key
    if api_key and api_key.strip():
        key_hash = hash_key(api_key.strip())
        key_row = db.query(ApiKey).filter(ApiKey.key_hash == key_hash).first()
        if key_row is not None:
            key_row.last_used_at = datetime.now(timezone.utc)
            db.commit()
            user = db.query(User).filter(User.id == key_row.user_id).first()
            if user is not None and user.is_active:
                return user

    raise credentials_exception

