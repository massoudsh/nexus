"""
Reports API endpoints.
"""
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.reports_service import ReportsService

router = APIRouter()


@router.get("/expenses-by-category")
async def get_expenses_by_category(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get expense breakdown by category."""
    service = ReportsService(db)
    return service.get_expenses_by_category(current_user.id, start_date, end_date)


@router.get("/income-vs-expenses")
async def get_income_vs_expenses(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get income vs expenses trend."""
    service = ReportsService(db)
    return service.get_income_vs_expenses(current_user.id, start_date, end_date)


@router.get("/insights")
async def get_spending_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Period-over-period spending insights (this month vs last, category trends)."""
    service = ReportsService(db)
    return service.get_spending_insights(current_user.id)

