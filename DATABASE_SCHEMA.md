# Database Schema Guide

This document defines the schema, tables, types, relationships, constraints, and indexes configured in the **MilkBoy** database.

---

## 1. Schema Overview

The database uses a 3rd Normal Form (3NF) relational design. Relationships are reinforced with foreign key constraints, cascading deletions where appropriate to avoid orphan records, and explicit indexes to optimize query performance.

---

## 2. Table Definitions

### 1. `roles`
Stores system and custom roles for RBAC.
* **Columns**:
  * `id` (UUID, PK)
  * `name` (VARCHAR(50), NOT NULL, UNIQUE) — e.g., `super-admin`, `producer`, `consumer`, `lab-staff`
  * `display_name` (VARCHAR(100), NOT NULL)
  * `description` (TEXT)
  * `is_system` (BOOLEAN, NOT NULL, DEFAULT `true`)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)

### 2. `permissions`
Stores actions mapped to specific resources.
* **Columns**:
  * `id` (UUID, PK)
  * `name` (VARCHAR(100), NOT NULL, UNIQUE)
  * `resource` (VARCHAR(50), NOT NULL)
  * `action` (VARCHAR(20), NOT NULL)
  * `description` (TEXT)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Constraints**:
  * UNIQUE(`resource`, `action`)

### 3. `role_permissions`
Maps permissions to roles (many-to-many junction table).
* **Columns**:
  * `role_id` (UUID, FK -> `roles.id`, ON DELETE CASCADE)
  * `permission_id` (UUID, FK -> `permissions.id`, ON DELETE CASCADE)
* **Constraints**:
  * PRIMARY KEY(`role_id`, `permission_id`)

### 4. `users`
Core user credentials, profiles, MFA secrets, and lockout states.
* **Columns**:
  * `id` (UUID, PK)
  * `email` (VARCHAR(255), NOT NULL, UNIQUE)
  * `password_hash` (VARCHAR(255), NOT NULL)
  * `first_name` (VARCHAR(100), NOT NULL)
  * `last_name` (VARCHAR(100), NOT NULL)
  * `role_id` (UUID, FK -> `roles.id`)
  * `status` (VARCHAR(30), NOT NULL, DEFAULT `'active'`)
  * `phone` (VARCHAR(20))
  * `avatar_url` (VARCHAR(500))
  * `mfa_enabled` (BOOLEAN, NOT NULL, DEFAULT `false`)
  * `mfa_secret` (VARCHAR(255))
  * `language` (VARCHAR(5), NOT NULL, DEFAULT `'en'`)
  * `theme` (VARCHAR(10), NOT NULL, DEFAULT `'system'`)
  * `email_verified` (BOOLEAN, NOT NULL, DEFAULT `false`)
  * `email_verify_token` (VARCHAR(255))
  * `password_reset_token` (VARCHAR(255))
  * `password_reset_expires` (TIMESTAMP)
  * `login_attempts` (INTEGER, NOT NULL, DEFAULT `0`)
  * `lockout_until` (TIMESTAMP)
  * `last_login_at` (TIMESTAMP)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `deleted_at` (TIMESTAMP) — Soft delete support
* **Indexes**:
  * Index on `email`
  * Index on `status`
  * Index on `role_id`

### 5. `user_sessions`
Active login sessions, tokens, and device identifiers.
* **Columns**:
  * `id` (UUID, PK)
  * `user_id` (UUID, FK -> `users.id`, ON DELETE CASCADE)
  * `token_hash` (VARCHAR(255), NOT NULL, UNIQUE)
  * `refresh_token_hash` (VARCHAR(255), NOT NULL, UNIQUE)
  * `device_info` (VARCHAR(500))
  * `ip_address` (VARCHAR(45))
  * `user_agent` (VARCHAR(500))
  * `last_active_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `expires_at` (TIMESTAMP, NOT NULL)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `user_id`
  * Index on `expires_at`

### 6. `user_devices`
Registered mobile and web devices for push notifications.
* **Columns**:
  * `id` (UUID, PK)
  * `user_id` (UUID, FK -> `users.id`, ON DELETE CASCADE)
  * `device_name` (VARCHAR(200), NOT NULL)
  * `device_type` (VARCHAR(20), NOT NULL) — `android`, `ios`, `web`
  * `push_token` (VARCHAR(500))
  * `last_active_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `user_id`

