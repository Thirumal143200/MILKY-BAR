# Environment Variables Reference

Complete list of environment variables used across **MilkBoy** backend, AI service, and web dashboard.

---

## 1. Backend Server Environment Variables (`server`)

| Variable Name        | Required | Default (Dev)                                          | Description                                             |
| :------------------- | :------- | :----------------------------------------------------- | :------------------------------------------------------ |
| `NODE_ENV`           | Yes      | `development`                                          | Environment mode (`development`, `production`, `test`). |
| `PORT`               | No       | `4000`                                                 | Server HTTP port.                                       |
| `DB_CLIENT`          | Yes      | `sqlite3`                                              | Knex database client (`sqlite3` or `pg`).               |
| `DATABASE_URL`       | Prod     | `postgresql://postgres:password@postgres:5432/milkboy` | PostgreSQL connection string.                           |
| `DB_FILENAME`        | Dev      | `./dev.sqlite3`                                        | SQLite database file location.                          |
| `JWT_SECRET`         | Yes      | `dev_secret_key`                                       | Secret key for access tokens.                           |
| `JWT_REFRESH_SECRET` | Yes      | `dev_refresh_key`                                      | Secret key for refresh tokens.                          |
| `AI_SERVICE_URL`     | Yes      | `http://localhost:8000/api/v1`                         | Base URL of FastAPI AI Service.                         |
| `STORAGE_PROVIDER`   | No       | `local`                                                | Upload storage adapter (`local` or `cloud`).            |

---

## 2. AI Service Environment Variables (`ai_service`)

| Variable Name  | Required | Default                                       | Description                  |
| :------------- | :------- | :-------------------------------------------- | :--------------------------- |
| `PROJECT_NAME` | No       | `MilkBoy AI`                                  | Service header display name. |
| `VERSION`      | No       | `1.0.0`                                       | API version string.          |
| `CORS_ORIGINS` | No       | `http://localhost:3000,http://localhost:4000` | Allowed origins.             |

---

## 3. Web Dashboard Environment Variables (`web`)

| Variable Name         | Required | Default                        | Description                |
| :-------------------- | :------- | :----------------------------- | :------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | `http://localhost:4000/api/v1` | Public REST API base URL.  |
| `NEXTAUTH_SECRET`     | Prod     | `nextauth_prod_secret`         | Session encryption secret. |
