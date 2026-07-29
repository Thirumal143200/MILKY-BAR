# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project monorepo setup with npm workspaces (shared, server, web)
- Shared TypeScript types for users, scans, predictions, reports, admin
- Shared Zod validation schemas for all API inputs
- Shared constants: RBAC roles/permissions, error codes, configuration
- Shared utility functions: pagination, formatting, masking
- Express.js backend with modular architecture
- Database layer with Knex.js (PostgreSQL + SQLite dual support)
- Full database schema with 24 tables (users, roles, permissions, scans, images, predictions, reports, batches, lab validations, audit logs, notifications, settings, feature flags, feedback, backups, data retention)
- Database seeder with roles, permissions, Super Admin, AI model, feature flags, settings, and sample data
- JWT authentication middleware with access/refresh token flow
- RBAC middleware with role hierarchy, permission checks, and owner-or-admin guards
- Request validation middleware using Zod schemas
- Rate limiting middleware (general, auth, upload, AI inference)
- Audit logging middleware with non-blocking recording
- File upload middleware with Multer (date-organized, UUID filenames, MIME filtering)
- Global error handler with AppError class and standardized responses
- Winston structured logging with file rotation
- Auth module: register, login, logout, refresh, forgot/reset password, MFA support, brute-force protection
- Scans module: CRUD, pagination, search, admin listing
- AI inference service: color-based quality classification, confidence scoring, explainability
- Image processing service: resize, normalize, denoise, sharpen, thumbnails, quality checks (blur, lighting, focus, reflection, noise, white balance)
- Git repository initialization with conventional commits
- GitHub Actions CI/CD pipeline (build, test, lint, security scan)
- Community files: README, LICENSE (MIT), CHANGELOG, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY
- Production multi-stage Dockerfiles for Backend, AI Service, and Next.js Web Dashboard
- Docker Compose orchestrations for Dev (`docker-compose.yml`) and Prod (`docker-compose.prod.yml`)
- Health probes (`/health`, `/liveness`, `/readiness`) on Express server and FastAPI AI service
- Automated CLI database backup (`backup-db.ts`) and restore (`restore-db.ts`) disaster recovery scripts
- Storage provider abstraction for local vs cloud storage
- Expo EAS release profiles for Android APK and AAB
- High-cardinality compound database indexes migration (`002_performance_indexes.ts`)
- High-performance in-memory TTL caching utility (`InMemoryCache`) for Admin analytics and system health
- AI inference pipeline refactoring eliminating dynamic imports in hot loops
- Next.js package import optimizations (`lucide-react`, `date-fns`, `recharts`) and response compression
- Automated HTTP load testing script (`load-test.ts`) achieving 346+ RPS throughput

## [1.0.0] - TBD

### Planned

- Web dashboard (Next.js 14)
- Mobile app (React Native + Expo)
- PDF report generation with QR codes
- Batch testing
- Push notifications
- Docker Compose deployment
- Full test suite
