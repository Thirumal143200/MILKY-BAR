/**
 * @module database/connection
 * Database connection setup with Knex.js.
 * Supports PostgreSQL (production) and SQLite (development).
 */

import knex, { type Knex } from 'knex';
import { config } from '../config/env.js';
import { createModuleLogger } from '../utils/logger.js';

const log = createModuleLogger('database');

function getKnexConfig(): Knex.Config {
  if (config.db.client === 'sqlite') {
    return {
      client: 'sqlite3',
      connection: {
        filename: config.db.sqliteFilename,
      },
      useNullAsDefault: true,
      pool: {
        min: 1,
        max: 1,
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
 * Test the database connection with exponential backoff retry.
 */
export async function testConnection(maxRetries = 5): Promise<boolean> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await db.raw('SELECT 1');
      log.info(`Database connected (${config.db.client})`);
      return true;
    } catch (error) {
      retries++;
      log.warn(`Database connection failed (Attempt ${retries}/${maxRetries})`);

      if (retries >= maxRetries) {
        log.error('Max database connection retries reached', { error });
        return false;
      }

      const backoffDelay = Math.pow(2, retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
  return false;
}

/**
 * Close the database connection.
 */
export async function closeConnection(): Promise<void> {
  await db.destroy();
  log.info('Database connection closed');
}

export { getKnexConfig };
