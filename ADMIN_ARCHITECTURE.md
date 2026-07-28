# Enterprise Super Admin Platform Architecture

This document describes the design, RBAC security matrix, dashboard layout, live database analytics engine, and monitoring infrastructure of the **MilkBoy Super Admin Platform**.

---

## 1. Architectural Overview

```
                         ┌─────────────────────────────┐
                         │   Next.js Super Admin UI    │
                         │   (/super-admin/* pages)    │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │    Express REST Admin API   │
                         │     (/api/v1/admin/*)       │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │       RBAC Middleware       │
                         │ (requireRole('super_admin') │
                         │    & requirePermission)     │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │     AdminService Engine     │
                         │  (Live Knex SQL Aggregates) │
                         └──────────────┬──────────────┘
                                        │
   ┌────────────────────┬───────────────┴───────────────┬────────────────────┐
   ▼                    ▼                               ▼                    ▼
┌─────────────┐  ┌─────────────┐               ┌─────────────────┐  ┌────────────────┐
│  `users`    │  │   `scans`   │               │ `lab_validations`│  │  `audit_logs`  │
│  `roles`    │  │`predictions`│               │  & `reports`    │  │ & `backup_logs`│
└─────────────┘  └─────────────┘               └─────────────────┘  └────────────────┘
```

---

## 2. Core Security & RBAC Enforcement

1. **Role Restrictions**:
   - `super_admin`: Full unrestricted system access across all portals.
   - `admin`: Restricted administrative management access.
   - All other roles (`producer`, `consumer`, `lab_staff`): Strictly denied with `403 Forbidden` on both server REST endpoints and Next.js client routes.

2. **Audit Logging Integration**:
   - Every administrative modification (user creation, status toggle, role change, feature flag update, system setting modification, and manual backup trigger) is captured by `auditMiddleware` and persisted to `audit_logs` and `backup_logs`.

---

## 3. Web Dashboard Portals (`/super-admin/`)

- `/super-admin/page.tsx` — Main System Overview dashboard (User, Scan, AI, Storage, DB, Recent Activity).
- `/super-admin/users/page.tsx` — User management CRUD, role switcher, deactivate/reactivate, search.
- `/super-admin/producers/page.tsx` — Producer management and milk collection metrics.
- `/super-admin/consumers/page.tsx` — Consumer activity and history.
- `/super-admin/laboratory/page.tsx` — Lab staff overview, validation queue status, confirmed/rejected breakdown.
- `/super-admin/ai/page.tsx` — AI model health, inference counts, confidence metrics, and dataset status banner (`Pipeline Ready – Awaiting Production Dataset`).
- `/super-admin/monitoring/page.tsx` — Real-time memory heap usage, uptime, active sessions, table row counts.
- `/super-admin/audit-logs/page.tsx` — Audit log viewer with search, filtering, and JSON/CSV export.
