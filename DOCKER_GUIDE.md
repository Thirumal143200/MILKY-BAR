# Docker & Container Orchestration Guide

Comprehensive container management guide for building, running, and troubleshooting MilkBoy Docker containers.

---

## 1. Docker Compose Files

- **`docker-compose.yml`**: Designed for local development with hot-reloading.
- **`docker-compose.prod.yml`**: Designed for production multi-container orchestration with PostgreSQL, Redis, Express Backend, FastAPI AI Service, and Next.js Web Dashboard.

---

## 2. Useful Commands

```bash
# Build and run development stack
docker-compose -f docker-compose.yml up --build -d

# Build and run production stack
docker-compose -f docker-compose.prod.yml up --build -d

# View real-time container logs
docker-compose -f docker-compose.prod.yml logs -f

# Check running container health status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
