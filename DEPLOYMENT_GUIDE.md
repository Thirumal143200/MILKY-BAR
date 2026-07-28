# Enterprise Deployment Guide

This document provides step-by-step instructions for deploying **MilkBoy** across local development, staging, and production cloud environments.

---

## 1. Prerequisites

- **Docker & Docker Compose**: Docker Engine v24.0+ & Docker Compose v2.20+.
- **Node.js**: v20.x LTS.
- **Python**: v3.11 for AI Service.
- **PostgreSQL**: v15.x (Production database).
- **Redis**: v7.x (Cache and session engine).

---

## 2. Local Development Deployment

To start the local development stack with hot-reloading:
```bash
# Start all services (Backend, AI Service, Web Dashboard)
docker-compose -f docker-compose.yml up --build -d
```

Services will be accessible at:
- **Express Backend**: `http://localhost:4000`
- **FastAPI AI Service**: `http://localhost:8000`
- **Next.js Web Dashboard**: `http://localhost:3000`

---

## 3. Production Multi-Container Deployment

To deploy the production-ready stack with PostgreSQL and Redis:
```bash
# 1. Export environment variables
export POSTGRES_PASSWORD=your_secure_password
export JWT_SECRET=your_production_jwt_secret

# 2. Launch production stack
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Verify health probes
curl http://localhost:4000/health
curl http://localhost:4000/readiness
curl http://localhost:8000/health
```

---

## 4. Mobile Application Release Builds (Expo EAS)

For Android APK and App Bundle (AAB) compilation:
```bash
cd mobile

# Build standalone Android APK (for testing & direct download)
npx eas-cli build --platform android --profile preview

# Build production Android App Bundle (for Google Play Store upload)
npx eas-cli build --platform android --profile production
```
