"""
Categories API for transaction and cost categorization.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.category import Category, CategoryCreate, CategoryUpdate
from app.models.category import Category as CategoryModel

router = APIRouter()


@router.get("/", response_model=List[Category])
async def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all categories (for costs and income)."""
    return db.query(CategoryModel).order_by(CategoryModel.name).all()


@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new category (e.g. for cost types)."""
    existing = db.query(CategoryModel).filter(CategoryModel.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name already exists")
    obj = CategoryModel(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a category."""
    obj = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj
