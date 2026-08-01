# MilkBoy Enterprise Platform — Production Deployment Guide

**Date**: August 2, 2026  
**Version**: v1.0.0  
**Target Environment**: AWS / GCP / DigitalOcean / Render / Vercel / Docker Swarm / Kubernetes

---

## 1. Overview & Architecture

The MilkBoy Enterprise Platform uses a containerized microservice architecture:
- **`milkboy-server`**: Node.js 20 Express REST API backend on port `3001`
- **`milkboy-ai`**: Python 3.11 FastAPI / PyTorch inference engine on port `8000`
- **`milkboy-db`**: PostgreSQL 16 relational database engine on port `5432`
- **`milkboy-redis`**: Redis 7.2 in-memory cache & pub/sub engine on port `6379`
- **`milkboy-web`**: Next.js 14 Production Web Portal on port `3000`

---

## 2. Docker & Container Deployment

### 2.1 Production Container Build
```bash
# Build multi-stage production images
docker compose -f docker-compose.prod.yml build --no-cache

# Launch all production containers in detached mode
docker compose -f docker-compose.prod.yml up -d
```

### 2.2 Health Check Verification
```bash
# Backend Health Endpoint
curl -f http://localhost:3001/api/v1/health

# AI Microservice Health Endpoint
curl -f http://localhost:8000/health

# Web Portal Production Health Check
curl -f http://localhost:3000/api/health
```

---

## 3. Web Deployment (Vercel / Next.js)

1. Connect GitHub repository `Thirumal143200/MILKY-BAR` to Vercel.
2. Set root directory to `web`.
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.milkboy.enterprise.com/api/v1`
   - `NEXTAUTH_URL=https://app.milkboy.enterprise.com`
   - `NEXTAUTH_SECRET=prod_super_secret_jwt_key_milkboy_2026`
4. Trigger production deployment: `vercel --prod`

---

## 4. Database Migrations & Automated Backups

### 4.1 Running Migrations
```bash
cd server
npm run db:migrate
```

### 4.2 Automated Backup Execution
```bash
# Run PostgreSQL automated backup script
npm run db:backup
```

### 4.3 Automated Restore Execution
```bash
# Restore PostgreSQL database from latest snapshot
npm run db:restore
```

---

## 5. Security & TLS/HTTPS Setup
- Reverse Proxy: NGINX / Cloudflare SSL termination
- HTTPS Enforcement: Strict-Transport-Security (`max-age=31536000; includeSubDomains`)
- CORS Domains: Allowed origins restricted to production Web and Mobile app schemes.
