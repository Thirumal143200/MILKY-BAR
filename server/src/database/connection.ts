/**
 * @module database/connection
 * Database connection setup with Knex.js.
 * Supports PostgreSQL (production) and SQLite (development).
 */

import knex, { type Knex } from 'knex';
import path from 'node:path';
import fs from 'node:fs';
import { config } from '../config/env.js';
import { createModuleLogger } from '../utils/logger.js';

const log = createModuleLogger('database');

function getKnexConfig(): Knex.Config {
  if (config.db.client === 'sqlite') {
    // Ensure the data directory exists
    const dbDir = path.dirname(config.db.sqliteFilename);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return {
      client: 'better-sqlite3',
      connection: {
        filename: config.db.sqliteFilename,
      },
      useNullAsDefault: true,
      pool: {
        afterCreate: (conn: { pragma: (sql: string) => void }, done: (err: Error | null, conn: unknown) => void) => {
          // Enable WAL mode and foreign keys for SQLite
          conn.pragma('journal_mode = WAL');
          conn.pragma('foreign_keys = ON');
          done(null, conn);
        },
      },
    };
  }

  return {
    client: 'pg',
    connection: {
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      ssl: config.isProd ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
  };
}

/** Global database instance */
export const db: Knex = knex(getKnexConfig());

/**
 * Test the database connection.
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (config.db.client === 'sqlite') {
      await db.raw('SELECT 1');
    } else {
      await db.raw('SELECT NOW()');
    }
    log.info(`Database connected (${config.db.client})`);
    return true;
  } catch (error) {
    log.error('Database connection failed', { error });
    return false;
  }
}

/**
 * Close the database connection.
 */
export async function closeConnection(): Promise<void> {
  await db.destroy();
  log.info('Database connection closed');
}

export { getKnexConfig };
