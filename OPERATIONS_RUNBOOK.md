# Operations Runbook — MilkBoy Enterprise Platform

## 1. System Startup & Deployment Commands

### Production Docker Compose Startup

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Development Environment Startup

```bash
docker-compose up -d
```

---

## 2. Health Monitoring & Diagnostics

- **Liveness Probe**: `GET http://localhost:3000/liveness` (Returns HTTP 200 `{ status: "alive" }`)
- **Readiness Probe**: `GET http://localhost:3000/readiness` (Returns HTTP 200 `{ status: "ready", database: "connected" }`)
- **API Health**: `GET http://localhost:3000/health` (Returns HTTP 200 `{ status: "healthy" }`)

---

## 3. Database Migration & Maintenance

### Run Pending Database Migrations

```bash
npm run migrate --workspace=server
```

### Trigger Database Backup CLI

```bash
npm run backup-db --workspace=server
```

### Restore Database Backup CLI

```bash
npm run restore-db --workspace=server -- --file=backups/backup_filename.sql
```

---

## 4. Incident Response & Troubleshooting

- **Server Logs**: Check Winston rotated log files under `server/logs/` or run `docker logs -f milkboy-server`.
- **AI Service Logs**: Run `docker logs -f milkboy-ai`.
- **Database Connection Failure**: Verify PostgreSQL environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`) and network connectivity.
