# Database Optimization & Indexing Architecture

## Database Architecture Overview

MilkBoy supports both PostgreSQL (production deployment) and SQLite (in-memory test & local development execution).

---

## Indexing Strategy & Schema Migration `002_performance_indexes.ts`

### 1. Notifications Table (`notifications`)

- Index: `idx_notifications_user_read_created` (`user_id`, `read`, `created_at`)
- Impact: Accelerates unread notification counting and user notification feed pagination.

### 2. Scans Table (`scans`)

- Index: `idx_scans_user_status_created` (`user_id`, `status`, `created_at`)
- Impact: Eliminates sequential table scans when querying user scan histories filtered by status (`completed`, `processing`, `failed`).

### 3. Predictions Table (`predictions`)

- Index: `idx_predictions_scan_created` (`scan_id`, `created_at`)
- Impact: Fast join resolution when combining scan metadata with AI prediction results.

### 4. Scan Images Table (`scan_images`)

- Index: `idx_scan_images_scan_created` (`scan_id`, `created_at`)
- Impact: Sub-millisecond lookup for raw/preprocessed images attached to a scan.

### 5. Audit Logs Table (`audit_logs`)

- Index: `idx_audit_logs_created_user_action` (`created_at`, `user_id`, `action`)
- Impact: High-speed filtering for security compliance audits and admin activity logs.

---

## Connection Pooling & Knex Configuration

- **Pool Min**: 2
- **Pool Max**: 10
- **Acquire Timeout**: 60,000 ms
- **Idle Timeout**: 30,000 ms
