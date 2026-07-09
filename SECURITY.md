# Security Policy

## Supported Versions

| Version | Supported         |
| ------- | ----------------- |
| 1.x.x   | ✅ Active support |
| < 1.0   | ❌ Not supported  |

## Reporting a Vulnerability

**⚠️ Please do NOT open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability within MilkBoy, please report it responsibly:

### How to Report

1. **Email**: Send details to **security@milkboy.app**
2. **Subject**: `[SECURITY] Brief description of the vulnerability`
3. **Include**:
   - Type of vulnerability (e.g., SQL injection, XSS, authentication bypass)
   - Full path(s) of the source file(s) related to the vulnerability
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact assessment

### Response Timeline

| Phase              | Timeline                |
| ------------------ | ----------------------- |
| Acknowledgment     | Within 48 hours         |
| Initial Assessment | Within 5 business days  |
| Fix Development    | Within 14 business days |
| Public Disclosure  | After fix is deployed   |

### What to Expect

- You will receive an acknowledgment within 48 hours
- We will work with you to understand and validate the report
- We will keep you informed of our progress
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Measures

MilkBoy implements the following security measures:

### Authentication & Authorization

- JWT-based authentication with short-lived access tokens (15 min)
- Refresh tokens with secure rotation
- Role-Based Access Control (RBAC) with 5 roles
- Multi-Factor Authentication (MFA) support
- Brute-force protection with account lockout (5 attempts, 30 min lockout)
- Session management with max 5 concurrent sessions

### Data Protection

- Passwords hashed with bcrypt (12 rounds)
- Sensitive tokens hashed with SHA-256 before storage
- HTTPS enforcement in production
- CORS with allowlisted origins
- Helmet.js security headers
- Rate limiting on all endpoints

### Input Validation

- Zod schema validation on all API inputs
- Parameterized queries (Knex.js) — no raw SQL concatenation
- File upload type validation and size limits
- XSS protection via output encoding

### Monitoring & Audit

- Comprehensive audit logging for all user actions
- Request logging with Winston
- Error tracking with structured logs
- Session and device tracking

### Infrastructure

- Environment-based configuration (no hardcoded secrets)
- Secrets managed via environment variables
- Docker support with non-root containers
- CI/CD security scanning

## Best Practices for Developers

1. **Never** commit secrets, API keys, or credentials to version control
2. **Always** use the Zod validators for user input
3. **Always** use Knex query builder — never raw SQL with string interpolation
4. **Always** hash passwords with bcrypt before storage
5. **Always** use the `authenticate` middleware for protected routes
6. **Always** use the `requireRole` or `requirePermission` middleware for authorization
7. **Always** sanitize file uploads and validate MIME types
8. **Review** audit logs regularly for suspicious activity

## Dependencies

We regularly monitor dependencies for known vulnerabilities using:

- `npm audit` in CI/CD pipeline
- GitHub Dependabot alerts
- Manual security reviews

## Disclosure Policy

We follow a responsible disclosure process:

1. Reporter contacts us with vulnerability details
2. We acknowledge and assess the report
3. We develop and test a fix
4. We release the fix and publish a security advisory
5. We credit the reporter (with permission)

Thank you for helping keep MilkBoy and its users safe! 🛡️
