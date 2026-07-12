/**
 * Script to automatically compile and generate all project API documentation.
 * Generates:
 * - OPENAPI_SPEC.yaml (OpenAPI 3.0.0 spec)
 * - POSTMAN_COLLECTION.json (Postman v2.1 importable collection)
 * - API_DOCUMENTATION.md (Architecture overview)
 * - API_ENDPOINTS.md (Endpoints list)
 * - ERROR_CODES.md (Error codes)
 */

import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

// ─── 1. OpenAPI Specification ─────────────────────────────
const openapiSpec = `openapi: 3.0.0
info:
  title: MilkBoy Enterprise API
  description: API Documentation for the MilkBoy mobile scanner and laboratory validation application.
  version: 1.0.0
servers:
  - url: /api/v1
    description: Local Server
paths:
  /auth/register:
    post:
      summary: Register a new user
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, firstName, lastName, role]
              properties:
                email: { type: string }
                password: { type: string }
                firstName: { type: string }
                lastName: { type: string }
                role: { type: string, enum: [producer, consumer, lab_staff, admin, super_admin] }
  /auth/login:
    post:
      summary: Login to application
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string }
                password: { type: string }
                mfaCode: { type: string }
  /auth/logout:
    post:
      summary: Revoke active session
      tags:
        - Authentication
      security:
        - BearerAuth: []
  /auth/refresh-token:
    post:
      summary: Refresh access token
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [refreshToken]
              properties:
                refreshToken: { type: string }
  /auth/forgot-password:
    post:
      summary: Forgot password request
      tags:
        - Authentication
  /auth/reset-password:
    post:
      summary: Reset password using token
      tags:
        - Authentication
  /auth/verify-email:
    post:
      summary: Verify email address
      tags:
        - Authentication
  /auth/verify-mfa:
    post:
      summary: Verify MFA token
      tags:
        - Authentication
  /auth/logout-all-devices:
    delete:
      summary: Log out from all sessions
      tags:
        - Authentication
      security:
        - BearerAuth: []

  /users/me:
    get:
      summary: Get user profile details
      tags:
        - Users
      security:
        - BearerAuth: []
  /users/profile:
    put:
      summary: Update user profile
      tags:
        - Users
      security:
        - BearerAuth: []
  /users/change-password:
    put:
      summary: Change active password
      tags:
        - Users
      security:
        - BearerAuth: []

  /scans:
    post:
      summary: Create a new milk scan record
      tags:
        - Scans
      security:
        - BearerAuth: []
    get:
      summary: List user's scans
      tags:
        - Scans
      security:
        - BearerAuth: []
  /scans/{id}:
    get:
      summary: Get scan details
      tags:
        - Scans
      security:
        - BearerAuth: []
    delete:
      summary: Soft delete scan
      tags:
        - Scans
      security:
        - BearerAuth: []
  /scans/{id}/images:
    post:
      summary: Upload scan image
      tags:
        - Scans
      security:
        - BearerAuth: []
  /scans/{id}/analyze:
    post:
      summary: Trigger AI analysis on scan
      tags:
        - Scans
      security:
        - BearerAuth: []
  /scans/{id}/prediction:
    get:
      summary: Retrieve prediction results
      tags:
        - Scans
      security:
        - BearerAuth: []
  /scans/{id}/retry:
    post:
      summary: Retry failed analysis
      tags:
        - Scans
      security:
        - BearerAuth: []

  /ai/predict:
    post:
      summary: Predict quality directly from image
      tags:
        - AI
      security:
        - BearerAuth: []
  /ai/model-status:
    get:
      summary: Active AI model status
      tags:
        - AI
      security:
        - BearerAuth: []
  /ai/model-versions:
    get:
      summary: Available AI model versions
      tags:
        - AI
      security:
        - BearerAuth: []
  /ai/model-health:
    get:
      summary: Check model service health
      tags:
        - AI
      security:
        - BearerAuth: []

  /reports/generate/{scanId}:
    post:
      summary: Generate PDF report for scan
      tags:
        - Reports
      security:
        - BearerAuth: []
  /reports/{id}/download:
    get:
      summary: Download PDF report file
      tags:
        - Reports
      security:
        - BearerAuth: []
  /reports/{id}/qr:
    get:
      summary: Get PDF QR code verification image
      tags:
        - Reports
      security:
        - BearerAuth: []

  /notifications:
    get:
      summary: List notifications
      tags:
        - Notifications
      security:
        - BearerAuth: []
    delete:
      summary: Clear all notifications
      tags:
        - Notifications
      security:
        - BearerAuth: []
  /notifications/{id}/read:
    patch:
      summary: Mark notification as read
      tags:
        - Notifications
      security:
        - BearerAuth: []
  /notifications/preferences:
    get:
      summary: Get notification preferences
      tags:
        - Notifications
      security:
        - BearerAuth: []
    put:
      summary: Update notification preferences
      tags:
        - Notifications
      security:
        - BearerAuth: []

  /lab/pending:
    get:
      summary: Get pending validations list
      tags:
        - Lab
      security:
        - BearerAuth: []
  /lab/validate/{scanId}:
    post:
      summary: Record custom validation parameters
      tags:
        - Lab
      security:
        - BearerAuth: []
  /lab/validate/{scanId}/approve:
    post:
      summary: Approve sample alias
      tags:
        - Lab
      security:
        - BearerAuth: []
  /lab/validate/{scanId}/reject:
    post:
      summary: Reject sample alias
      tags:
        - Lab
      security:
        - BearerAuth: []
  /lab/compare:
    get:
      summary: AI vs Lab Validation stats comparison
      tags:
        - Lab
      security:
        - BearerAuth: []

  /admin/analytics/users:
    get:
      summary: User registration stats
      tags:
        - Admin
      security:
        - BearerAuth: []
  /admin/analytics/milk:
    get:
      summary: Milk scan statistics
      tags:
        - Admin
      security:
        - BearerAuth: []
  /admin/system/database:
    get:
      summary: Database row counts status
      tags:
        - Admin
      security:
        - BearerAuth: []
  /admin/system/ai:
    get:
      summary: Model monitoring details
      tags:
        - Admin
      security:
        - BearerAuth: []
  /admin/settings:
    get:
      summary: Get application configuration settings
      tags:
        - Admin
      security:
        - BearerAuth: []
    put:
      summary: Update system setting
      tags:
        - Admin
      security:
        - BearerAuth: []
  /admin/backups:
    post:
      summary: Run full system backup
      tags:
        - Admin
      security:
        - BearerAuth: []
    get:
      summary: List backup logs history
      tags:
        - Admin
      security:
        - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
`;

