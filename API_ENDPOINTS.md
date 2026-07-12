# MilkBoy API Endpoints Reference

| Module      | Method | Endpoint                           | Description           | Auth Required | Permissions              |
| ----------- | ------ | ---------------------------------- | --------------------- | ------------- | ------------------------ |
| **Auth**    | POST   | `/api/v1/auth/register`            | Register user         | No            | None                     |
| **Auth**    | POST   | `/api/v1/auth/login`               | User login            | No            | None                     |
| **Auth**    | POST   | `/api/v1/auth/refresh-token`       | Rotate JWT tokens     | No            | None                     |
| **Auth**    | DELETE | `/api/v1/auth/logout-all-devices`  | Revoke all sessions   | Yes           | None                     |
| **Users**   | GET    | `/api/v1/users/me`                 | Get profile           | Yes           | None                     |
| **Users**   | PUT    | `/api/v1/users/profile`            | Update profile        | Yes           | None                     |
| **Scans**   | POST   | `/api/v1/scans`                    | Create scan           | Yes           | `scans:create`           |
| **Scans**   | POST   | `/api/v1/scans/:id/images`         | Upload scan image     | Yes           | `images:create`          |
| **Scans**   | POST   | `/api/v1/scans/:id/analyze`        | Trigger analysis      | Yes           | `scans:create`           |
| **AI**      | POST   | `/api/v1/ai/predict`               | Direct prediction     | Yes           | `scans:create`           |
| **AI**      | GET    | `/api/v1/ai/model-status`          | Model details         | Yes           | `scans:read`             |
| **AI**      | GET    | `/api/v1/ai/model-health`          | FastAPI status        | Yes           | `scans:read`             |
| **Reports** | POST   | `/api/v1/reports/generate/:scanId` | Compile PDF           | Yes           | `reports:create`         |
| **Lab**     | POST   | `/api/v1/lab/validate/:scanId`     | Record lab validation | Yes           | `lab_validations:create` |
| **Admin**   | GET    | `/api/v1/admin/analytics/users`    | User growth           | Yes           | `analytics:read`         |
