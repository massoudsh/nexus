"""
Schemas for Junior Smart Savings: profiles, goals, automated deposits, rewards.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

from app.models.junior import DepositFrequency, JuniorGoalStatus, RewardType


class JuniorProfileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    currency: str = Field(default="USD", max_length=3)
    allowance_amount: Optional[Decimal] = None
    birth_date: Optional[date] = None
    avatar_url: Optional[str] = None


class JuniorProfileCreate(JuniorProfileBase):
    pass


class JuniorProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    currency: Optional[str] = Field(None, max_length=3)
    allowance_amount: Optional[Decimal] = None
    birth_date: Optional[date] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None


class JuniorProfile(JuniorProfileBase):
    id: int
    parent_id: int
    balance: Decimal = Decimal("0")
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JuniorGoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target_amount: Decimal = Field(..., gt=0)
    target_date: Optional[date] = None


class JuniorGoalCreate(JuniorGoalBase):
    pass


class JuniorGoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    target_amount: Optional[Decimal] = Field(None, gt=0)
    current_amount: Optional[Decimal] = None
    target_date: Optional[date] = None
    status: Optional[JuniorGoalStatus] = None
    parent_approved: Optional[bool] = None


class JuniorGoal(JuniorGoalBase):
    id: int
    junior_profile_id: int
    current_amount: Decimal = Decimal("0")
    status: JuniorGoalStatus = JuniorGoalStatus.PENDING_APPROVAL
    parent_approved: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AutomatedDepositBase(BaseModel):
    source_account_id: int
    amount: Decimal = Field(..., gt=0)
    frequency: DepositFrequency
    next_run_date: date


class AutomatedDepositCreate(AutomatedDepositBase):
    pass


class AutomatedDepositUpdate(BaseModel):
    source_account_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    frequency: Optional[DepositFrequency] = None
    next_run_date: Optional[date] = None
    is_active: Optional[bool] = None


class AutomatedDeposit(AutomatedDepositBase):
    id: int
    junior_profile_id: int
    last_run_at: Optional[datetime] = None
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RewardBase(BaseModel):
    reward_type: RewardType
    title: Optional[str] = None


class RewardCreate(RewardBase):
    junior_profile_id: int


class Reward(RewardBase):
    id: int
    junior_profile_id: int
    achieved_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class JuniorDashboardSummary(BaseModel):
    """Summary for a child's dashboard: balance, goals progress, next deposit, rewards."""
    profile: JuniorProfile
    goals_total: int = 0
    goals_active: int = 0
    goals_completed: int = 0
    next_deposit: Optional[AutomatedDeposit] = None
    next_deposit_date: Optional[date] = None
    rewards_count: int = 0
    recent_rewards: list[Reward] = []
