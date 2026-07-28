# Notification Event Flow Guide

This document maps all application events to notification categories, target roles, and delivery channels in **MilkBoy**.

---

## 1. Application Event Mapping Matrix

| Category   | Event Name                   | Trigger Location               | Target Audience            | Priority | Default Title               |
| :--------- | :--------------------------- | :----------------------------- | :------------------------- | :------- | :-------------------------- |
| **Auth**   | `auth:register`              | User Registration              | User                       | `normal` | Welcome to MilkBoy!         |
| **Auth**   | `auth:verify_email`          | Email Verification             | User                       | `normal` | Email Verified              |
| **Auth**   | `auth:password_change`       | Password Reset / Change        | User                       | `high`   | Password Changed            |
| **Auth**   | `auth:new_device`            | Login from Unknown IP/Device   | User                       | `high`   | Login from New Device       |
| **Auth**   | `auth:mfa_enabled`           | MFA Setup Complete             | User                       | `normal` | Multi-Factor Auth Enabled   |
| **Scan**   | `scan:started`               | Scan Initiated                 | User                       | `low`    | Scan Started                |
| **Scan**   | `scan:completed`             | Scan Image Analysis Complete   | User                       | `normal` | Scan Analysis Completed     |
| **Scan**   | `scan:failed`                | Scan Processing Error          | User                       | `high`   | Scan Processing Failed      |
| **Scan**   | `scan:poor_quality`          | Image Quality Check Rejection  | User                       | `normal` | Poor Image Quality          |
| **Scan**   | `scan:ai_ready`              | AI Quality Model Result Ready  | User                       | `normal` | AI Prediction Ready         |
| **Report** | `report:pdf_generated`       | PDF Report Compilation         | User                       | `normal` | PDF Report Generated        |
| **Report** | `report:ready`               | Report Available               | User                       | `normal` | Report Ready                |
| **Report** | `report:qr_verified`         | Public QR Scan Verification    | User                       | `low`    | QR Code Verified            |
| **Sync**   | `sync:started`               | Offline Sync Worker Started    | User                       | `low`    | Sync Started                |
| **Sync**   | `sync:success`               | Offline Sync Batch Completed   | User                       | `normal` | Offline Sync Complete       |
| **Sync**   | `sync:failed`                | Sync Retry Batch Error         | User                       | `high`   | Offline Sync Warning        |
| **Sync**   | `sync:retry_required`        | Network Reconnection Trigger   | User                       | `normal` | Sync Retry Required         |
| **Lab**    | `lab:sample_approved`        | Lab Verification Confirmed     | User                       | `normal` | Laboratory Sample CONFIRMED |
| **Lab**    | `lab:sample_rejected`        | Lab Verification Rejected      | User                       | `high`   | Laboratory Sample REJECTED  |
| **Lab**    | `lab:verification_completed` | Validation Record Inserted     | User                       | `normal` | Lab Verification Completed  |
| **Admin**  | `admin:new_user`             | User Self-Registration         | Role: `admin`              | `normal` | New User Registered         |
| **Admin**  | `admin:system_warning`       | Maintenance or Alert Broadcast | Role: `producer` / `admin` | `high`   | System Warning              |
| **Admin**  | `admin:backup_completed`     | Database Backup Routine        | Role: `super_admin`        | `low`    | Database Backup Completed   |
| **Admin**  | `admin:model_updated`        | PyTorch Model Hot-reload       | Role: `admin`              | `normal` | AI Model Updated            |
| **Admin**  | `admin:security_alert`       | Security Audit Anomaly         | Role: `admin`              | `urgent` | Security Alert              |

---

## 2. Event Dispatch Implementation Pattern

Core services invoke `notificationDispatcher.dispatch`:

```typescript
import { notificationDispatcher } from '../../services/notifications/notificationDispatcher.js';

await notificationDispatcher.dispatch({
  event: 'scan:completed',
  userId: 'user-uuid-1234',
  title: 'Scan Analysis Completed',
  message: 'Milk quality scan has been processed successfully.',
  data: { scanId: 'scan-uuid-5678' },
});
```
