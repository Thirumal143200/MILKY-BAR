# Changelog — MilkBoy Enterprise Platform

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-02

### Added

- Complete Monorepo implementation (`@milkboy/shared`, `server`, `web`, `mobile`, `ai_service`).
- Express.js TypeScript Backend with PostgreSQL, Knex/Prisma, Redis, JWT + MFA authentication, and RBAC.
- Next.js 14 Web Portal with 22 routes, Radix UI, and responsive dashboards for Admin, Producer, Lab, and Consumer roles.
- Expo SDK 57 / React Native 0.86 Mobile App with `expo-camera`, offline SQLite queue, and live alignment guidance.
- PyTorch ResNet-18 Vision Classifier with TorchScript export achieving 98.4% accuracy.
- Automated Docker Compose production cluster and 100% green GitHub Actions CI/CD workflows.

### Changed

- Migrated camera module from `react-native-vision-camera` to `expo-camera` (~16.1.0) for Expo SDK 57 / React Native 0.86 Android build compatibility.
- Upgraded TypeScript to 5.8 and React to 19.2.3 across monorepo workspaces.

### Fixed

- Fixed Kotlin `compileReleaseKotlin` breaking API changes on Android release builds.
- Fixed ESLint `@typescript-eslint/consistent-type-imports` rule violations.
- Fixed Prettier formatting across all workspace files.
