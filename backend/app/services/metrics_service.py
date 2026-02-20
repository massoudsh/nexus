"""
Centralized metrics engine for Founder Financial Command Center.

Computes: cash balance, burn, runway, MRR, ARR, revenue growth,
cash in/out 30d, sparklines. All dashboards consume this — no duplicated logic.
"""
from __future__ import annotations

from typing import Any, Dict, List
from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.account import Account
from app.models.transaction import Transaction, TransactionType


def _sum_income(db: Session, user_id: int, start: date, end: date) -> float:
    q = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == TransactionType.INCOME,
        func.date(Transaction.date) >= start,
        func.date(Transaction.date) <= end,
    )
    return float(q.scalar() or Decimal("0"))

def _sum_expenses(db: Session, user_id: int, start: date, end: date) -> float:
    q = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == TransactionType.EXPENSE,
        func.date(Transaction.date) >= start,
        func.date(Transaction.date) <= end,
    )
    return float(q.scalar() or Decimal("0"))


def get_cash_balance(db: Session, user_id: int) -> float:
    """Total balance across all active accounts."""
    r = db.query(func.sum(Account.balance)).filter(
        Account.user_id == user_id,
        Account.is_active == True,
    ).scalar() or Decimal("0")
    return float(r)


def get_cash_in_out_30d(db: Session, user_id: int) -> tuple[float, float]:
    """Cash in and cash out over last 30 days."""
    end = date.today()
    start = end - timedelta(days=30)
    cash_in = _sum_income(db, user_id, start, end)
    cash_out = _sum_expenses(db, user_id, start, end)
    return cash_in, cash_out


def get_monthly_burn(db: Session, user_id: int, for_date: date | None = None) -> float:
    """Net burn this month: expenses - income (positive = burn)."""
    d = for_date or date.today()
    month_start = date(d.year, d.month, 1)
    if d.month == 12:
        month_end = date(d.year, 12, 31)
    else:
        month_end = date(d.year, d.month + 1, 1) - timedelta(days=1)
    inc = _sum_income(db, user_id, month_start, month_end)
    exp = _sum_expenses(db, user_id, month_start, month_end)
    return max(0.0, exp - inc)


def get_runway_months(cash_balance: float, monthly_burn: float) -> float | None:
    """Runway in months. None if no burn (infinite)."""
    if monthly_burn <= 0:
        return None
    return cash_balance / monthly_burn


def get_mrr_from_income(db: Session, user_id: int) -> float:
    """MRR approximated from last 30 days income (recurring proxy)."""
    cash_in, _ = get_cash_in_out_30d(db, user_id)
    return cash_in  # Treat 30d income as MRR proxy for now


def get_arr(db: Session, user_id: int) -> float:
    """ARR = MRR * 12."""
    mrr = get_mrr_from_income(db, user_id)
    return mrr * 12


def get_revenue_growth_pct(db: Session, user_id: int) -> float | None:
    """Revenue growth %: (this month income - last month income) / last month * 100."""
    today = date.today()
    this_start = date(today.year, today.month, 1)
    if today.month == 1:
        last_start = date(today.year - 1, 12, 1)
        last_end = date(today.year - 1, 12, 31)
    else:
        last_start = date(today.year, today.month - 1, 1)
        last_end = this_start - timedelta(days=1)
    this_income = _sum_income(db, user_id, this_start, today)
    last_income = _sum_income(db, user_id, last_start, last_end)
    if last_income == 0:
        return 100.0 if this_income > 0 else 0.0
    return ((this_income - last_income) / last_income) * 100


def get_sparkline_months(db: Session, user_id: int, months: int = 6) -> List[Dict[str, Any]]:
    """Last N months: label, cash_balance, income, expenses, net_burn (exp - inc)."""
    today = date.today()
    result: List[Dict[str, Any]] = []
    for i in range(months - 1, -1, -1):
        # month_end = today - i months, end of that month
        y = today.year
        m = today.month - i
        while m <= 0:
            m += 12
            y -= 1
        month_end = date(y, m, 1) + timedelta(days=32)
        month_end = month_end.replace(day=1) - timedelta(days=1)
        month_start = date(y, m, 1)
        income = _sum_income(db, user_id, month_start, month_end)
        expenses = _sum_expenses(db, user_id, month_start, month_end)
        result.append({
            "label": month_start.strftime("%b '%y"),
            "income": income,
            "expenses": expenses,
            "net_burn": max(0, expenses - income),
            "net": income - expenses,
        })
    return result


