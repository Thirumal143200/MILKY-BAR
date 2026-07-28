# Audit Logging & Security Event Guide

This document describes the immutable audit logging system, captured security actions, log viewer UI, and export options in **MilkBoy**.

---

## 1. Captured Audit Actions

| Category                | Action Key                                                                  | Description                                 |
| :---------------------- | :-------------------------------------------------------------------------- | :------------------------------------------ |
| **Authentication**      | `login`, `logout`, `register`, `mfa_setup`, `password_reset`                | User authentication lifecycle events.       |
| **User Administration** | `user_create`, `user_update`, `user_delete`, `user_suspend`                 | Super Admin user modification events.       |
| **Milk Scans & Images** | `scan_create`, `scan_delete`, `image_upload`, `prediction_run`              | Core scan processing actions.               |
| **Reports**             | `report_generate`, `report_download`                                        | Report compilation and download access.     |
| **System & Security**   | `settings_update`, `feature_flag_toggle`, `backup_create`, `backup_restore` | System setting changes and backup routines. |

---

## 2. Viewing & Exporting Audit Logs

- **Web Dashboard**: Navigate to `/super-admin/audit-logs`.
- **Search**: Search by user email, resource, or action keyword.
- **Export**: Click **Export JSON** to download a structured JSON dump of all audit log events.
