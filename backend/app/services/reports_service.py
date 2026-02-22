"""
Reports service for generating reports and dashboard data.
"""
from typing import Dict, List, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models.account import Account
from app.models.transaction import Transaction, TransactionType
from app.models.budget import Budget
from app.models.goal import Goal, GoalStatus


class ReportsService:
    """Service for report generation."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_dashboard_summary(self, user_id: int) -> Dict:
        """Get dashboard summary statistics."""
        # Total balance across all accounts
        total_balance = self.db.query(func.sum(Account.balance)).filter(
            Account.user_id == user_id,
            Account.is_active == True
        ).scalar() or Decimal("0.00")
        
        # Current month income and expenses
        today = date.today()
        month_start = date(today.year, today.month, 1)
        month_end = date(today.year, today.month + 1, 1) - timedelta(days=1)
        
        month_income = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.INCOME,
            func.date(Transaction.date) >= month_start,
            func.date(Transaction.date) <= month_end
        ).scalar() or Decimal("0.00")
        
        month_expenses = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.EXPENSE,
            func.date(Transaction.date) >= month_start,
            func.date(Transaction.date) <= month_end
        ).scalar() or Decimal("0.00")
        
        # Active budgets count
        active_budgets = self.db.query(func.count(Budget.id)).filter(
            Budget.user_id == user_id,
            Budget.is_active == True
        ).scalar() or 0
        
        # Active goals count
        active_goals = self.db.query(func.count(Goal.id)).filter(
            Goal.user_id == user_id,
            Goal.status == GoalStatus.ACTIVE
        ).scalar() or 0
        
        # Recent transactions (last 5)
        recent_transactions = self.db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).order_by(Transaction.date.desc()).limit(5).all()
        
        return {
            "total_balance": float(total_balance),
            "month_income": float(month_income),
            "month_expenses": float(month_expenses),
            "month_net": float(month_income - month_expenses),
            "active_budgets": active_budgets,
            "active_goals": active_goals,
            "recent_transactions": [
                {
                    "id": t.id,
                    "amount": float(t.amount),
                    "type": t.transaction_type.value,
                    "description": t.description,
                    "date": t.date.isoformat()
                }
                for t in recent_transactions
            ]
        }
    
    def get_expenses_by_category(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """Get expense breakdown by category."""
        query = self.db.query(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total")
        ).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.EXPENSE
        )
        
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        
        results = query.group_by(Transaction.category_id).all()
        
        return [
            {
                "category_id": cat_id,
                "total": float(total)
            }
            for cat_id, total in results
        ]
    
    def get_income_vs_expenses(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """Get income vs expenses trend."""
        query_income = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.INCOME
        )
        
        query_expenses = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.EXPENSE
        )
        
        if start_date:
            query_income = query_income.filter(Transaction.date >= start_date)
            query_expenses = query_expenses.filter(Transaction.date >= start_date)
        
        if end_date:
            query_income = query_income.filter(Transaction.date <= end_date)
            query_expenses = query_expenses.filter(Transaction.date <= end_date)
        
        total_income = query_income.scalar() or Decimal("0.00")
        total_expenses = query_expenses.scalar() or Decimal("0.00")
        
        return {
            "income": float(total_income),
            "expenses": float(total_expenses),
            "net": float(total_income - total_expenses)
        }

    def get_spending_insights(self, user_id: int) -> Dict:
        """Period-over-period: this month vs last month; simple narrative."""
        today = date.today()
        this_start = date(today.year, today.month, 1)
        if today.month == 1:
            last_start = date(today.year - 1, 12, 1)
            last_end = date(today.year - 1, 12, 31)
        else:
            last_start = date(today.year, today.month - 1, 1)
            last_end = this_start - timedelta(days=1)
        this_end = today
        this_ivs = self.get_income_vs_expenses(
            user_id,
            datetime.combine(this_start, datetime.min.time()),
            datetime.combine(this_end, datetime.max.time()),
        )
        last_ivs = self.get_income_vs_expenses(
            user_id,
            datetime.combine(last_start, datetime.min.time()),
            datetime.combine(last_end, datetime.max.time()),
        )
        this_exp = this_ivs["expenses"]
        last_exp = last_ivs["expenses"]
        pct = (float(this_exp - last_exp) / last_exp * 100) if last_exp else 0
        return {
            "this_month_income": this_ivs["income"],
            "this_month_expenses": this_ivs["expenses"],
            "last_month_income": last_ivs["income"],
            "last_month_expenses": last_ivs["expenses"],
            "expense_change_pct": round(pct, 1),
            "narrative": f"هزینه این ماه نسبت به ماه قبل {pct:+.1f}٪ است." if last_exp else "داده ماه قبل برای مقایسه نیست.",
        }

