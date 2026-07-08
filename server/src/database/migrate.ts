/**
 * @module database/migrate
 * Runs database migrations programmatically.
 */

import { db, testConnection } from './connection.js';
import { up } from './migrations/001_initial_schema.js';
import { createModuleLogger } from '../utils/logger.js';

const log = createModuleLogger('migrate');

async function migrate() {
  try {
    log.info('Starting database migration...');

    const connected = await testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database');
    }

    // Check if tables already exist
    const hasUsers = await db.schema.hasTable('users');
    if (hasUsers) {
      log.info('Tables already exist. Skipping migration.');
      await db.destroy();
      return;
    }

    await up(db);
    log.info('Migration completed successfully.');

    await db.destroy();
    process.exit(0);
  } catch (error) {
    log.error('Migration failed', { error });
    await db.destroy();
    process.exit(1);
  }
}

migrate();