### 7. `scans`
Milk quality scan metadata, completion states, and locations.
* **Columns**:
  * `id` (UUID, PK)
  * `user_id` (UUID, FK -> `users.id`)
  * `status` (VARCHAR(30), NOT NULL, DEFAULT `'created'`)
  * `title` (VARCHAR(200))
  * `notes` (TEXT)
  * `latitude` (DECIMAL(10, 7))
  * `longitude` (DECIMAL(10, 7))
  * `address` (VARCHAR(500))
  * `image_count` (INTEGER, NOT NULL, DEFAULT `0`)
  * `completed_at` (TIMESTAMP)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `deleted_at` (TIMESTAMP) — Soft delete support
* **Indexes**:
  * Index on `user_id`
  * Index on `status`
  * Index on `created_at`

### 8. `scan_images`
Captured images associated with a scan.
* **Columns**:
  * `id` (UUID, PK)
  * `scan_id` (UUID, FK -> `scans.id`, ON DELETE CASCADE)
  * `original_path` (VARCHAR(500), NOT NULL)
  * `processed_path` (VARCHAR(500))
  * `thumbnail_path` (VARCHAR(500))
  * `original_filename` (VARCHAR(255), NOT NULL)
  * `mime_type` (VARCHAR(50), NOT NULL)
  * `file_size` (INTEGER, NOT NULL)
  * `width` (INTEGER)
  * `height` (INTEGER)
  * `quality_score` (DECIMAL(4, 3))
  * `quality_status` (VARCHAR(20), NOT NULL, DEFAULT `'pending'`)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `scan_id`

### 9. `image_quality_checks`
Quality assessment outputs (focus, blur, lighting, reflection) for images.
* **Columns**:
  * `id` (UUID, PK)
  * `image_id` (UUID, FK -> `scan_images.id`, ON DELETE CASCADE)
  * `blur_score` (DECIMAL(4, 3), NOT NULL)
  * `lighting_score` (DECIMAL(4, 3), NOT NULL)
  * `focus_score` (DECIMAL(4, 3), NOT NULL)
  * `reflection_detected` (BOOLEAN, NOT NULL, DEFAULT `false`)
  * `perspective_ok` (BOOLEAN, NOT NULL, DEFAULT `true`)
  * `white_balance_ok` (BOOLEAN, NOT NULL, DEFAULT `true`)
  * `noise_level` (DECIMAL(4, 3), NOT NULL)
  * `overall_score` (DECIMAL(4, 3), NOT NULL)
  * `passed` (BOOLEAN, NOT NULL)
  * `rejection_reasons` (JSON)
  * `suggestions` (JSON)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `image_id`

### 10. `ai_models`
Stores registered Machine Learning model metadata.
* **Columns**:
  * `id` (UUID, PK)
  * `name` (VARCHAR(100), NOT NULL, UNIQUE)
  * `description` (TEXT)
  * `type` (VARCHAR(50), NOT NULL) — e.g., `classification`
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)

### 11. `ai_model_versions`
Individual model file releases and evaluation metrics.
* **Columns**:
  * `id` (UUID, PK)
  * `model_id` (UUID, FK -> `ai_models.id`, ON DELETE CASCADE)
  * `version` (VARCHAR(50), NOT NULL)
  * `file_path` (VARCHAR(500), NOT NULL)
  * `accuracy` (DECIMAL(5, 4))
  * `precision_score` (DECIMAL(5, 4))
  * `recall` (DECIMAL(5, 4))
  * `f1_score` (DECIMAL(5, 4))
  * `is_active` (BOOLEAN, NOT NULL, DEFAULT `true`)
  * `is_default` (BOOLEAN, NOT NULL, DEFAULT `false`)
  * `changelog` (TEXT)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Constraints**:
  * UNIQUE(`model_id`, `version`)
