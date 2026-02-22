"""
API keys CRUD for programmatic access.
"""
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.api_key import ApiKey, hash_key
from app.schemas.api_key import ApiKeyCreate, ApiKeyOut, ApiKeyCreateResponse

router = APIRouter()


@router.get("", response_model=list[ApiKeyOut])
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List current user's API keys (no secrets)."""
    keys = db.query(ApiKey).filter(ApiKey.user_id == current_user.id).order_by(ApiKey.created_at.desc()).all()
    return keys


@router.post("", response_model=ApiKeyCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    body: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create an API key. The plain key is returned once; store it securely."""
    plain_key = f"nexus_{secrets.token_urlsafe(32)}"
    key_hash = hash_key(plain_key)
    api_key = ApiKey(user_id=current_user.id, name=body.name.strip(), key_hash=key_hash)
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    return ApiKeyCreateResponse(id=api_key.id, name=api_key.name, key=plain_key)


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke (delete) an API key."""
    key_row = db.query(ApiKey).filter(ApiKey.id == key_id, ApiKey.user_id == current_user.id).first()
    if not key_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    db.delete(key_row)
    db.commit()
