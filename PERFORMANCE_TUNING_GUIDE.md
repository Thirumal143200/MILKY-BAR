# MilkBoy Enterprise Performance Tuning Guide

## 1. Application-Level Caching Strategy

- Use `InMemoryCache` (`server/src/utils/cache.ts`) for high-frequency, slow-changing aggregation endpoints:

```typescript
import { InMemoryCache } from '../utils/cache.js';
const analyticsCache = new InMemoryCache<AdminAnalytics>(30000); // 30s TTL
```

- In multi-node production deployments, swap `InMemoryCache` for Redis backend (`redis-om` or `ioredis`).

---

## 2. Next.js Frontend Optimization

- Ensure dynamic import trees in `next.config.mjs` utilize `optimizePackageImports`:

```javascript
experimental: {
  optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
}
```

- Maintain modern ES module output (`module: ESNext`).

---

## 3. Database Maintenance & Index Hygiene

- Periodically run `ANALYZE` (PostgreSQL) or `VACUUM` to keep query optimizer metrics fresh.
- Verify migration `002_performance_indexes.ts` has executed across all staging and production environments.

---

## 4. AI Inference Pre-allocation

- Keep model execution models warm in `inference.service.ts` to prevent cold-start overhead when handling scan requests.
