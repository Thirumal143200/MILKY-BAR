# Disaster Recovery & Automated Backup Guide

Instructions for database backup generation, automated snapshot scheduling, point-in-time recovery, and disaster recovery.

---

## 1. Automated CLI Backup Script

To trigger an instant database snapshot:

```bash
# Execute CLI backup script
npx tsx server/scripts/backup-db.ts
```

Outputs a timestamped JSON dump file in `uploads/backups/db-dump-YYYY-MM-DDTHH-MM-SS.json`.

---

## 2. Automated Database Restore Protocol

To restore from a backup JSON snapshot:

```bash
# Execute CLI restore script
npx tsx server/scripts/restore-db.ts uploads/backups/db-dump-2026-07-28T17-51-00-000Z.json
```

---

## 3. Disaster Recovery Checklist

1. **Database Failure**: Verify PostgreSQL volume persistent storage or run restore CLI script.
2. **Storage Corruption**: Re-sync uploads directory from remote cloud storage bucket.
3. **Health Check Alert**: Inspect `/readiness` and `/liveness` endpoint status codes.
