# Database Backup & Restore Guide

This guide explains how database backup and restore scripts work, how to execute backups, and how to verify recovery states in development (SQLite) and production (PostgreSQL).

---

## 1. Backup Operations

Backups are handled by the script at `server/scripts/backup.ts`.
It supports both SQLite (direct file copies) and PostgreSQL (compressed custom format dumps using `pg_dump`).

### Executing a Backup

To execute a backup, run:
```bash
# Run from the server directory
npm run db:backup
```
*(Or manually run `npx tsx scripts/backup.ts`)*

### Backup Actions Flow
1. Resolves a `backups/` directory inside the workspace.
2. Formats a timestamped backup name: `backup_<db_name>_<timestamp>.sql`.
3. Inserts an initial transaction record into the database table `backup_logs` with a status of `pending`.
4. **SQLite Execution**: Copies the active SQLite file directly to the backup path.
5. **PostgreSQL Execution**: Runs `pg_dump` with compressed archive configuration (`-F c`).
6. Updates the database `backup_logs` status to `success`, logging the exact file size and timestamp.
7. If an error occurs, the log is updated to `failed` alongside the exception message.

---

## 2. Restore / Recovery Operations

Restores are handled by the script at `server/scripts/restore.ts`.
It supports both SQLite file restoration and PostgreSQL structural restoration using `pg_restore`.

### Executing a Restore

To restore the database to a specific snapshot, run:
```bash
# Run from the server directory, passing the filename of the SQL backup
npx tsx scripts/restore.ts <backup_filename.sql>
```

### Recovery Actions Flow
1. Confirms the existence of the file in the `backups/` folder.
2. **SQLite Restoration**:
   * Copies the backup file directly over the active database path.
3. **PostgreSQL Restoration**:
   * Triggers `pg_restore` using standard connection parameters:
     `pg_restore -h <host> -p <port> -U <user> -d <name> -1 -c <backup_file_path>`
   * `-1` enforces single-transaction restoration.
   * `-c` drops database objects before recreation.

---

## 3. Disaster Recovery Verification

To perform routine backup and restore verification:
1. Trigger a manual backup: `npx tsx scripts/backup.ts`.
2. Retrieve the latest file from `server/backups/`.
3. Make temporary, verifiable modifications to system settings or flags.
4. Close all active database client instances to release database locks.
5. Trigger restore: `npx tsx scripts/restore.ts <latest_backup_filename>`.
6. Re-open the database client and verify that the database has successfully rolled back, containing only pre-snapshot state.
