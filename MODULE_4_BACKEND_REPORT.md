# Module 4: Backend APIs & Business Logic Report

This report summarizes the implementation, documentation, and verification of **Module 4: Backend APIs & Business Logic** for the MilkBoy application.

---

## 1. APIs & Routes Implemented

We created/exposed the following endpoints under `/api/v1`:

### 1.1 Authentication & Session Control

- `POST /auth/register` — Registers new users with secure password hashing.
- `POST /auth/login` — Sign-in with session initialization and MFA detection.
- `POST /auth/logout` — Revokes the active user session.
- `POST /auth/refresh-token` — Rotates JWT access and refresh tokens.
- `POST /auth/forgot-password` — Requests a password reset link.
- `POST /auth/reset-password` — Executes password resets using tokens.
- `POST /auth/verify-email` — Confirms email address verification.
- `POST /auth/verify-mfa` — Verifies TOTP tokens to enable MFA.
- `DELETE /auth/logout-all-devices` — Revokes all sessions for the authenticated user.

### 1.2 User & Admin Management

- `GET /users/me` — Fetches profile details.
- `PUT /users/profile` — Modifies names, phone numbers, language, or theme.
- `PUT /users/change-password` — Updates password validating old credentials.
- `POST /admin/users` — Allows admins to create new users.
- `GET /admin/users/:id` — Retreives details for a specific user.
- `DELETE /admin/users/:id` — Performs soft deletes (`deleted_at = now()`).
- `POST /admin/users/:id/deactivate` — Deactivates user status.
- `POST /admin/users/:id/reactivate` — Reactivates user status.
- `GET /admin/permissions` — List all permissions.
- `GET /admin/roles` — List all roles.
- `GET /admin/roles/:id/permissions` — Lists role permission junctions.
- `POST /admin/roles/:id/permissions` — Syncs permissions of a role inside a transaction.

### 1.3 Scans & Batches

- `GET /scans/:id/prediction` — Retrieves prediction details.
- `POST /scans/:id/retry` — Resets failed scans to re-analyze.
- `GET /batches/:id/results` — Returns batch scanning quality statistics.

### 1.4 Preprocessing & Machine Learning (AI Module)

- `POST /ai/predict` — Direct quality inference from image upload.
- `GET /ai/model-status` — Details of the default active model version.
- `GET /ai/model-versions` — History of all model versions.
- `GET /ai/model-health` — Health state of the fastapi classifier.
- `GET /ai/confidence-score` — Threshold configuration metadata.
- `GET /ai/prediction-explanation` — Documentation of prediction labels.
- `GET /ai/preprocessing-status/:imageId` — Image processing score metrics.

### 1.5 Reports, Notifications, & Laboratory

- `GET /reports` — Listing of generated PDF reports.
- `GET /reports/export` — JSON metadata listing for exporting.
- `DELETE /notifications/:id` — Deletes a notification.
- `DELETE /notifications` — Clears all user notifications.
- `GET /notifications/preferences` — Get notification preferences.
- `PUT /notifications/preferences` — Update notification preferences in `system_settings`.
- `POST /lab/validate/:scanId/approve` — Custom validation set to `'confirmed'`.
- `POST /lab/validate/:scanId/reject` — Custom validation set to `'rejected'`.
- `GET /lab/compare` — Quality matrix comparing AI vs Lab validation results.
- `GET /lab/reports` — Consolidated list of lab validations.

### 1.6 Admin System Extensions

- `GET /admin/analytics/users` — User growth analytics.
- `GET /admin/analytics/milk` — Average confidence and scans per label.
- `GET /admin/system/database` — Row count status per table.
- `GET /admin/system/ai` — Predictions count and processing time analytics.
- `GET /admin/settings` — General system configuration.
- `PUT /admin/settings` — Update system configuration settings.

---

## 2. Technical Architecture

### 2.1 Controllers & Services

- Organized under `server/src/modules/` inside their respective folder modules:
  - `auth/` (routes, controller, service)
  - `users/` (routes, controller, service)
  - `scans/` (routes, controller, service)
  - `ai/` (routes, controller, service)
  - `batches/` (routes, controller, service)
  - `reports/` (routes, controller)
  - `notifications/` (routes, controller, service)
  - `lab/` (routes, controller, service)
  - `admin/` (routes, controller, service)

### 2.2 Middleware & Validation

- **Authentication**: JWT token verification and extraction.
- **RBAC**: Checks user role permissions using hardcoded matrices and database mappings.
- **Validation**: Strict input validation using Zod schemas.
- **Security**: Centralized rate limiting, helmet security headers, and request sanitization.

---

## 3. Verification & CI/CD Status

### 3.1 Test Results (Vitest)

All **47 tests** across all 8 test files in the workspace passed successfully (100% Green):

- `auth.integration.test.ts` (13 passed)
- `admin-user-management.integration.test.ts` (8 passed)
- `scans.integration.test.ts` (6 passed)
- `ai-endpoints.integration.test.ts` (5 passed)
- `backup-restore.test.ts` (2 passed)
- `scans.test.ts` (6 passed)
- `auth.test.ts` (5 passed)
- `integration.test.ts` (2 passed)

### 3.2 Dynamic Documentation Verification

- Serves dynamic CDN Swagger UI at `/api/v1/docs` correctly.
- Runs `/api/v1/openapi.yaml` endpoint sending correct spec data.
- Built auto-compilation files at workspace root: `OPENAPI_SPEC.yaml`, `POSTMAN_COLLECTION.json`, `API_DOCUMENTATION.md`, `API_ENDPOINTS.md`, and `ERROR_CODES.md`.
