# Super Admin Analytics & Metrics Guide

This document details the live backend SQL aggregation queries and metrics calculation strategy used by the **MilkBoy Analytics Engine**.

---

## 1. Analytics Endpoints Reference

| Endpoint | Method | Data Aggregated | DB Tables Queried |
| :--- | :--- | :--- | :--- |
| `/api/v1/admin/analytics` | `GET` | Overall user/scan counts, rejection rates, 7-day scan trend | `users`, `scans`, `predictions` |
| `/api/v1/admin/analytics/users` | `GET` | User breakdown by role and status | `users`, `roles` |
| `/api/v1/admin/analytics/producers` | `GET` | Total producers, active counts, total milk collections | `users`, `roles`, `scans` |
| `/api/v1/admin/analytics/consumers` | `GET` | Total consumers, active accounts list | `users`, `roles` |
| `/api/v1/admin/analytics/lab` | `GET` | Pending validation queue, confirmed vs rejected counts | `scans`, `lab_validations`, `users` |
| `/api/v1/admin/analytics/reports` | `GET` | Total A4 PDFs generated, QR codes issued, verification hits | `reports`, `report_qr_codes`, `audit_logs` |
| `/api/v1/admin/analytics/milk` | `GET` | Quality label distribution and average AI confidence | `predictions` |

---

## 2. Zero-Mock Policy Guarantee

All metrics displayed on the Super Admin platform are derived from **live database queries**:
- **Scans by Quality**: Calculated via `COUNT(*)` grouped by `predictions.quality_label`.
- **Rejection Rate**: `(rejectedScans / totalScans) * 100` calculated in real time.
- **Active Sessions**: Counted from `user_sessions` where `expires_at > NOW()`.
