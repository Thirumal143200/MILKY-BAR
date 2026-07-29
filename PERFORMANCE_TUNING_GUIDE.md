# MilkBoy Enterprise Performance Tuning Guide

This guide provides operational strategies, environment variables, caching policies, and monitoring techniques to maintain optimal performance for the MilkBoy platform in production environments.

---

## 🛠️ 1. Backend Performance Tuning

### Environment Configuration (`.env`)

```ini
# Node Environment
NODE_ENV=production

# DB Connection Pool Settings
DB_POOL_MIN=5
DB_POOL_MAX=25
DB_ACQUIRE_TIMEOUT_MS=60000

# In-Memory Cache TTL (Seconds)
CACHE_DEFAULT_TTL=30
```

### Application Optimization Guidelines

- **Avoid Heavy Dynamic Imports in Hot Loops**: Keep `fs`, `path`, and config imports at module top-level.
- **Use Index-Backed Queries**: Always ensure queries filtering by `user_id`, `status`, or `created_at` leverage compound indexes (`idx_scans_user_status_created`).

---

## 🌐 2. Web Frontend Tuning (Next.js)

1. **Package Import Optimization**:
   Keep `experimental.optimizePackageImports` configured in `next.config.mjs` for icon libraries (`lucide-react`) and heavy chart libraries (`recharts`).
2. **HTTP Compression**:
   Ensure gzip/brotli compression remains enabled in reverse proxies (Nginx/Cloudflare) or Next.js server config (`compress: true`).

---

## 📱 3. Mobile Performance Tuning (React Native)

1. **Zustand Selector Memoization**:
   Always pass explicit selectors to Zustand hooks (e.g., `useSyncStore(state => state.queue)`) rather than consuming the whole store object.
2. **Batch Queue Processing**:
   Group offline scan sync requests using `batchSync` payload rather than sending 1 HTTP request per scan item.

---

## 🚦 4. Continuous Monitoring & Automated Benchmarking

Run the load test suite before every release:

```bash
npx tsx server/scripts/load-test.ts
```

Verify that throughput remains > 250 RPS and p95 latency stays < 300 ms.
