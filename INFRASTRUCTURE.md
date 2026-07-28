# Infrastructure & Container Specifications

Detailed specification of Docker images, container sizes, volumes, and health monitoring.

---

## 1. Container Images & Build Strategies

- **Express Backend (`server/Dockerfile`)**:
  - Base Image: `node:20-alpine` (builder) -> `node:20-alpine` (runner).
  - Security: Runs as non-root user `expressjs` (UID 1001).
  - Healthcheck Probe: `curl -f http://localhost:4000/health || exit 1`.
  - Image Size: ~185 MB.

- **FastAPI AI Service (`ai_service/Dockerfile`)**:
  - Base Image: `python:3.11-slim`.
  - Dependencies: OpenCV runtime (`libgl1-mesa-glx`), PyTorch CPU, FastAPI, Uvicorn.
  - Security: Non-root user `appuser`.
  - Healthcheck Probe: `curl -f http://localhost:8000/health || exit 1`.
  - Image Size: ~450 MB.

- **Next.js Web Application (`web/Dockerfile`)**:
  - Base Image: `node:20-alpine` (builder) -> `node:20-alpine` (runner).
  - Security: Non-root user `nextjs` (UID 1001).
  - Healthcheck Probe: `wget --spider http://localhost:3000/ || exit 1`.
  - Image Size: ~210 MB.
