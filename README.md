# Nexus

A full-stack personal finance application (Nexus) built with FastAPI backend and Next.js frontend.

## Features

- User authentication and authorization
- Account management (checking, savings, credit cards, etc.)
- Transaction tracking with categories
- Budget management with spending tracking
- Financial goals tracking
- **Junior Smart Savings** — parent-controlled accounts for children: goal-based saving, automated deposits, progress tracking, rewards, and financial education
- Dashboard with financial summaries
- Reports and analytics
- Expense forecasting

## Tech Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - ORM for database operations
- PostgreSQL - Database
- JWT - Authentication
- Pydantic - Data validation

### Frontend
- Next.js 14+ - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Zod - Schema validation
- Recharts - Data visualization

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or use Docker)
- Docker and Docker Compose (optional)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory (see `backend/.env.example`). **PostgreSQL is required.**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/personalfinance
AUTO_CREATE_DB=true
SECRET_KEY=your-secret-key-change-in-production
DEBUG=true
```
Ensure PostgreSQL is running and the database exists (e.g. `createdb personalfinance`).

5. Initialize the database (choose one):
   - **Quick start (create tables only):** `python -m app.db.init_db`
   - **Production (Alembic migrations):**  
     `alembic upgrade head`  
     To create a new migration after model changes: `alembic revision --autogenerate -m "description"`

6. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Docker Setup

1. Start all services:
```bash
docker compose up -d --build
```

2. Access the application:
   - Backend API: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

## Project Structure

```
nexus/  # rename repo/folder from personal-finance-app to nexus if desired
├── backend/
│   ├── app/
│   │   ├── api/v1/        # API endpoints
│   │   ├── core/          # Core configuration
│   │   ├── db/            # Database setup
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── lib/              # Utilities
├── docs/                  # Documentation
└── docker-compose.yml
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Accounts
- `GET /api/v1/accounts` - Get all accounts
- `POST /api/v1/accounts` - Create account
- `GET /api/v1/accounts/{id}` - Get account
- `PUT /api/v1/accounts/{id}` - Update account
- `DELETE /api/v1/accounts/{id}` - Delete account

### Transactions
- `GET /api/v1/transactions` - Get transactions (with filters)
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions/{id}` - Get transaction
- `PUT /api/v1/transactions/{id}` - Update transaction
- `DELETE /api/v1/transactions/{id}` - Delete transaction

### Budgets
- `GET /api/v1/budgets` - Get all budgets
- `POST /api/v1/budgets` - Create budget
- `GET /api/v1/budgets/{id}` - Get budget with spending
- `PUT /api/v1/budgets/{id}` - Update budget
- `DELETE /api/v1/budgets/{id}` - Delete budget

### Goals
- `GET /api/v1/goals` - Get all goals
- `POST /api/v1/goals` - Create goal
- `GET /api/v1/goals/{id}` - Get goal with progress
- `PUT /api/v1/goals/{id}` - Update goal
- `DELETE /api/v1/goals/{id}` - Delete goal

### Dashboard
- `GET /api/v1/dashboard/summary` - Get dashboard summary

### Reports
- `GET /api/v1/reports/expenses-by-category` - Expenses by category
- `GET /api/v1/reports/income-vs-expenses` - Income vs expenses

## Development

Phased development is tracked in [docs/PHASES.md](docs/PHASES.md) and via [GitHub issues](https://github.com/massoudsh/nexus/issues). User journeys (swimlane-style flows for transactions, accounts, budgets, goals, auth) are in [docs/USER_FLOWS.md](docs/USER_FLOWS.md).

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Formatting
```bash
# Backend
black app/
isort app/

# Frontend
npm run lint
npm run format
```

## License

MIT

