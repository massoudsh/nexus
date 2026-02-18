"""
Junior Smart Savings models: parent-controlled financial accounts for children.
Enables goal-based saving, automated deposits, progress tracking, and rewards.
"""
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum, Date, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base


class DepositFrequency(str, enum.Enum):
    """Frequency for automated deposits."""
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"


class JuniorGoalStatus(str, enum.Enum):
    """Status for junior savings goals."""
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RewardType(str, enum.Enum):
    """Achievement / reward types for behavioral reinforcement."""
    FIRST_SAVE = "first_save"
    FIRST_GOAL = "first_goal"
    FIVE_GOALS = "five_goals"
    TEN_PERCENT = "ten_percent"
    HALFWAY = "halfway"
    GOAL_ACHIEVER = "goal_achiever"
    CONSISTENT_SAVER = "consistent_saver"
    CUSTOM = "custom"


class JuniorProfile(Base):
    """Child profile linked to a parent user. One balance per child."""
    __tablename__ = "junior_profiles"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    balance = Column(Numeric(10, 2), default=0, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    allowance_amount = Column(Numeric(10, 2), nullable=True)
    birth_date = Column(Date, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    parent = relationship("User", back_populates="junior_profiles")
    goals = relationship("JuniorGoal", back_populates="junior_profile", cascade="all, delete-orphan")
    automated_deposits = relationship("AutomatedDeposit", back_populates="junior_profile", cascade="all, delete-orphan")
    rewards = relationship("Reward", back_populates="junior_profile", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<JuniorProfile(id={self.id}, name={self.name}, parent_id={self.parent_id})>"


class JuniorGoal(Base):
    """Savings goal for a child. Parent can approve before it becomes active."""
    __tablename__ = "junior_goals"

    id = Column(Integer, primary_key=True, index=True)
    junior_profile_id = Column(Integer, ForeignKey("junior_profiles.id"), nullable=False)
    name = Column(String(100), nullable=False)
    target_amount = Column(Numeric(10, 2), nullable=False)
    current_amount = Column(Numeric(10, 2), default=0, nullable=False)
    target_date = Column(Date, nullable=True)
    status = Column(Enum(JuniorGoalStatus), nullable=False, default=JuniorGoalStatus.PENDING_APPROVAL)
    parent_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    junior_profile = relationship("JuniorProfile", back_populates="goals")

    def __repr__(self):
        return f"<JuniorGoal(id={self.id}, name={self.name}, target={self.target_amount})>"


class AutomatedDeposit(Base):
    """Recurring deposit from parent's account to child's balance."""
    __tablename__ = "automated_deposits"

    id = Column(Integer, primary_key=True, index=True)
    source_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    junior_profile_id = Column(Integer, ForeignKey("junior_profiles.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    frequency = Column(Enum(DepositFrequency), nullable=False)
    next_run_date = Column(Date, nullable=False)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    source_account = relationship("Account", backref="automated_deposits_out")
    junior_profile = relationship("JuniorProfile", back_populates="automated_deposits")

    def __repr__(self):
        return f"<AutomatedDeposit(id={self.id}, amount={self.amount}, frequency={self.frequency})>"


class Reward(Base):
    """Achievement / milestone earned by a child."""
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    junior_profile_id = Column(Integer, ForeignKey("junior_profiles.id"), nullable=False)
    reward_type = Column(Enum(RewardType), nullable=False)
    title = Column(String(100), nullable=True)
    achieved_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    junior_profile = relationship("JuniorProfile", back_populates="rewards")

    def __repr__(self):
        return f"<Reward(id={self.id}, type={self.reward_type}, profile_id={self.junior_profile_id})>"
