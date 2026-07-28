/**
 * Command-line script to restore database from a backup JSON file.
 * Usage: npx tsx scripts/restore-db.ts <path-to-backup.json>
 */

import fs from 'node:fs';
import path from 'node:path';
import { db } from '../src/database/connection.js';
import { createModuleLogger } from '../src/utils/logger.js';

const log = createModuleLogger('restore-script');

async function runRestore() {
  const filePathArg = process.argv[2];
  if (!filePathArg) {
    log.error('Usage: npx tsx scripts/restore-db.ts <path-to-backup.json>');
    process.exit(1);
  }

  const backupFile = path.resolve(filePathArg);
  if (!fs.existsSync(backupFile)) {
    log.error(`Backup file not found: ${backupFile}`);
    process.exit(1);
  }

  log.info(`Reading backup file: ${backupFile}...`);
  const rawData = fs.readFileSync(backupFile, 'utf-8');
  const dumpData = JSON.parse(rawData) as Record<string, unknown[]>;

  log.info('Restoring data tables...');
  for (const [table, rows] of Object.entries(dumpData)) {
    if (rows && rows.length > 0) {
      log.info(`Restoring ${rows.length} rows to '${table}'...`);
      for (const row of rows) {
        try {
          await db(table).insert(row).onConflict().merge();
        } catch {
          // fallback insert if onConflict not supported
          try {
            await db(table).insert(row);
          } catch {}
        }
      }
    }
  }

  log.info('Database restore operation complete!');
  process.exit(0);
}

runRestore().catch((err) => {
  log.error('Restore operation failed', { err });
  process.exit(1);
});
