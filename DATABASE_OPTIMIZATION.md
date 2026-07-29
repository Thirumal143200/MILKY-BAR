# MilkBoy Database Optimization & Indexing Guide

This document details all database optimizations, index strategies, query plan enhancements, and connection pool configurations across the MilkBoy PostgreSQL / SQLite database layer.

---

## 🔑 Database Indexing Architecture

To support sub-millisecond execution times on high-traffic endpoints, high-cardinality compound indexes were added in migration `002_performance_indexes.ts`.

### 1. `notifications` Table Indexes

```sql
CREATE INDEX idx_notifications_user_read_created ON notifications (user_id, read, created_at);
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at);
```

- **Use Case**: Accelerates unread notifications badge counts (`WHERE user_id = ? AND read = false`) and paginated notification feeds (`WHERE user_id = ? ORDER BY created_at DESC`).

### 2. `scans` Table Indexes

```sql
CREATE INDEX idx_scans_user_status_created ON scans (user_id, status, created_at);
CREATE INDEX idx_scans_status_created ON scans (status, created_at);
```

- **Use Case**: Speeds up filtered user scan history queries (`WHERE user_id = ? AND status = ? ORDER BY created_at DESC`) and administrative scan review queues.

### 3. `predictions` Table Indexes

```sql
CREATE INDEX idx_predictions_scan_created ON predictions (scan_id, created_at);
CREATE INDEX idx_predictions_scan_quality ON predictions (scan_id, quality_label);
```

- **Use Case**: Enables instant lookup of AI prediction results and confidence scores attached to single milk scan records.

### 4. `scan_images` Table Indexes

```sql
CREATE INDEX idx_scan_images_scan_quality ON scan_images (scan_id, quality_status);
```

- **Use Case**: Rapidly resolves image attachments and quality checks for scan analysis workflows.

### 5. `audit_logs` Table Indexes

```sql
CREATE INDEX idx_audit_logs_action_created ON audit_logs (action, created_at);
```

- **Use Case**: Enables fast filtering in Super Admin audit trail interfaces without performing full table scans.

---

## ⚡ Connection Pooling & Query Best Practices

1. **Connection Pool Bounds**:
   - `min`: 2 connections
   - `max`: 20 connections
   - `idleTimeoutMillis`: 30,000 ms

2. **Transaction Isolation**:
   - Use `db.transaction()` for atomic operations (e.g. user creation + role assignment, batch sync writes).

3. **In-Memory Caching Integration**:
   - High-cost aggregate queries (e.g., `COUNT(*) GROUP BY quality_label`) are wrapped in `globalCache` with a 15-30s TTL.