* **Indexes**:
  * Index on `model_id`
  * Index on `is_default`

### 12. `predictions`
Model inference quality classification results.
* **Columns**:
  * `id` (UUID, PK)
  * `scan_id` (UUID, FK -> `scans.id`, ON DELETE CASCADE)
  * `image_id` (UUID, FK -> `scan_images.id`, ON DELETE CASCADE)
  * `model_version_id` (UUID, FK -> `ai_model_versions.id`)
  * `quality_label` (VARCHAR(30), NOT NULL) — `good`, `poor`, `adulterated`
  * `confidence` (DECIMAL(5, 4), NOT NULL)
  * `explanation` (TEXT)
  * `raw_scores` (JSON)
  * `processing_time_ms` (INTEGER)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `scan_id`
  * Index on `image_id`
  * Index on `quality_label`

### 13. `reports`
Compiled PDF report documents.
* **Columns**:
  * `id` (UUID, PK)
  * `scan_id` (UUID, FK -> `scans.id`, ON DELETE CASCADE)
  * `file_path` (VARCHAR(500), NOT NULL)
  * `file_size` (INTEGER, NOT NULL, DEFAULT `0`)
  * `generated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `scan_id`

### 14. `report_qr_codes`
QR verification codes linked to generated PDF reports.
* **Columns**:
  * `id` (UUID, PK)
  * `report_id` (UUID, FK -> `reports.id`, ON DELETE CASCADE)
  * `qr_data` (TEXT, NOT NULL)
  * `qr_image_path` (VARCHAR(500), NOT NULL)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `report_id`

### 15. `batches`
Milk batches grouped by Producers for collective scanning/submitting.
* **Columns**:
  * `id` (UUID, PK)
  * `user_id` (UUID, FK -> `users.id`)
  * `name` (VARCHAR(200), NOT NULL)
  * `description` (TEXT)
  * `status` (VARCHAR(30), NOT NULL, DEFAULT `'created'`)
  * `scan_count` (INTEGER, NOT NULL, DEFAULT `0`)
  * `completed_count` (INTEGER, NOT NULL, DEFAULT `0`)
  * `completed_at` (TIMESTAMP)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `deleted_at` (TIMESTAMP) — Soft delete support
* **Indexes**:
  * Index on `user_id`
  * Index on `status`

### 16. `batch_scans`
Many-to-many association mapping scans to batches.
* **Columns**:
  * `batch_id` (UUID, FK -> `batches.id`, ON DELETE CASCADE)
  * `scan_id` (UUID, FK -> `scans.id`, ON DELETE CASCADE)
* **Constraints**:
  * PRIMARY KEY(`batch_id`, `scan_id`)

### 17. `lab_validations`
Laboratory chemical analysis logs verifying field scans.
* **Columns**:
  * `id` (UUID, PK)
  * `scan_id` (UUID, FK -> `scans.id`)
  * `lab_staff_id` (UUID, FK -> `users.id`)
  * `result` (VARCHAR(30), NOT NULL) — `confirmed`, `rejected`, `inconclusive`
  * `notes` (TEXT)
  * `parameters` (JSON) — `fat`, `protein`, `lactose`, `pH`, `water_percentage`
  * `validated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `scan_id`
  * Index on `lab_staff_id`

### 18. `audit_logs`
System-wide security event and transaction audit records.
* **Columns**:
  * `id` (UUID, PK)
  * `user_id` (UUID, FK -> `users.id`, ON DELETE SET NULL)
  * `user_email` (VARCHAR(255))
  * `action` (VARCHAR(50), NOT NULL)
  * `resource` (VARCHAR(50), NOT NULL)
  * `resource_id` (VARCHAR(100))
  * `details` (JSON)
  * `ip_address` (VARCHAR(45))
  * `user_agent` (VARCHAR(500))
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `user_id`
  * Index on `action`
  * Index on `resource`
  * Index on `created_at`

