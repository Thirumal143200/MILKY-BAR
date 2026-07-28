# System Health & Performance Monitoring Guide

This document explains system resource tracking, database diagnostics, memory heap monitoring, and API latency instrumentation in **MilkBoy**.

---

## 1. System Monitoring Metrics

- **Node.js Process Memory**:
  - `rssMb`: Resident Set Size in Megabytes.
  - `heapTotalMb`: Total allocated V8 heap.
  - `heapUsedMb`: Active V8 memory usage.
- **Process Uptime**: Seconds elapsed since server initialization (`process.uptime()`).
- **Database Status**: Client engine type (`SQLite` / `PostgreSQL`) and table record counts.
- **Active User Sessions**: Count of unexpired active user session tokens in `user_sessions`.

---

## 2. API Diagnostics Endpoint (`GET /api/v1/admin/monitoring`)

Sample JSON response:
```json
{
  "success": true,
  "data": {
    "uptimeSeconds": 86400,
    "activeSessionsCount": 12,
    "memory": {
      "rssMb": 85,
      "heapTotalMb": 48,
      "heapUsedMb": 32
    },
    "nodeVersion": "v20.11.0",
    "environment": "development"
  }
}
```
