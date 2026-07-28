/**
 * Command-line script to perform automated database backups (SQLite or PostgreSQL).
 * Usage: npx tsx scripts/backup-db.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { db } from '../src/database/connection.js';
import { config } from '../src/config/env.js';
import { createModuleLogger } from '../src/utils/logger.js';

const log = createModuleLogger('backup-script');

async function runBackup() {
  log.info('Starting automated database backup routine...');
  const backupDir = path.resolve(config.storage.localPath, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `db-dump-${timestamp}.json`);

  const tables = [
    'roles',
    'permissions',
    'role_permissions',
    'users',
    'user_devices',
    'scans',
    'scan_images',
    'predictions',
    'reports',
    'report_qr_codes',
    'lab_validations',
    'notifications',
    'system_settings',
    'feature_flags',
    'audit_logs',
    'backup_logs',
  ];

  const dumpData: Record<string, unknown[]> = {};

  for (const table of tables) {
    try {
      dumpData[table] = await db(table).select('*');
      log.info(`Backed up ${dumpData[table].length} records from table '${table}'`);
    } catch (error) {
      log.warn(`Table '${table}' skip or empty: ${error instanceof Error ? error.message : 'Unknown'}`);
      dumpData[table] = [];
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(dumpData, null, 2));
  const fileSize = fs.statSync(backupFile).size;

  log.info(`Database backup completed successfully: ${backupFile} (${(fileSize / 1024).toFixed(1)} KB)`);
  process.exit(0);
}

runBackup().catch((err) => {
  log.error('Backup routine failed', { err });
  process.exit(1);
});