### 19. `notifications`
User alerts, dynamic notification tokens, and read receipts.
* **Columns**:
  * `id` (UUID, PK)
  * `user_id` (UUID, FK -> `users.id`, ON DELETE CASCADE)
  * `type` (VARCHAR(50), NOT NULL)
  * `title` (VARCHAR(200), NOT NULL)
  * `message` (TEXT, NOT NULL)
  * `data` (JSON)
  * `read` (BOOLEAN, NOT NULL, DEFAULT `false`)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `user_id`
  * Index on `read`
  * Index on `created_at`

### 20. `system_settings`
Global configurations categorized by domains.
* **Columns**:
  * `id` (UUID, PK)
  * `key` (VARCHAR(100), NOT NULL, UNIQUE)
  * `value` (TEXT, NOT NULL)
  * `category` (VARCHAR(50), NOT NULL)
  * `description` (TEXT)
  * `updated_by` (UUID, FK -> `users.id`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)

### 21. `feature_flags`
Centralized switches for toggling features dynamically.
* **Columns**:
  * `id` (UUID, PK)
  * `name` (VARCHAR(100), NOT NULL, UNIQUE)
  * `description` (TEXT)
  * `enabled` (BOOLEAN, NOT NULL, DEFAULT `false`)
  * `updated_by` (UUID, FK -> `users.id`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)

### 22. `feedback`
User-submitted feedback, prioritizations, and attachments.
* **Columns**:
  * `id` (UUID, PK)
  * `user_id` (UUID, FK -> `users.id`)
  * `type` (VARCHAR(30), NOT NULL) — `feedback`, `bug_report`, `feature_request`
  * `subject` (VARCHAR(200), NOT NULL)
  * `message` (TEXT, NOT NULL)
  * `status` (VARCHAR(30), NOT NULL, DEFAULT `'open'`)
  * `priority` (VARCHAR(20), NOT NULL, DEFAULT `'medium'`)
  * `attachments` (JSON)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `user_id`
  * Index on `status`
  * Index on `type`

### 23. `backup_logs`
Database dump event logs and backup health tracking.
* **Columns**:
  * `id` (UUID, PK)
  * `type` (VARCHAR(30), NOT NULL) — `full`
  * `file_path` (VARCHAR(500), NOT NULL)
  * `file_size` (BIGINT, NOT NULL, DEFAULT 0)
  * `status` (VARCHAR(30), NOT NULL, DEFAULT `'pending'`) — `pending`, `success`, `failed`
  * `error_message` (TEXT)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `completed_at` (TIMESTAMP)

### 24. `data_retention_policies`
Resource-level policies defining retention times and cleanup actions.
* **Columns**:
  * `id` (UUID, PK)
  * `resource` (VARCHAR(50), NOT NULL, UNIQUE)
  * `retention_days` (INTEGER, NOT NULL)
  * `action` (VARCHAR(30), NOT NULL) — `archive`, `delete`, `anonymize`
  * `is_active` (BOOLEAN, NOT NULL, DEFAULT `true`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)

### 25. `sync_queue`
Centralized queue tracking events and scans pending synchronization.
* **Columns**:
  * `id` (UUID, PK)
  * `action` (VARCHAR(100), NOT NULL) — e.g., `'scan_sync'`
  * `payload` (JSON, NOT NULL)
  * `status` (VARCHAR(30), NOT NULL, DEFAULT `'pending'`) — `pending`, `processing`, `completed`, `failed`
  * `attempts` (INTEGER, NOT NULL, DEFAULT 0)
  * `last_error` (TEXT)
  * `run_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `created_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
  * `updated_at` (TIMESTAMP, NOT NULL, DEFAULT `now()`)
* **Indexes**:
  * Index on `status`
  * Index on `run_at`
