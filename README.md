<p align="center">
  <img src="docs/assets/logo-placeholder.png" alt="MilkBoy Logo" width="120" height="120" />
</p>

<h1 align="center">🥛 MilkBoy</h1>

<p align="center">
  <strong>AI-Powered Milk Quality Detection Platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg" alt="Node" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

---

## Overview

**MilkBoy** is a production-quality, full-stack platform for AI-powered milk quality detection. It enables dairy producers, consumers, and laboratory staff to analyze milk samples using intelligent image processing and machine learning, delivering instant quality assessments with detailed reports.

### Key Highlights

- 🧠 **AI-Powered Analysis** — Color-based heuristic model (CNN-ready architecture) classifies milk into 7 quality categories
- 📱 **Cross-Platform** — Android mobile app (React Native/Expo) + responsive web dashboard (Next.js)
- 🔐 **Enterprise Security** — RBAC, JWT auth, MFA, brute-force protection, audit logging
- 📊 **Rich Reporting** — PDF reports with QR codes, batch testing, CSV/PDF export
- 🏗️ **Modular Architecture** — Independent modules following SOLID principles
- 🌍 **Multi-Language** — English, Spanish, French, Hindi, Tamil
- 🌙 **Dark Mode** — Full dark mode support across web and mobile

---

## Features

### Core

| Feature              | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| Image Capture        | Camera integration for real-time milk sample capture          |
| Gallery Upload       | Upload existing images from device gallery                    |
| AI Quality Detection | Automated milk quality classification with confidence scores  |
| Image Preprocessing  | Blur detection, lighting analysis, focus check, noise removal |
| Explainable AI       | Human-readable explanations for every prediction              |
| PDF Reports          | Professional reports with QR codes for easy sharing           |
| Batch Testing        | Process multiple samples in a single batch                    |
| Scan History         | Complete history with search, filter, and export              |

### User Roles

| Role            | Access Level                         |
| --------------- | ------------------------------------ |
| **Super Admin** | Full system access (single account)  |
| **Admin**       | Operational management               |
| **Producer**    | Upload and manage milk batches       |
| **Consumer**    | Scan milk and view personal reports  |
| **Lab Staff**   | Validate samples with lab parameters |

### Security

- Role-Based Access Control (RBAC)
- JWT + Refresh Token authentication
- Multi-Factor Authentication (MFA)
- Brute-force protection with account lockout
- Rate limiting per endpoint category
- Audit logging for all actions
- Password hashing (bcrypt, 12 rounds)
- CORS, Helmet, XSS/CSRF protection
- Secure file uploads with type validation

---

## Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Mobile App  │  │     Web     │  │   Admin     │
│ React Native │  │   Next.js   │  │   Portal    │
└──────┬───────┘  └──────┬──────┘  └──────┬──────┘
       │                 │                 │
       └────────────┬────┴────────────────┘
                    │
           ┌────────▼────────┐
           │   Express.js    │
           │   REST API      │
           │   (Port 3001)   │
           └───┬────┬────┬───┘
               │    │    │
    ┌──────────┤    │    ├──────────┐
    │          │    │    │          │
┌───▼───┐ ┌───▼──┐ │ ┌──▼───┐ ┌───▼───┐
│ Auth  │ │Scans │ │ │Report│ │ Admin │
│Module │ │Module│ │ │Module│ │Module │
└───────┘ └──────┘ │ └──────┘ └───────┘
                   │
          ┌────────▼────────┐
          │   AI Inference  │
          │  (Sharp + Color │
          │   Analysis)     │
          └────────┬────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
┌────▼────┐ ┌─────▼─────┐ ┌────▼────┐
│PostgreSQL│ │   Redis   │ │  File   │
│ /SQLite  │ │  (Cache)  │ │ Storage │
└──────────┘ └───────────┘ └─────────┘
```

### Tech Stack

| Layer         | Technology                       |
| ------------- | -------------------------------- |
| Backend API   | Express.js 5 + TypeScript        |
| Web Dashboard | Next.js 14 (App Router)          |
| Mobile App    | React Native + Expo              |
| Database      | PostgreSQL (prod) / SQLite (dev) |
| Cache         | Redis + BullMQ                   |
| AI Engine     | Sharp.js (color analysis)        |
| PDF Reports   | PDFKit + QRCode                  |
| Auth          | JWT + bcrypt + TOTP              |
| Validation    | Zod (shared schemas)             |
| Testing       | Vitest + Supertest               |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/milkboy.git
cd milkboy

# Install all dependencies (monorepo)
npm install

# Copy environment file
cp server/.env.example server/.env

# Run database migrations and seed data
npm run db:seed --workspace=server

# Start development servers
npm run dev:server    # API on http://localhost:3001
npm run dev:web       # Web on http://localhost:3000
```

### Default Accounts (Development)

| Role        | Email             | Password        |
| ----------- | ----------------- | --------------- |
| Super Admin | admin@milkboy.app | SuperAdmin@123! |
| Admin       | admin@demo.com    | Test@1234       |
| Producer    | producer@demo.com | Test@1234       |
| Consumer    | consumer@demo.com | Test@1234       |
| Lab Staff   | lab@demo.com      | Test@1234       |

> ⚠️ **Change all default credentials before deploying to production!**

---

## Project Structure

```
milkboy/
├── packages/shared/     # Shared types, validators, constants
├── server/              # Express.js backend API
├── web/                 # Next.js web dashboard
├── mobile/              # React Native mobile app
├── ai/                  # AI model artifacts
├── scripts/             # Utility scripts
├── docs/                # Documentation
└── .github/workflows/   # CI/CD pipelines
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation.

---

## API Documentation

Base URL: `http://localhost:3001/api/v1`

### Authentication

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/auth/register`        | Register a new account   |
| POST   | `/auth/login`           | Login and receive tokens |
| POST   | `/auth/logout`          | Invalidate session       |
| POST   | `/auth/refresh`         | Refresh access token     |
| POST   | `/auth/password/forgot` | Request password reset   |
| POST   | `/auth/password/reset`  | Reset password           |

### Scans

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| POST   | `/scans`             | Create a new scan             |
| GET    | `/scans`             | List your scans               |
| GET    | `/scans/:id`         | Get scan details with results |
| DELETE | `/scans/:id`         | Delete a scan                 |
| POST   | `/scans/:id/images`  | Upload image to scan          |
| POST   | `/scans/:id/analyze` | Run AI analysis               |

See [API_DOCS.md](API_DOCS.md) for the complete API reference.

---

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `npm run dev:server` | Start backend dev server       |
| `npm run dev:web`    | Start web dashboard dev server |
| `npm run build`      | Build all packages             |
| `npm test`           | Run all tests                  |
| `npm run lint`       | Lint all packages              |
| `npm run db:seed`    | Run migrations + seed data     |
| `npm run db:reset`   | Drop all tables                |

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Security

For security concerns, please see [SECURITY.md](SECURITY.md).

**Do NOT** open public issues for security vulnerabilities. Email security@milkboy.app instead.

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Express.js](https://expressjs.com/) — Web framework
- [Next.js](https://nextjs.org/) — React framework
- [Sharp](https://sharp.pixelplumbing.com/) — Image processing
- [PDFKit](http://pdfkit.org/) — PDF generation
- [Zod](https://zod.dev/) — TypeScript validation

---

<p align="center">
  Built with ❤️ by the MilkBoy Team
</p>
