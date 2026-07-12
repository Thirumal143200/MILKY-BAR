# MilkBoy Enterprise API Architecture

This document describes the high-level system components, security headers, rate limiting, and API patterns implemented in the MilkBoy backend.

## Architecture Patterns

- **Clean Layers**: Routes -> Controllers -> Services -> Knex Database Connection.
- **REST Versioning**: Exposes API endpoints under `/api/v1`.
- **JWT Authentication & RBAC**: Stateless validation with access tokens, refresh token rotation, and permission scopes verified at the route level.

## Security Controls

- **Helmet**: Secures response HTTP headers.
- **CORS**: Domain whitelist validation.
- **Rate Limiting**: Custom limits for auth endpoints (5 requests/15m) and general endpoints (100 requests/15m).
- **Centralized Error Handler**: Translates standard AppError instances into JSON objects with error codes.