def get_burn_intelligence(db: Session, user_id: int) -> Dict[str, Any]:
    """Gross burn, net burn, burn multiple, 3-month avg burn, runway forecasts."""
    cash = get_cash_balance(db, user_id)
    spark = get_sparkline_months(db, user_id, 6)
    if len(spark) < 3:
        avg_3m = 0.0
    else:
        avg_3m = sum(s["net_burn"] for s in spark[-3:]) / 3
    current_month_burn = get_monthly_burn(db, user_id)
    cash_in_30, cash_out_30 = get_cash_in_out_30d(db, user_id)
    gross_burn_30 = cash_out_30
    net_burn_30 = max(0, cash_out_30 - cash_in_30)
    # Burn multiple: net burn / revenue (if no revenue, null)
    burn_multiple: float | None = None
    if cash_in_30 > 0:
        burn_multiple = net_burn_30 / cash_in_30

    runway_avg = get_runway_months(cash, avg_3m) if avg_3m > 0 else None
    runway_current = get_runway_months(cash, current_month_burn) if current_month_burn > 0 else None
    # Conservative: 1.2x burn; aggressive: 0.8x burn
    forecast_base = runway_avg if runway_avg is not None else runway_current
    forecast_conservative = get_runway_months(cash, avg_3m * 1.2) if avg_3m > 0 else None
    forecast_aggressive = get_runway_months(cash, avg_3m * 0.8) if avg_3m > 0 else None

    return {
        "gross_burn_30d": gross_burn_30,
        "net_burn_30d": net_burn_30,
        "net_burn_current_month": current_month_burn,
        "burn_multiple": round(burn_multiple, 2) if burn_multiple is not None else None,
        "avg_burn_3m": round(avg_3m, 2),
        "runway_months": runway_current,
        "runway_forecast": {
            "base_months": round(forecast_base, 1) if forecast_base is not None else None,
            "conservative_months": round(forecast_conservative, 1) if forecast_conservative is not None else None,
            "aggressive_months": round(forecast_aggressive, 1) if forecast_aggressive is not None else None,
        },
    }


def get_cash_summary_digest(db: Session, user_id: int, days: int = 30) -> Dict[str, Any]:
    """Money in/out summary for digest email: cash in, cash out, net, top 3 expense categories, revenue concentration note."""
    from app.models.transaction import Transaction, TransactionType
    from app.models.category import Category

    cash_in, cash_out = get_cash_in_out_30d(db, user_id)
    net = cash_in - cash_out

    end = date.today()
    start = end - timedelta(days=days)
    top_expenses = (
        db.query(Transaction.category_id, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.EXPENSE,
            func.date(Transaction.date) >= start,
            func.date(Transaction.date) <= end,
        )
        .group_by(Transaction.category_id)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(3)
        .all()
    )
    categories = {c.id: c.name for c in db.query(Category).all()}
    top_3 = [
        {"category": categories.get(cat_id, f"Category {cat_id}"), "total": float(tot)}
        for cat_id, tot in top_expenses
    ]
    return {
        "cash_in": cash_in,
        "cash_out": cash_out,
        "net": net,
        "days": days,
        "top_3_expense_categories": top_3,
        "revenue_concentration_risk": "Consider diversifying income sources." if cash_in > 0 and cash_out >= cash_in else None,
    }


def get_founder_overview(db: Session, user_id: int) -> Dict[str, Any]:
    """Single entry point for Founder Overview: KPIs + sparklines + burn intelligence."""
    cash = get_cash_balance(db, user_id)
    cash_in_30, cash_out_30 = get_cash_in_out_30d(db, user_id)
    net_30 = cash_in_30 - cash_out_30
    monthly_burn = get_monthly_burn(db, user_id)
    runway = get_runway_months(cash, monthly_burn)
    mrr = get_mrr_from_income(db, user_id)
    arr = get_arr(db, user_id)
    revenue_growth = get_revenue_growth_pct(db, user_id)
    spark = get_sparkline_months(db, user_id, 6)
    burn = get_burn_intelligence(db, user_id)

    # Trend: compare last 30d net to previous 30d net
    end_prev = date.today() - timedelta(days=30)
    start_prev = end_prev - timedelta(days=30)
    prev_in = _sum_income(db, user_id, start_prev, end_prev)
    prev_out = _sum_expenses(db, user_id, start_prev, end_prev)
    prev_net = prev_in - prev_out
    trend_net = (net_30 - prev_net) if prev_net != 0 else 0  # positive = improving

    kpis = {
        "cash_balance": {"value": cash, "trend": "up" if cash >= 0 else "down", "sparkline": [s["net"] + cash for s in spark]},  # simplified
        "monthly_burn": {"value": monthly_burn, "trend": "down" if monthly_burn < (burn.get("avg_burn_3m") or 0) else "up", "sparkline": [s["net_burn"] for s in spark]},
        "runway_months": {"value": runway, "trend": "up" if (runway or 0) >= 6 else "down", "sparkline": []},
        "mrr": {"value": mrr, "trend": "up" if (revenue_growth or 0) >= 0 else "down", "sparkline": [s["income"] for s in spark]},
        "arr": {"value": arr, "trend": "up" if (revenue_growth or 0) >= 0 else "down", "sparkline": [s["income"] * 12 for s in spark]},
        "revenue_growth_pct": {"value": revenue_growth, "trend": "up" if (revenue_growth or 0) >= 0 else "down", "sparkline": []},
        "cash_in_30d": {"value": cash_in_30, "trend": "up" if trend_net >= 0 else "down", "sparkline": [s["income"] for s in spark]},
        "cash_out_30d": {"value": cash_out_30, "trend": "down" if trend_net >= 0 else "up", "sparkline": [s["expenses"] for s in spark]},
    }
    # Runway sparkline: repeat current runway (historical balance not stored)
    kpis["runway_months"]["sparkline"] = [runway] * 6 if runway is not None else []

    return {
        "kpis": kpis,
        "sparkline_months": spark,
        "burn": burn,
        "recent_net_30d": net_30,
    }
