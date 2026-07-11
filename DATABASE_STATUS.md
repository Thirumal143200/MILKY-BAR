# Database Configuration & Status Report

This document reports the current database configuration, active database provider, connection details, and operation capability for the **MilkBoy** project.

---

## 1. Database Configuration Details

| Parameter               | Actual Configuration / Value | Details                                                                            |
| :---------------------- | :--------------------------- | :--------------------------------------------------------------------------------- |
| **Active Provider**     | **SQLite**                   | Configured via `DB_CLIENT=sqlite` in `server/.env`.                                |
| **Cloud vs Local**      | **Local**                    | Stored in the local file `./data/milkboy.sqlite`.                                  |
| **ORM / Query Builder** | **Knex.js**                  | Programmatic builder utilizing TypeScript interfaces.                              |
| **Migration State**     | **Migrated & Seeded**        | Schema migration `001_initial_schema.ts` sets up 24 tables.                        |
| **Test Environment DB** | **In-Memory SQLite**         | Test scripts override the database file to `:memory:` for clean test environments. |
| **Production Provider** | **PostgreSQL**               | Dual provider support is pre-written in `connection.ts`.                           |

---

## 2. Environment Variables & Connection Details

All connection configurations flow through the centralized config module in `server/src/config/env.ts`, which loads environment variables from `server/.env`.

### Required Environment Variables

```bash
# Database client selector ('sqlite' | 'postgresql')
DB_CLIENT=sqlite

# SQLite Path (used when DB_CLIENT=sqlite)
SQLITE_FILENAME=./data/milkboy.sqlite

# PostgreSQL Connection Credentials (used when DB_CLIENT=postgresql)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=milkboy
DB_USER=milkboy
DB_PASSWORD=your_secure_password_here
```

### Placeholder Credentials Found in `server/.env`

- **Database Password**: `DB_PASSWORD=your_secure_password_here` (PostgreSQL placeholder)
- **JWT Security Secrets**:
  - `JWT_SECRET=change_this_to_a_random_64_char_string_in_production`
  - `JWT_REFRESH_SECRET=change_this_to_another_random_64_char_string`
- **Encryption Key**: `ENCRYPTION_KEY=change_this_to_a_32_byte_hex_string`
- **SMTP Credentials**:
  - `SMTP_USER=your_email@gmail.com`
  - `SMTP_PASSWORD=your_app_password`

---

## 3. CRUD Capability & Operation Readiness

The application is **fully capable** of performing complete CRUD operations:

1. **Active Seed Data**: Running `npm run db:seed` inserts system roles, permissions, a default Super Admin account, and sample data.
2. **End-to-End Test Suite**: Complete integration tests verify database actions:
   - **Create**: Registration (`users` table insert), Scan Creation (`scans` table insert), Session Insertion (`user_sessions` table insert).
   - **Read**: Fetching profile, listing scans, mapping roles and permissions.
   - **Update**: Lockout attempts increments, password updates, MFA setup flags.
   - **Delete**: Logout session deletion, scan deletion.

All tests pass cleanly, confirming database read/write actions work without issue.
