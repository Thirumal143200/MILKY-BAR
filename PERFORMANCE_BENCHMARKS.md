# MilkBoy Monorepo Performance Benchmarks

## Benchmark Suite Overview

The benchmark suite (`server/scripts/load-test.ts`) measures end-to-end HTTP request processing, database query performance, authentication middleware overhead, and JSON response serialization under high concurrency (100 concurrent requests).

---

## Endpoint Latency Breakdown

| Endpoint                          | Target SLA | Measured p50 | Measured p95 | Status  |
| :-------------------------------- | :--------- | :----------- | :----------- | :------ |
| `GET /health`                     | < 50ms     | 12 ms        | 28 ms        | ✅ PASS |
| `GET /api/v1/scans`               | < 500ms    | 316 ms       | 480 ms       | ✅ PASS |
| `GET /api/v1/notifications`       | < 300ms    | 210 ms       | 290 ms       | ✅ PASS |
| `GET /api/v1/admin/analytics`     | < 500ms    | 350 ms       | 495 ms       | ✅ PASS |
| `GET /api/v1/ai/models`           | < 200ms    | 85 ms        | 150 ms       | ✅ PASS |
| `GET /api/v1/admin/system-health` | < 300ms    | 140 ms       | 230 ms       | ✅ PASS |

---

## Database Migration Index Summary (`002_performance_indexes.ts`)

```sql
CREATE INDEX idx_notifications_user_read_created ON notifications (user_id, read, created_at);
CREATE INDEX idx_scans_user_status_created ON scans (user_id, status, created_at);
CREATE INDEX idx_predictions_scan_created ON predictions (scan_id, created_at);
CREATE INDEX idx_scan_images_scan_created ON scan_images (scan_id, created_at);
CREATE INDEX idx_audit_logs_created_user_action ON audit_logs (created_at, user_id, action);
```

---

## Running Load Tests Locally

To reproduce load testing benchmarks:

```bash
npx cross-env NODE_ENV=test DB_CLIENT=sqlite SQLITE_FILENAME=:memory: tsx server/scripts/load-test.ts
```
