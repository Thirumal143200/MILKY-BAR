# MilkBoy Backend Server

The secure and scalable Node.js/Express backend for the MilkBoy platform.

## Architecture

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js query builder
- **Authentication**: JWT with strict RBAC (Role-Based Access Control)

## Setup & Running

1. Copy `.env.example` to `.env` and fill in credentials.
2. Run `npm install`
3. Start the dev server: `npm run dev`

## Security Features

- **Rate Limiting**: Protects against brute-force (auth) and DDOS (general).
- **Helmet**: Secures HTTP headers.
- **CORS**: Strictly enforces origin access.
