# Production Environment Setup Guide

This guide details server provisioning, PostgreSQL database setup, SSL proxy configuration, and secret management for **MilkBoy**.

---

## 1. Environment Topology

```
                         ┌─────────────────────────────┐
                         │   Nginx / SSL Proxy (443)   │
                         └──────────────┬──────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Next.js Web (3000)  │    │ Express Server (4000)│    │  FastAPI AI (8000)   │
└──────────────────────┘    └───────────┬──────────┘    └──────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              ┌─────────────────────┐       ┌─────────────────────┐
              │ PostgreSQL Database │       │  Redis In-Memory    │
              │       (5432)        │       │       (6379)        │
              └─────────────────────┘       └─────────────────────┘
```

---

## 2. Database Provisioning & Automated Migrations

1. Ensure PostgreSQL 15 instance is running.
2. Execute automated Knex migrations on deployment:

```bash
npm run migrate --workspace=server
```

3. Set environment variable `DB_CLIENT=pg` and `DATABASE_URL=postgresql://user:pass@host:5432/milkboy_prod`.
