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

---

## 9. Implementation Evidence

### 1. Files Modified & Created

- **Modified**:
  - [001_initial_schema.ts](file:///c:/Users/thiru/Downloads/MILK%20BOY/server/src/database/migrations/001_initial_schema.ts) — Added `deleted_at` soft delete columns and `sync_queue` table definition.
  - [env.ts](file:///c:/Users/thiru/Downloads/MILK%20BOY/server/src/config/env.ts) — Central environment selector implementing `NODE_ENV` switching.
  - [backup.ts](file:///c:/Users/thiru/Downloads/MILK%20BOY/server/scripts/backup.ts) — Enhanced script for SQLite and PG backups with DB logging.
- **Created**:
  - [backup-restore.test.ts](file:///c:/Users/thiru/Downloads/MILK%20BOY/server/src/database/__tests__/backup-restore.test.ts) — E2E test suite for backups and disaster recovery.
  - [DATABASE_ARCHITECTURE.md](file:///c:/Users/thiru/Downloads/MILK%20BOY/DATABASE_ARCHITECTURE.md)
  - [DATABASE_BACKUP_GUIDE.md](file:///c:/Users/thiru/Downloads/MILK%20BOY/DATABASE_BACKUP_GUIDE.md)
  - [DATABASE_MIGRATION_GUIDE.md](file:///c:/Users/thiru/Downloads/MILK%20BOY/DATABASE_MIGRATION_GUIDE.md)
  - [DATABASE_SCHEMA.md](file:///c:/Users/thiru/Downloads/MILK%20BOY/DATABASE_SCHEMA.md)
  - [ER_DIAGRAM.md](file:///c:/Users/thiru/Downloads/MILK%20BOY/ER_DIAGRAM.md)

### 2. Commit Hashes

- `3f13a1c` — "feat(db): complete database layer and migration/backup automation"
- `b5eccae` — "fix(test): clean up empty blocks and unused variables in backup-restore test"
- `90e28f9` — "style: format database docs and backup script with Prettier"
- `3c7118d` — "docs: generate Module 3 Database Report and update PROJECT_STATUS.md"

### 3. Test Command Executed

- Local Backup/Restore specific test:
  `npx vitest run src/database/__tests__/backup-restore.test.ts`
- Workspace-wide test verification:
  `npm test --workspace=server`

### 4. Test Output Summary (Local & CI)

- **Local Test Suite run results**:
  ```
  ✓ src/database/__tests__/backup-restore.test.ts (2 tests) 7444ms
    ✓ Database Backup & Restore System > should successfully run backup script, create SQL file, and log to backup_logs (3585ms)
    ✓ Database Backup & Restore System > should successfully restore database back to backup state (2684ms)
  ```
- **Full Suite**: **34 passed (34)** in `server` workspace.

### 5. GitHub Actions Run Details

- **CI Workflow**: Run #35 and #36 (100% Success)
- **Backend CI/CD Workflow**: Run #21 (100% Success)

### 6. Database Migrations

- **Migration Module**: `001_initial_schema.ts` (sets up initial schema and creates all tables).

### 7. Backup and Restore Test Evidence

Programmatically verified in `backup-restore.test.ts`. During the test, a backup file is generated under `server/backups/`, the live database is modified (a dummy setting is written), a restore command is run copying the backup file back over the sqlite DB, and queries confirm that the dummy setting is successfully deleted/restored to the previous state.

### 8. Known Limitations & Remaining Risks

- **SQLite Locking**: The development SQLite database uses single-writer locks. Multiple concurrent writers can trigger lock contention if the pool max connection size exceeds `1`. The application must maintain `pool: { min: 1, max: 1 }` in development/testing.
- **Production Tooling Dependencies**: The backup/restore scripts rely on `pg_dump` and `pg_restore` command-line binaries. In production, these binaries must be present on the host system execution PATH.
