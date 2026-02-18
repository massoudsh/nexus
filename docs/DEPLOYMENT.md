# Nexus — Production Deployment

This document covers production deployment: environment variables, Docker, database migrations, CORS, health checks, and optional monitoring.

## Environment variables

### Backend (API)

| Variable | Description | Production |
|----------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | Use managed Postgres (e.g. Supabase, Railway, Neon). |
| `SECRET_KEY` | JWT signing key | Generate a long random string; never use the default. |
| `DEBUG` | Enable debug mode | Set to `false`. |
| `AUTO_CREATE_DB` | Create tables on startup | Set to `false`; use migrations instead. |
| `CORS_ORIGINS` | Allowed frontend origins | Comma-separated, e.g. `https://yourapp.vercel.app,https://www.yourapp.com`. |

Copy `backend/.env.example` to `backend/.env` and set values. In production, use your platform’s secret management (e.g. Vercel env, Railway variables).

### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL, e.g. `https://api.yourapp.com/api/v1`. |

## Database migrations

Do **not** rely on `AUTO_CREATE_DB` in production. Use Alembic:

```bash
cd backend
# Set DATABASE_URL to production DB
alembic upgrade head
```

To create a new migration after model changes:

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Docker

- **Development:** `docker compose up -d --build` (uses `docker-compose.yml`: Postgres + backend with reload).
- **Production-style:** use the prod override so the backend runs without host mounts and without `--reload`:

  ```bash
  export SECRET_KEY="your-production-secret"
  export CORS_ORIGINS="https://yourapp.com"
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
  ```

Run migrations against the production DB before or after starting the backend (e.g. in CI or a one-off job).

## Health check

The API exposes a health endpoint for load balancers and monitoring:

- **GET** `/health` → `200` with `{"status":"healthy"}`.

Use this in Docker `healthcheck`, Kubernetes liveness/readiness, or your hosting provider’s health URL.

## CORS

Set `CORS_ORIGINS` to the exact origin(s) of your frontend (e.g. Vercel deployment URL). Multiple origins: comma-separated, no spaces, or as a JSON array depending on your env parsing.

## Frontend deployment (e.g. Vercel)

1. Connect the repo to Vercel.
2. Set **Root Directory** to `frontend`.
3. Set `NEXT_PUBLIC_API_URL` to your backend API base (e.g. `https://your-api.railway.app/api/v1`).
4. Deploy.

## Backend deployment (e.g. Railway, Render, Fly.io)

1. Set root to `backend` or point build to `backend/Dockerfile`.
2. Add a PostgreSQL service and set `DATABASE_URL`.
3. Set `SECRET_KEY` and `CORS_ORIGINS`.
4. Set start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (use `$PORT` if the platform provides it).
5. Run migrations in a release step or manually once.

## Logging and monitoring

- The backend uses Python `logging`; level is driven by `DEBUG`.
- For production, consider shipping logs to a provider (e.g. Datadog, Logtail, or your platform’s logging).
- Optional: add Prometheus metrics and a `/metrics` endpoint; then use Grafana or your provider’s dashboard.

## Checklist

- [ ] Strong `SECRET_KEY` set; `DEBUG=false`.
- [ ] Production `DATABASE_URL`; migrations run (`alembic upgrade head`).
- [ ] `CORS_ORIGINS` set to frontend origin(s).
- [ ] Health check configured (`/health`).
- [ ] Frontend `NEXT_PUBLIC_API_URL` points to backend API.
