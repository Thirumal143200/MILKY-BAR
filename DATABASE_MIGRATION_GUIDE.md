# Database Migration Guide

This guide details how database migrations are organized, executed, and validated in the **MilkBoy** application.

---

## 1. Migration Execution

Migrations are written as Knex migration scripts in `server/src/database/migrations/`.
Central scripts are exposed in `server/package.json` to manage development and production lifecycles.

### Commands

| Command     | Command Line         | Description                                                  | Environment |
| :---------- | :------------------- | :----------------------------------------------------------- | :---------- |
| **Migrate** | `npm run db:migrate` | Programmatically triggers forward schema creation.           | Dev / Prod  |
| **Reset**   | `npm run db:reset`   | Drops all database tables and schema structures.             | Dev Only ⚠️ |
| **Seed**    | `npm run db:seed`    | Populates database with roles, permissions, and sample data. | Dev Only    |

---

## 2. Programmatic Migration Runner Details

Unlike standard CLI wrappers, MilkBoy utilizes programmatic Knex migration scripts to ensure connection safety and execution tracking:

### Forward Migration (`server/src/database/migrate.ts`)

1. Checks for database connection availability with exponential backoff retry.
2. Checks if the `users` table already exists.
3. If not present, calls the `up()` export from migration modules sequentially.
4. Safely destroys the active pool connection and exits.

### Rollback / Reset (`server/src/database/reset.ts`)

1. Establishes a database connection.
2. Executes the `down()` function dropping all tables in reverse-dependency order.
3. Closes connections cleanly.

---

## 3. Creating New Schema Migrations

When modifying the database schema:

1. Update `001_initial_schema.ts` directly for clean initial setups.
2. Ensure you add table drops to the `down()` function in exact reverse order of creation to prevent foreign key constraint violations during a reset.
3. Run `npm run db:reset && npm run db:migrate && npm run db:seed` to verify compilation correctness.
