# Personal Finance App - Architecture Diagrams

## Table of Contents
1. [High-Level System Overview](#1-high-level-system-overview)
2. [Mid-Level Component Architecture](#2-mid-level-component-architecture)
3. [Low-Level Flow Diagrams](#3-low-level-flow-diagrams)
4. [Data Lineage](#4-data-lineage)
5. [Class Structure](#5-class-structure)
6. [Sequence Diagrams](#6-sequence-diagrams)

---

## 1. High-Level System Overview

### 1.1 Complete System Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        WEB[Next.js Frontend]
        MOBILE[Mobile PWA]
    end

    subgraph "API Layer"
        FASTAPI[FastAPI Backend]
        JWT[JWT Auth]
        VALIDATION[Pydantic Validation]
    end

    subgraph "Service Layer"
        AUTH_SVC[Auth Service]
        ACCOUNT_SVC[Account Service]
        TX_SVC[Transaction Service]
        BUDGET_SVC[Budget Service]
        GOAL_SVC[Goal Service]
        REPORT_SVC[Report Service]
    end

    subgraph "Data Layer"
        ORM[SQLAlchemy ORM]
        PG[(PostgreSQL)]
    end

    WEB --> FASTAPI
    MOBILE --> FASTAPI
    
    FASTAPI --> JWT
    FASTAPI --> VALIDATION
    
    FASTAPI --> AUTH_SVC
    FASTAPI --> ACCOUNT_SVC
    FASTAPI --> TX_SVC
    FASTAPI --> BUDGET_SVC
    FASTAPI --> GOAL_SVC
    FASTAPI --> REPORT_SVC
    
    AUTH_SVC --> ORM
    ACCOUNT_SVC --> ORM
    TX_SVC --> ORM
    BUDGET_SVC --> ORM
    GOAL_SVC --> ORM
    REPORT_SVC --> ORM
    
    ORM --> PG

    classDef client fill:#e1f5fe
    classDef api fill:#fff3e0
    classDef service fill:#e8f5e9
    classDef data fill:#f3e5f5
    
    class WEB,MOBILE client
    class FASTAPI,JWT,VALIDATION api
    class AUTH_SVC,ACCOUNT_SVC,TX_SVC,BUDGET_SVC,GOAL_SVC,REPORT_SVC service
    class ORM,PG data
```

### 1.2 Simplified Architecture

```mermaid
graph LR
    USER[User] --> FRONTEND[Next.js]
    FRONTEND --> API[FastAPI]
    API --> SERVICES[Services]
    SERVICES --> DB[(PostgreSQL)]
```

---

## 2. Mid-Level Component Architecture

### 2.1 API Endpoints Structure

```mermaid
flowchart TB
    subgraph "Auth API"
        AUTH_REG[POST /auth/register]
        AUTH_LOGIN[POST /auth/login]
        AUTH_REFRESH[POST /auth/refresh]
        AUTH_ME[GET /auth/me]
    end

    subgraph "Accounts API"
        ACC_LIST[GET /accounts]
        ACC_CREATE[POST /accounts]
        ACC_GET[GET /accounts/:id]
        ACC_UPDATE[PUT /accounts/:id]
        ACC_DELETE[DELETE /accounts/:id]
        ACC_BALANCE[GET /accounts/:id/balance]
    end

    subgraph "Transactions API"
        TX_LIST[GET /transactions]
        TX_CREATE[POST /transactions]
        TX_GET[GET /transactions/:id]
        TX_UPDATE[PUT /transactions/:id]
        TX_DELETE[DELETE /transactions/:id]
        TX_CATEGORY[GET /transactions/by-category]
    end

    subgraph "Budgets API"
        BUD_LIST[GET /budgets]
        BUD_CREATE[POST /budgets]
        BUD_TRACK[GET /budgets/:id/progress]
    end

    subgraph "Goals API"
        GOAL_LIST[GET /goals]
        GOAL_CREATE[POST /goals]
        GOAL_PROGRESS[GET /goals/:id/progress]
        GOAL_CONTRIB[POST /goals/:id/contribute]
    end

    subgraph "Reports API"
        REP_SUMMARY[GET /reports/summary]
        REP_SPENDING[GET /reports/spending]
        REP_INCOME[GET /reports/income]
        REP_FORECAST[GET /reports/forecast]
    end
```

### 2.2 Frontend Component Architecture

```mermaid
flowchart TB
    subgraph "Pages"
        DASHBOARD[Dashboard]
        ACCOUNTS[Accounts]
        TRANSACTIONS[Transactions]
        BUDGETS[Budgets]
        GOALS[Goals]
        REPORTS[Reports]
        SETTINGS[Settings]
    end

    subgraph "Components"
        NAVBAR[Navbar]
        SIDEBAR[Sidebar]
        CHARTS[Recharts]
        FORMS[Form Components]
        TABLES[Data Tables]
        CARDS[Summary Cards]
    end

    subgraph "Hooks"
        USE_AUTH[useAuth]
        USE_ACCOUNTS[useAccounts]
        USE_TX[useTransactions]
        USE_BUDGET[useBudgets]
    end

    subgraph "State"
        CONTEXT[React Context]
        ZOD[Zod Schemas]
    end

    DASHBOARD --> CHARTS
    DASHBOARD --> CARDS
    ACCOUNTS --> TABLES
    TRANSACTIONS --> TABLES
    TRANSACTIONS --> FORMS
    BUDGETS --> CHARTS
    GOALS --> CARDS
    REPORTS --> CHARTS

    DASHBOARD --> USE_ACCOUNTS
    DASHBOARD --> USE_TX
    ACCOUNTS --> USE_ACCOUNTS
    TRANSACTIONS --> USE_TX
```

### 2.3 Database Schema Overview

```mermaid
erDiagram
    USER ||--o{ ACCOUNT : owns
    USER ||--o{ BUDGET : creates
    USER ||--o{ GOAL : sets
    ACCOUNT ||--o{ TRANSACTION : has
    CATEGORY ||--o{ TRANSACTION : categorizes
    CATEGORY ||--o{ BUDGET : limits
    GOAL ||--o{ CONTRIBUTION : receives

    USER {
        uuid id PK
        string email UK
        string hashed_password
        string name
        datetime created_at
    }

    ACCOUNT {
        uuid id PK
        uuid user_id FK
        string name
        string type
        decimal balance
        string currency
        datetime created_at
    }

    TRANSACTION {
        uuid id PK
        uuid account_id FK
        uuid category_id FK
        decimal amount
        string type
        string description
        date transaction_date
    }

    CATEGORY {
        uuid id PK
        string name
        string type
        string icon
        string color
    }

    BUDGET {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        decimal amount
        string period
        date start_date
        date end_date
    }

    GOAL {
        uuid id PK
        uuid user_id FK
        string name
        decimal target_amount
        decimal current_amount
        date target_date
    }

    CONTRIBUTION {
        uuid id PK
        uuid goal_id FK
        decimal amount
        date contribution_date
    }
```

---

## 3. Low-Level Flow Diagrams

### 3.1 Request Flow: Controller to Database

```mermaid
flowchart TD
    REQ[HTTP Request] --> MW1[CORS Middleware]
    MW1 --> MW2[Auth Middleware]
    MW2 --> JWT_CHECK{JWT Valid?}
    
    JWT_CHECK -->|No| UNAUTH[401 Unauthorized]
    JWT_CHECK -->|Yes| ENDPOINT[API Endpoint]
    
    ENDPOINT --> VALIDATE[Pydantic Validation]
    VALIDATE -->|Invalid| BAD_REQ[400 Bad Request]
    VALIDATE -->|Valid| SERVICE[Service Layer]
    
    SERVICE --> ORM[SQLAlchemy ORM]
    ORM --> SESSION[DB Session]
    SESSION --> QUERY[Execute Query]
    QUERY --> PG[(PostgreSQL)]
    
    PG --> RESULT[Query Result]
    RESULT --> SERIALIZE[Serialize Response]
    SERIALIZE --> RESPONSE[HTTP Response]
```

### 3.2 Transaction Creation Flow

```mermaid
flowchart TD
    CREATE[POST /transactions] --> AUTH[Verify JWT]
    AUTH --> VALIDATE[Validate Input]
    
    VALIDATE --> CHECK_ACC[Verify Account Ownership]
    CHECK_ACC --> ACC_EXISTS{Account Exists?}
    
    ACC_EXISTS -->|No| NOT_FOUND[404 Not Found]
    ACC_EXISTS -->|Yes| CHECK_CAT[Verify Category]
    
    CHECK_CAT --> CREATE_TX[Create Transaction]
    CREATE_TX --> UPDATE_BAL[Update Account Balance]
    
    UPDATE_BAL --> TX_TYPE{Transaction Type}
    TX_TYPE -->|Income| ADD[Add to Balance]
    TX_TYPE -->|Expense| SUBTRACT[Subtract from Balance]
    TX_TYPE -->|Transfer| TRANSFER[Adjust Both Accounts]
    
    ADD --> COMMIT[Commit Transaction]
    SUBTRACT --> COMMIT
    TRANSFER --> COMMIT
    
    COMMIT --> CHECK_BUDGET[Check Budget Impact]
    CHECK_BUDGET --> RESPONSE[Return Transaction]
```

### 3.3 Budget Progress Calculation Flow

```mermaid
flowchart TD
    REQ[GET /budgets/:id/progress] --> LOAD_BUDGET[Load Budget]
    LOAD_BUDGET --> GET_PERIOD[Determine Period]
    
    GET_PERIOD --> PERIOD_TYPE{Period Type}
    PERIOD_TYPE -->|Weekly| WEEK[Calculate Week Range]
    PERIOD_TYPE -->|Monthly| MONTH[Calculate Month Range]
    PERIOD_TYPE -->|Yearly| YEAR[Calculate Year Range]
    
    WEEK --> QUERY_TX[Query Transactions]
    MONTH --> QUERY_TX
    YEAR --> QUERY_TX
    
    QUERY_TX --> FILTER[Filter by Category]
    FILTER --> SUM[Sum Amounts]
    
    SUM --> CALC_PROGRESS[Calculate Progress]
    CALC_PROGRESS --> SPENT[spent_amount]
    CALC_PROGRESS --> REMAINING[remaining_amount]
    CALC_PROGRESS --> PERCENT[percentage_used]
    
    SPENT --> RESPONSE[Return Progress]
    REMAINING --> RESPONSE
    PERCENT --> RESPONSE
```

---

## 4. Data Lineage

### 4.1 Transaction Data Lineage

```mermaid
flowchart TB
    subgraph "Input"
        API_INPUT[API Request Body]
    end

    subgraph "Validation"
        PYDANTIC[Pydantic Model]
        ZOD_FE[Zod Schema Frontend]
    end

    subgraph "Processing"
        SERVICE[Transaction Service]
        BALANCE[Balance Calculator]
    end

    subgraph "Storage"
        TX_TABLE[(transactions table)]
        ACC_TABLE[(accounts table)]
    end

    subgraph "Output"
        API_RESP[API Response]
        DASHBOARD[Dashboard Update]
        REPORTS[Report Data]
    end

    API_INPUT --> PYDANTIC
    PYDANTIC --> SERVICE
    SERVICE --> TX_TABLE
    SERVICE --> BALANCE
    BALANCE --> ACC_TABLE
    
    TX_TABLE --> API_RESP
    TX_TABLE --> REPORTS
    ACC_TABLE --> DASHBOARD
```

### 4.2 Budget Tracking Data Lineage

```mermaid
flowchart TB
    subgraph "Sources"
        TX[Transactions]
        BUDGET[Budget Definition]
    end

    subgraph "Aggregation"
        PERIOD[Period Filter]
        CATEGORY[Category Filter]
        SUM[Amount Aggregation]
    end

    subgraph "Calculation"
        SPENT[Total Spent]
        LIMIT[Budget Limit]
        PROGRESS[Progress %]
    end

    subgraph "Output"
        UI[Progress Bar UI]
        ALERT[Over-budget Alert]
        FORECAST[Spending Forecast]
    end

    TX --> PERIOD
    PERIOD --> CATEGORY
    CATEGORY --> SUM
    SUM --> SPENT
    
    BUDGET --> LIMIT
    
    SPENT --> PROGRESS
    LIMIT --> PROGRESS
    
    PROGRESS --> UI
    PROGRESS --> ALERT
    SPENT --> FORECAST
```

---

## 5. Class Structure

### 5.1 Backend Models

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String hashed_password
        +String name
        +DateTime created_at
        +List~Account~ accounts
        +List~Budget~ budgets
        +List~Goal~ goals
        +verify_password(password)
    }

    class Account {
        +UUID id
        +UUID user_id
        +String name
        +AccountType type
        +Decimal balance
        +String currency
        +DateTime created_at
        +List~Transaction~ transactions
        +update_balance(amount, type)
    }

    class Transaction {
        +UUID id
        +UUID account_id
        +UUID category_id
        +Decimal amount
        +TransactionType type
        +String description
        +Date transaction_date
        +DateTime created_at
    }

    class Category {
        +UUID id
        +String name
        +CategoryType type
        +String icon
        +String color
    }

    class Budget {
        +UUID id
        +UUID user_id
        +UUID category_id
        +Decimal amount
        +BudgetPeriod period
        +Date start_date
        +Date end_date
        +get_progress()
    }

    class Goal {
        +UUID id
        +UUID user_id
        +String name
        +Decimal target_amount
        +Decimal current_amount
        +Date target_date
        +List~Contribution~ contributions
        +add_contribution(amount)
        +get_progress()
    }

    User "1" --> "*" Account
    User "1" --> "*" Budget
    User "1" --> "*" Goal
    Account "1" --> "*" Transaction
    Category "1" --> "*" Transaction
    Category "1" --> "*" Budget
```

### 5.2 Service Layer Classes

```mermaid
classDiagram
    class AuthService {
        +register(user_data) User
        +login(credentials) Token
        +refresh_token(refresh) Token
        +get_current_user(token) User
        -hash_password(password)
        -verify_password(password, hash)
        -create_tokens(user)
    }

    class AccountService {
        +create_account(user_id, data) Account
        +get_accounts(user_id) List~Account~
        +get_account(id) Account
        +update_account(id, data) Account
        +delete_account(id) bool
        +get_balance(id) Decimal
    }

    class TransactionService {
        +create_transaction(data) Transaction
        +get_transactions(filters) List~Transaction~
        +update_transaction(id, data) Transaction
        +delete_transaction(id) bool
        +get_by_category(user_id, period) Dict
    }

    class BudgetService {
        +create_budget(data) Budget
        +get_budgets(user_id) List~Budget~
        +get_progress(budget_id) Progress
        +check_limit(category_id, amount) bool
    }

    class ReportService {
        +get_summary(user_id, period) Summary
        +get_spending_report(user_id, period) Report
        +get_income_report(user_id, period) Report
        +get_forecast(user_id, months) Forecast
    }

    AuthService --> AccountService
    AccountService --> TransactionService
    TransactionService --> BudgetService
    BudgetService --> ReportService
```

---

## 6. Sequence Diagrams

### 6.1 User Registration Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant AUTH as AuthService
    participant DB as PostgreSQL

    C->>API: POST /auth/register {email, password, name}
    API->>API: Validate input (Pydantic)
    API->>AUTH: register(user_data)
    
    AUTH->>DB: Check email exists
    DB-->>AUTH: Result
    
    alt Email Exists
        AUTH-->>API: UserExistsError
        API-->>C: 409 Conflict
    else Email Available
        AUTH->>AUTH: hash_password(password)
        AUTH->>DB: INSERT user
        DB-->>AUTH: User record
        AUTH->>AUTH: create_tokens(user)
        AUTH-->>API: {user, tokens}
        API-->>C: 201 Created {user, tokens}
    end
```

### 6.2 Transaction Creation Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant TX as TransactionService
    participant ACC as AccountService
    participant BUD as BudgetService
    participant DB as PostgreSQL

    C->>API: POST /transactions {account_id, amount, type, category_id}
    API->>API: Verify JWT
    API->>TX: create_transaction(data)
    
    TX->>ACC: verify_account_ownership(account_id, user_id)
    ACC->>DB: SELECT account
    DB-->>ACC: Account record
    ACC-->>TX: Account verified
    
    TX->>DB: INSERT transaction
    DB-->>TX: Transaction record
    
    TX->>ACC: update_balance(account_id, amount, type)
    ACC->>DB: UPDATE account SET balance
    DB-->>ACC: Updated
    
    TX->>BUD: check_budget_impact(category_id, amount)
    BUD->>DB: SELECT budget progress
    DB-->>BUD: Budget data
    
    alt Over Budget
        BUD-->>TX: Warning notification
    end
    
    TX-->>API: Transaction created
    API-->>C: 201 Created {transaction}
```

### 6.3 Dashboard Data Loading Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as FastAPI
    participant ACC as AccountService
    participant TX as TransactionService
    participant REP as ReportService
    participant DB as PostgreSQL

    FE->>API: GET /accounts (parallel)
    FE->>API: GET /transactions/recent (parallel)
    FE->>API: GET /reports/summary (parallel)
    
    par Account Loading
        API->>ACC: get_accounts(user_id)
        ACC->>DB: SELECT accounts
        DB-->>ACC: Accounts[]
        ACC-->>API: Accounts
        API-->>FE: Accounts data
    and Transaction Loading
        API->>TX: get_recent_transactions(user_id)
        TX->>DB: SELECT transactions LIMIT 10
        DB-->>TX: Transactions[]
        TX-->>API: Transactions
        API-->>FE: Transactions data
    and Summary Loading
        API->>REP: get_summary(user_id)
        REP->>DB: Aggregate queries
        DB-->>REP: Summary data
        REP-->>API: Summary
        API-->>FE: Summary data
    end
    
    FE->>FE: Render dashboard
```

### 6.4 Expense Forecast Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant REP as ReportService
    participant DB as PostgreSQL

    C->>API: GET /reports/forecast?months=3
    API->>REP: get_forecast(user_id, months=3)
    
    REP->>DB: SELECT transactions (last 6 months)
    DB-->>REP: Historical transactions
    
    REP->>REP: Group by category
    REP->>REP: Calculate monthly averages
    REP->>REP: Apply trend analysis
    REP->>REP: Project future spending
    
    REP-->>API: {forecasted_expenses, confidence, categories}
    API-->>C: 200 OK {forecast}
```

---

## 7. Unified System Map

```mermaid
graph TB
    subgraph "Personal Finance App"
        subgraph "Frontend"
            NEXT[Next.js App]
            DASH[Dashboard]
            ACC_UI[Accounts UI]
            TX_UI[Transactions UI]
        end

        subgraph "Backend"
            FAST[FastAPI]
            AUTH[Auth Service]
            SERVICES[Business Services]
        end

        subgraph "Database"
            PG[(PostgreSQL)]
        end

        subgraph "Features"
            BUDGET[Budget Tracking]
            GOALS[Goal Setting]
            REPORTS[Reports & Analytics]
            FORECAST[Forecasting]
        end
    end

    NEXT --> FAST
    DASH --> FAST
    ACC_UI --> FAST
    TX_UI --> FAST
    
    FAST --> AUTH
    FAST --> SERVICES
    
    SERVICES --> PG
    
    SERVICES --> BUDGET
    SERVICES --> GOALS
    SERVICES --> REPORTS
    SERVICES --> FORECAST

    classDef frontend fill:#e1f5fe
    classDef backend fill:#c8e6c9
    classDef db fill:#f3e5f5
    classDef feature fill:#fff3e0

    class NEXT,DASH,ACC_UI,TX_UI frontend
    class FAST,AUTH,SERVICES backend
    class PG db
    class BUDGET,GOALS,REPORTS,FORECAST feature
```

---

## Usage

View these diagrams in:
- GitHub/GitLab markdown preview
- VS Code with Mermaid extension
- [Mermaid Live Editor](https://mermaid.live/)
