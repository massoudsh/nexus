"""
Junior Smart Savings service: parent-controlled accounts, goals, deposits, rewards.
"""
from typing import List, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.junior import (
    JuniorProfile,
    JuniorGoal,
    AutomatedDeposit,
    Reward,
    DepositFrequency,
    JuniorGoalStatus,
    RewardType,
)
from app.models.account import Account
from app.schemas.junior import (
    JuniorProfileCreate,
    JuniorProfileUpdate,
    JuniorGoalCreate,
    JuniorGoalUpdate,
    AutomatedDepositCreate,
    AutomatedDepositUpdate,
    JuniorDashboardSummary,
)


class JuniorService:
    def __init__(self, db: Session):
        self.db = db

    def get_profiles_by_parent(self, parent_id: int) -> List[JuniorProfile]:
        return (
            self.db.query(JuniorProfile)
            .filter(JuniorProfile.parent_id == parent_id, JuniorProfile.is_active.is_(True))
            .all()
        )

    def get_profile(self, profile_id: int, parent_id: int) -> Optional[JuniorProfile]:
        return (
            self.db.query(JuniorProfile)
            .filter(JuniorProfile.id == profile_id, JuniorProfile.parent_id == parent_id)
            .first()
        )

    def create_profile(self, data: JuniorProfileCreate, parent_id: int) -> JuniorProfile:
        profile = JuniorProfile(
            parent_id=parent_id,
            name=data.name,
            currency=data.currency,
            allowance_amount=data.allowance_amount,
            birth_date=data.birth_date,
            avatar_url=data.avatar_url,
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_profile(
        self, profile_id: int, parent_id: int, data: JuniorProfileUpdate
    ) -> Optional[JuniorProfile]:
        profile = self.get_profile(profile_id, parent_id)
        if not profile:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(profile, k, v)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def delete_profile(self, profile_id: int, parent_id: int) -> bool:
        profile = self.get_profile(profile_id, parent_id)
        if not profile:
            return False
        profile.is_active = False
        self.db.commit()
        return True

    def add_to_balance(self, profile_id: int, parent_id: int, amount: Decimal) -> Optional[JuniorProfile]:
        profile = self.get_profile(profile_id, parent_id)
        if not profile or amount <= 0:
            return None
        profile.balance = Decimal(str(profile.balance)) + amount
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def get_goals(self, junior_profile_id: int, parent_id: int) -> List[JuniorGoal]:
        profile = self.get_profile(junior_profile_id, parent_id)
        if not profile:
            return []
        return list(profile.goals)

    def get_goal(self, goal_id: int, parent_id: int) -> Optional[JuniorGoal]:
        goal = self.db.query(JuniorGoal).filter(JuniorGoal.id == goal_id).first()
        if not goal or goal.junior_profile.parent_id != parent_id:
            return None
        return goal

    def create_goal(
        self, junior_profile_id: int, parent_id: int, data: JuniorGoalCreate
    ) -> Optional[JuniorGoal]:
        profile = self.get_profile(junior_profile_id, parent_id)
        if not profile:
            return None
        goal = JuniorGoal(
            junior_profile_id=junior_profile_id,
            name=data.name,
            target_amount=data.target_amount,
            target_date=data.target_date,
            status=JuniorGoalStatus.PENDING_APPROVAL,
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def update_goal(
        self, goal_id: int, parent_id: int, data: JuniorGoalUpdate
    ) -> Optional[JuniorGoal]:
        goal = self.get_goal(goal_id, parent_id)
        if not goal:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(goal, k, v)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def approve_goal(self, goal_id: int, parent_id: int) -> Optional[JuniorGoal]:
        goal = self.get_goal(goal_id, parent_id)
        if not goal:
            return None
        goal.parent_approved = True
        goal.status = JuniorGoalStatus.ACTIVE
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def add_to_goal(
        self, goal_id: int, parent_id: int, amount: Decimal
    ) -> Optional[JuniorGoal]:
        goal = self.get_goal(goal_id, parent_id)
        if not goal or amount <= 0:
            return None
        goal.current_amount = Decimal(str(goal.current_amount)) + amount
        if goal.current_amount >= goal.target_amount:
            goal.status = JuniorGoalStatus.COMPLETED
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def get_automated_deposits(
        self, junior_profile_id: int, parent_id: int
    ) -> List[AutomatedDeposit]:
        profile = self.get_profile(junior_profile_id, parent_id)
        if not profile:
            return []
        return [d for d in profile.automated_deposits if d.is_active]

    def create_automated_deposit(
        self, junior_profile_id: int, parent_id: int, data: AutomatedDepositCreate
    ) -> Optional[AutomatedDeposit]:
        profile = self.get_profile(junior_profile_id, parent_id)
        if not profile:
            return None
        account = self.db.query(Account).filter(
            Account.id == data.source_account_id,
            Account.user_id == parent_id,
        ).first()
        if not account:
            return None
        dep = AutomatedDeposit(
            source_account_id=data.source_account_id,
            junior_profile_id=junior_profile_id,
            amount=data.amount,
            frequency=data.frequency,
            next_run_date=data.next_run_date,
        )
        self.db.add(dep)
        self.db.commit()
        self.db.refresh(dep)
        return dep

    def update_automated_deposit(
        self, deposit_id: int, junior_profile_id: int, parent_id: int, data: AutomatedDepositUpdate
    ) -> Optional[AutomatedDeposit]:
        profile = self.get_profile(junior_profile_id, parent_id)
        if not profile:
            return None
        dep = next(
            (d for d in profile.automated_deposits if d.id == deposit_id),
            None,
        )
        if not dep:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(dep, k, v)
        self.db.commit()
        self.db.refresh(dep)
        return dep

    def get_rewards(self, junior_profile_id: int, parent_id: int) -> List[Reward]:
        profile = self.get_profile(junior_profile_id, parent_id)
        if not profile:
            return []
        return list(profile.rewards)

    def add_reward(
        self, junior_profile_id: int, parent_id: int, reward_type: RewardType, title: Optional[str] = None
    ) -> Optional[Reward]:
        profile = self.get_profile(junior_profile_id, parent_id)
        if not profile:
            return None
        r = Reward(
            junior_profile_id=junior_profile_id,
            reward_type=reward_type,
            title=title,
        )
        self.db.add(r)
        self.db.commit()
        self.db.refresh(r)
        return r

    def get_dashboard_summary(
        self, junior_profile_id: int, parent_id: int
    ) -> Optional[JuniorDashboardSummary]:
        profile = self.get_profile(junior_profile_id, parent_id)
        if not profile:
            return None
        goals = list(profile.goals)
        goals_active = sum(1 for g in goals if g.status == JuniorGoalStatus.ACTIVE)
        goals_completed = sum(1 for g in goals if g.status == JuniorGoalStatus.COMPLETED)
        next_dep = None
        next_date = None
        for d in profile.automated_deposits:
            if not d.is_active:
                continue
            if next_date is None or d.next_run_date < next_date:
                next_dep = d
                next_date = d.next_run_date
        rewards = list(profile.rewards)
        recent = sorted(rewards, key=lambda x: x.achieved_at, reverse=True)[:5]
        return JuniorDashboardSummary(
            profile=profile,
            goals_total=len(goals),
            goals_active=goals_active,
            goals_completed=goals_completed,
            next_deposit=next_dep,
            next_deposit_date=next_date,
            rewards_count=len(rewards),
            recent_rewards=recent,
        )