// ─── 2. Postman Collection ────────────────────────────────
const postmanCollection = {
  info: {
    name: 'MilkBoy REST API',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    {
      name: 'Authentication',
      item: [
        {
          name: 'Register User',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  email: 'producer@milkboy.com',
                  password: 'Password@123!',
                  firstName: 'John',
                  lastName: 'Doe',
                  role: 'producer',
                },
                null,
                2,
              ),
            },
            url: { host: ['{{host}}'], path: ['api', 'v1', 'auth', 'register'] },
          },
        },
        {
          name: 'Login User',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  email: 'producer@milkboy.com',
                  password: 'Password@123!',
                },
                null,
                2,
              ),
            },
            url: { host: ['{{host}}'], path: ['api', 'v1', 'auth', 'login'] },
          },
        },
      ],
    },
    {
      name: 'Scans',
      item: [
        {
          name: 'Create Scan',
          request: {
            method: 'POST',
            header: [
              { key: 'Authorization', value: 'Bearer {{token}}' },
              { key: 'Content-Type', value: 'application/json' },
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  title: 'Morning Collection',
                  notes: 'Sample from Batch #12',
                },
                null,
                2,
              ),
            },
            url: { host: ['{{host}}'], path: ['api', 'v1', 'scans'] },
          },
        },
      ],
    },
  ],
};

// ─── 3. Architecture Markdown ─────────────────────────────
const apiDocumentation = `# MilkBoy Enterprise API Architecture

This document describes the high-level system components, security headers, rate limiting, and API patterns implemented in the MilkBoy backend.

## Architecture Patterns
- **Clean Layers**: Routes -> Controllers -> Services -> Knex Database Connection.
- **REST Versioning**: Exposes API endpoints under \`/api/v1\`.
- **JWT Authentication & RBAC**: Stateless validation with access tokens, refresh token rotation, and permission scopes verified at the route level.

## Security Controls
- **Helmet**: Secures response HTTP headers.
- **CORS**: Domain whitelist validation.
- **Rate Limiting**: Custom limits for auth endpoints (5 requests/15m) and general endpoints (100 requests/15m).
- **Centralized Error Handler**: Translates standard AppError instances into JSON objects with error codes.
`;

