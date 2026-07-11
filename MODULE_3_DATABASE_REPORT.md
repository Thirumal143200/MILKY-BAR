# Module 3: Database & Data Layer Report

This report summarizes the implementation, testing, performance tuning, security verification, and CI status of the **Database & Data Layer (Module 3)** for the MilkBoy project.

---

## 1. Database Design

- **Normalization**: The database schema conforms strictly to **3rd Normal Form (3NF)**. Table relations are split cleanly between identity, transactions, configuration, machine learning models, notifications, and queues.
- **Schema Integrity**:
  - All tables are built with strong constraints (`NOT NULL`, `UNIQUE` where appropriate) and explicitly typed primary keys (`UUID` with auto-generation).
  - Foreign key references enforce referential integrity across the system.
  - Cascade deletion rules (`ON DELETE CASCADE`) are strategically set on child tables (like `user_sessions`, `scan_images`, `role_permissions`, etc.) to prevent orphaned records and maintain data cleanliness.
- **Soft Deletes**: Implemented `deleted_at` timestamp columns for key operational tables:
  - `users`
  - `scans`
  - `batches`
- **Sync Queue Support**: Designed and added the `sync_queue` table to track offline events, bulk jobs, or sync payloads between client-server environments.

---

## 2. CRUD Verification

- Centralized CRUD actions are implemented via Knex query builders.
- Standard transactions manage compound inserts/updates (e.g. user session creation, scan image uploads, prediction logs).
- Validated that no duplicate records can be inserted for uniqueness constraints (e.g. duplicate user emails or duplicate role-permission assignments).

---

## 3. Environment Switching & Connection Pools

We have verified the automatic environment client switching mechanism:

- **Development/Test**: Dynamically loads `sqlite3` using single file lock configuration (`min: 1, max: 1` pools) to prevent SQLite database locks.
- **Production**: Switches automatically to PostgreSQL (`pg` client) when `NODE_ENV=production`, using connection pooling configs (`min: 2, max: 10`) and SSL configuration enabled.

---

## 4. Migrations & Seeding

- Central programmatic scripts `migrate.ts` and `reset.ts` manage forward and rollback database lifecycle processes.
- Automatically validated schema states at runtime.
- The seeding script (`seed.ts`) populates roles, permissions, a default Super Admin account (`admin@milkboy.app`), system settings, and sample scans.

---

## 5. Backup & Restore System

- **Backup Script (`scripts/backup.ts`)**:
  - Creates timestamped copies of the SQLite file in dev.
  - Performs `pg_dump` compressed binary snapshots in prod.
  - Inserts execution log audits (`status: pending/success/failed`, `file_size`, `error_message`) into the database `backup_logs` table.
- **Restore Script (`scripts/restore.ts`)**:
  - Copies SQLite backups back over active databases in dev.
  - Invokes `pg_restore` single-transaction cleanups (`-1 -c`) in prod.
- **Disaster Recovery Tests**: Written E2E test suite in `backup-restore.test.ts` programmatically executing backups, modifying database variables, triggering restorations, and verifying complete recovery of previous states.

---

## 6. Performance Optimization

- **Connection Pool Optimization**: Checked SQLite connection thresholds to prevent `SQLITE_BUSY` states.
- **Indexes Added**: Checked and added indexes on critical foreign keys and query filters:
  - `users(email, status, role_id)`
  - `user_sessions(user_id, expires_at)`
  - `scans(user_id, status, created_at)`
  - `scan_images(scan_id)`
  - `predictions(scan_id, image_id, quality_label)`
  - `batches(user_id, status)`
  - `sync_queue(status, run_at)`

---

## 7. Security Verification

- **SQL Injection Prevention**: All queries utilize Knex query builder parameters, preventing SQL injection vulnerabilities.
- **Parameterized Raw Queries**: Any fallback raw queries use safe parameter-binding blocks.
- **Least Privilege Strategy**: Documented permission structures for production execution in the architecture guide.

---

## 8. Continuous Integration (CI) Status

All database integration tests, backup tests, and formatting audits run automatically in GitHub Actions.

- **Vitest Suite**: **34/34 tests passed** (including the new `backup-restore.test.ts` suite).
- **GitHub Actions Status**: **100% Green / Success** ✅
  - Main CI Workflow Run #35: **Success**
  - Backend CI/CD Workflow Run #21: **Success**
