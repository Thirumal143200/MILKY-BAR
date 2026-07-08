/**
 * @module database/reset
 * Drops all tables and re-seeds the database.
 * WARNING: This destroys all data!
 */

import { db, testConnection } from './connection.js';
import { down } from './migrations/001_initial_schema.js';
import { createModuleLogger } from '../utils/logger.js';

const log = createModuleLogger('reset');

async function reset() {
  try {
    log.warn('⚠️  Resetting database — all data will be destroyed!');

    const connected = await testConnection();
    if (!connected) throw new Error('Cannot connect to database');

    await down(db);
    log.info('All tables dropped.');

    await db.destroy();
    log.info('Database reset complete. Run `npm run db:seed` to re-populate.');
    process.exit(0);
  } catch (error) {
    log.error('Reset failed', { error });
    await db.destroy();
    process.exit(1);
  }
}

reset();
