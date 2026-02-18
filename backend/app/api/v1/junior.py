"""
Junior Smart Savings API: parent-controlled accounts, goals, automated deposits, rewards.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.junior import (
    JuniorProfile,
    JuniorProfileCreate,
    JuniorProfileUpdate,
    JuniorGoal,
    JuniorGoalCreate,
    JuniorGoalUpdate,
    AutomatedDeposit,
    AutomatedDepositCreate,
    AutomatedDepositUpdate,
    Reward,
    JuniorDashboardSummary,
)
from app.models.junior import RewardType
from app.services.junior_service import JuniorService

router = APIRouter()


@router.get("/profiles", response_model=List[JuniorProfile])
async def list_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all junior profiles (children) for the current parent."""
    service = JuniorService(db)
    return service.get_profiles_by_parent(current_user.id)


@router.post("/profiles", response_model=JuniorProfile, status_code=status.HTTP_201_CREATED)
async def create_profile(
    data: JuniorProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new child profile."""
    service = JuniorService(db)
    return service.create_profile(data, current_user.id)


@router.get("/profiles/{profile_id}", response_model=JuniorProfile)
async def get_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a child profile by ID."""
    service = JuniorService(db)
    profile = service.get_profile(profile_id, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/profiles/{profile_id}", response_model=JuniorProfile)
async def update_profile(
    profile_id: int,
    data: JuniorProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a child profile."""
    service = JuniorService(db)
    profile = service.update_profile(profile_id, current_user.id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.delete("/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deactivate a child profile (soft delete)."""
    service = JuniorService(db)
    if not service.delete_profile(profile_id, current_user.id):
        raise HTTPException(status_code=404, detail="Profile not found")


@router.get("/profiles/{profile_id}/dashboard", response_model=JuniorDashboardSummary)
async def get_dashboard(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard summary for a child: balance, goals, next deposit, rewards."""
    service = JuniorService(db)
    summary = service.get_dashboard_summary(profile_id, current_user.id)
    if not summary:
        raise HTTPException(status_code=404, detail="Profile not found")
    return summary


# ---- Junior goals ----
@router.get("/profiles/{profile_id}/goals", response_model=List[JuniorGoal])
async def list_goals(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JuniorService(db)
    if not service.get_profile(profile_id, current_user.id):
        raise HTTPException(status_code=404, detail="Profile not found")
    return service.get_goals(profile_id, current_user.id)


@router.post("/profiles/{profile_id}/goals", response_model=JuniorGoal, status_code=status.HTTP_201_CREATED)
async def create_goal(
    profile_id: int,
    data: JuniorGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JuniorService(db)
    goal = service.create_goal(profile_id, current_user.id, data)
    if not goal:
        raise HTTPException(status_code=404, detail="Profile not found")
    return goal


@router.put("/profiles/{profile_id}/goals/{goal_id}", response_model=JuniorGoal)
async def update_goal(
    profile_id: int,
    goal_id: int,
    data: JuniorGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JuniorService(db)
    goal = service.update_goal(goal_id, current_user.id, data)
    if not goal or goal.junior_profile_id != profile_id:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.post("/profiles/{profile_id}/goals/{goal_id}/approve", response_model=JuniorGoal)
async def approve_goal(
    profile_id: int,
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Parent approves a goal so it becomes active."""
    service = JuniorService(db)
    goal = service.approve_goal(goal_id, current_user.id)
    if not goal or goal.junior_profile_id != profile_id:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


# ---- Automated deposits ----
@router.get("/profiles/{profile_id}/deposits", response_model=List[AutomatedDeposit])
async def list_deposits(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JuniorService(db)
    if not service.get_profile(profile_id, current_user.id):
        raise HTTPException(status_code=404, detail="Profile not found")
    return service.get_automated_deposits(profile_id, current_user.id)


@router.post("/profiles/{profile_id}/deposits", response_model=AutomatedDeposit, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    profile_id: int,
    data: AutomatedDepositCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JuniorService(db)
    dep = service.create_automated_deposit(profile_id, current_user.id, data)
    if not dep:
        raise HTTPException(status_code=404, detail="Profile or account not found")
    return dep


@router.put("/profiles/{profile_id}/deposits/{deposit_id}", response_model=AutomatedDeposit)
async def update_deposit(
    profile_id: int,
    deposit_id: int,
    data: AutomatedDepositUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JuniorService(db)
    dep = service.update_automated_deposit(deposit_id, profile_id, current_user.id, data)
    if not dep:
        raise HTTPException(status_code=404, detail="Deposit not found")
    return dep


# ---- Rewards ----
@router.get("/profiles/{profile_id}/rewards", response_model=List[Reward])
async def list_rewards(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JuniorService(db)
    if not service.get_profile(profile_id, current_user.id):
        raise HTTPException(status_code=404, detail="Profile not found")
    return service.get_rewards(profile_id, current_user.id)


class RewardCreateBody(BaseModel):
    """Request body for creating a reward."""
    reward_type: RewardType
    title: Optional[str] = None


@router.post("/profiles/{profile_id}/rewards", response_model=Reward, status_code=status.HTTP_201_CREATED)
async def create_reward(
    profile_id: int,
    body: RewardCreateBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = JuniorService(db)
    r = service.add_reward(profile_id, current_user.id, body.reward_type, body.title)
    if not r:
        raise HTTPException(status_code=404, detail="Profile not found")
    return r
