# API Security Review & OWASP Validation

## API Endpoint Security Checklist

All API routes mounted under `/api/v1` undergo strict security validation before execution:

1. **Authentication Gate**: `authenticate` middleware (`server/src/middleware/auth.ts`) extracts and verifies JWT bearer tokens.
2. **Authorization & RBAC Gate**: `requireRole(...roles)` or `requirePermission(...permissions)` (`server/src/middleware/rbac.ts`) prevents horizontal & vertical privilege escalation.
3. **Input Sanitization**: Zod validation schemas (`server/src/middleware/validator.ts`) reject malformed JSON, invalid UUIDs, or extra parameters.
4. **Rate Limiting**: `generalLimiter`, `authLimiter`, and `uploadLimiter` prevent DDoS and brute-force attacks (`rateLimiter.ts`).
5. **Database Parameterization**: Knex.js query builder ensures parameterized SQL queries (`where('id', id)`), neutralizing SQL injection vectors.
6. **File Upload Security**: Multer file filter (`upload.ts`) enforces MIME type validation (`image/jpeg`, `image/png`) and file size boundaries (10MB max).

---

## Direct Object Reference (IDOR) Protection

All entity endpoints (`/api/v1/scans/:id`, `/api/v1/notifications/:id`, `/api/v1/reports/:id`) verify that the requesting user's `user_id` matches the record owner or that the requester possesses `admin`/`super_admin` permissions.
