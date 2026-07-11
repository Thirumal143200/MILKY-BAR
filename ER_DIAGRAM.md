# Entity Relationship Diagram (ERD)

This document visualizes the database relationships using a Mermaid ER diagram.

---

```mermaid
erDiagram
    roles ||--o{ users : "has"
    permissions ||--|{ role_permissions : "defines"
    roles ||--|{ role_permissions : "receives"
    users ||--o{ user_sessions : "starts"
    users ||--o{ user_devices : "registers"
    users ||--o{ scans : "initiates"
    users ||--o{ batches : "creates"
    users ||--o{ notifications : "receives"
    users ||--o{ audit_logs : "triggers"
    users ||--o{ system_settings : "updates"
    users ||--o{ feature_flags : "updates"
    users ||--o{ feedback : "submits"

    scans ||--o{ scan_images : "contains"
    scans ||--o{ predictions : "has"
    scans ||--o{ reports : "generates"
    scans ||--o{ batch_scans : "associates"
    scans ||--o{ lab_validations : "verifies"

    batches ||--o{ batch_scans : "groups"
    scan_images ||--|| image_quality_checks : "assesses"
    scan_images ||--o{ predictions : "evaluates"

    ai_models ||--o{ ai_model_versions : "versions"
    ai_model_versions ||--o{ predictions : "powers"
    reports ||--|| report_qr_codes : "signs"
```

---

## 3. Relationship Explanations

1. **RBAC Core**:
   - One `roles` record is mapped to many `users`.
   - Many-to-many junction `role_permissions` connects `roles` and `permissions`.
2. **User Identity & Operations**:
   - A user creates many `scans` (Milk Samples) and `batches`.
   - Active user sessions are tracked in `user_sessions` (1-to-many).
   - Push notification targets are stored in `user_devices` (1-to-many).
3. **Scan Execution Pipeline**:
   - A `scans` entity contains many `scan_images`.
   - Each `scan_images` entry has exactly one `image_quality_checks` report.
   - Model execution logs are recorded in `predictions`, tying `scan_images`, `scans`, and `ai_model_versions` together.
   - Scans are validated by `lab_validations` containing chemical markers logged by `Laboratory Staff` (`users` with a lab role).
4. **Grouping & Auditing**:
   - Scans can be dynamically associated with a producer's batch via the many-to-many `batch_scans` junction table.
   - Security events are logged in `audit_logs` referencing the responsible user.
