# Junior Smart Savings (پس‌انداز هوشمند جونیور)

Parent-controlled financial accounts for children: goal-based saving, automated deposits (allowance), progress tracking, and rewards.

## Overview

- **Route:** `/junior` (list), `/junior/[id]` (child detail)
- **Auth:** Requires sign-in. Unauthenticated users are redirected to login.
- **Backend:** `GET/POST/PUT/DELETE /junior/profiles`, goals, deposits, rewards under `/junior/profiles/{id}/...`

## Features

1. **Profiles (children)**  
   Parent creates one profile per child (name, currency). Each profile has a single balance.

2. **Goals**  
   Child or parent creates a goal (name, target amount, optional target date). Parent approves the goal so it becomes active. Progress is shown as current/target with a progress bar.

3. **Automated deposits**  
   Parent schedules recurring transfers from a chosen source account to the child’s balance (e.g. weekly/monthly allowance). Frequency: weekly, biweekly, monthly. Next run date is stored for display (auto-execution can be added later).

4. **Rewards**  
   Parent can grant rewards (e.g. first_save, first_goal, goal_achiever, custom) with an optional title. Used for behavioral reinforcement.

## API summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/junior/profiles` | List current user’s junior profiles |
| POST | `/junior/profiles` | Create profile (name, currency) |
| GET | `/junior/profiles/{id}` | Get profile |
| PUT | `/junior/profiles/{id}` | Update profile |
| DELETE | `/junior/profiles/{id}` | Soft-deactivate profile |
| GET | `/junior/profiles/{id}/dashboard` | Dashboard summary (balance, goals counts, next deposit, rewards) |
| GET/POST | `/junior/profiles/{id}/goals` | List / create goals |
| PUT | `/junior/profiles/{id}/goals/{goalId}` | Update goal |
| POST | `/junior/profiles/{id}/goals/{goalId}/approve` | Parent approve goal |
| GET/POST | `/junior/profiles/{id}/deposits` | List / create automated deposits |
| GET/POST | `/junior/profiles/{id}/rewards` | List / create rewards |

## UI (Persian)

- All copy uses `fa.junior.*` (and shared `fa.common`) in `frontend/lib/fa.ts`.
- List page: add child form, cards per child with balance and link to detail.
- Detail page: header (name, balance), sections for Goals (create, approve, progress), Automated deposits (create, list), Rewards (add, list), and a short financial-education block.

## Models (backend)

- `JuniorProfile`: parent_id, name, balance, currency, is_active, etc.
- `JuniorGoal`: junior_profile_id, name, target_amount, current_amount, status (pending_approval | active | completed | cancelled), parent_approved.
- `AutomatedDeposit`: source_account_id, junior_profile_id, amount, frequency (weekly | biweekly | monthly), next_run_date, is_active.
- `Reward`: junior_profile_id, reward_type (enum), title (optional), achieved_at.

See `backend/app/models/junior.py`, `backend/app/services/junior_service.py`, and `backend/app/api/v1/junior.py` for implementation.