// ─── 4. Endpoints List ────────────────────────────────────
const apiEndpoints = `# MilkBoy API Endpoints Reference

| Module | Method | Endpoint | Description | Auth Required | Permissions |
|--------|--------|----------|-------------|---------------|-------------|
| **Auth** | POST | \`/api/v1/auth/register\` | Register user | No | None |
| **Auth** | POST | \`/api/v1/auth/login\` | User login | No | None |
| **Auth** | POST | \`/api/v1/auth/refresh-token\` | Rotate JWT tokens | No | None |
| **Auth** | DELETE | \`/api/v1/auth/logout-all-devices\`| Revoke all sessions | Yes | None |
| **Users** | GET | \`/api/v1/users/me\` | Get profile | Yes | None |
| **Users** | PUT | \`/api/v1/users/profile\` | Update profile | Yes | None |
| **Scans** | POST | \`/api/v1/scans\` | Create scan | Yes | \`scans:create\` |
| **Scans** | POST | \`/api/v1/scans/:id/images\` | Upload scan image | Yes | \`images:create\` |
| **Scans** | POST | \`/api/v1/scans/:id/analyze\`| Trigger analysis | Yes | \`scans:create\` |
| **AI** | POST | \`/api/v1/ai/predict\` | Direct prediction | Yes | \`scans:create\` |
| **AI** | GET | \`/api/v1/ai/model-status\`| Model details | Yes | \`scans:read\` |
| **AI** | GET | \`/api/v1/ai/model-health\`| FastAPI status | Yes | \`scans:read\` |
| **Reports** | POST | \`/api/v1/reports/generate/:scanId\` | Compile PDF | Yes | \`reports:create\` |
| **Lab** | POST | \`/api/v1/lab/validate/:scanId\` | Record lab validation | Yes | \`lab_validations:create\` |
| **Admin**| GET | \`/api/v1/admin/analytics/users\` | User growth | Yes | \`analytics:read\` |
`;

// ─── 5. Error Codes List ──────────────────────────────────
const errorCodes = `# MilkBoy System Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| **AUTH_MFA_REQUIRED** | Multi-factor authentication code required | 200 (Requires TOTP verification) |
| **AUTH_INVALID_CREDENTIALS** | Incorrect email or password | 401 Unauthorized |
| **AUTH_TOKEN_EXPIRED** | Access token expired | 401 Unauthorized |
| **AUTH_TOKEN_INVALID** | Token invalid or tampered | 401 Unauthorized |
| **AUTHZ_UNAUTHORIZED** | Permission check failed | 403 Forbidden |
| **VAL_MISSING_FIELD** | Required request payload field missing | 400 Bad Request |
| **VAL_INVALID_INPUT** | Zod schema validation failed | 400 Bad Request |
| **RES_NOT_FOUND** | Database resource not found | 404 Not Found |
| **RES_CONFLICT** | Duplicate entity or invalid state transition | 409 Conflict |
| **RPT_NOT_READY** | Report not generated or scan incomplete | 400 Bad Request |
| **SYS_INTERNAL_ERROR** | Server execution failure | 500 Internal Server Error |
`;

// Write files to project root
fs.writeFileSync(path.join(projectRoot, 'OPENAPI_SPEC.yaml'), openapiSpec);
fs.writeFileSync(
  path.join(projectRoot, 'POSTMAN_COLLECTION.json'),
  JSON.stringify(postmanCollection, null, 2),
);
fs.writeFileSync(path.join(projectRoot, 'API_DOCUMENTATION.md'), apiDocumentation);
fs.writeFileSync(path.join(projectRoot, 'API_ENDPOINTS.md'), apiEndpoints);
fs.writeFileSync(path.join(projectRoot, 'ERROR_CODES.md'), errorCodes);

console.log('✓ Successfully compiled and wrote all API documentation artifacts to root directory.');
