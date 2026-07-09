import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import { config } from '../src/config/env.js';
import { createModuleLogger } from '../src/utils/logger.js';

const execAsync = promisify(exec);
const log = createModuleLogger('db-restore');

async function restore() {
  log.info('Starting database restore process...');

  const args = process.argv.slice(2);
  if (args.length === 0) {
    log.error(
      'Please provide the backup filename as an argument. Usage: tsx restore.ts <filename>',
    );
    process.exit(1);
  }

  const filename = args[0];
  const filePath = path.resolve(process.cwd(), 'backups', filename);

  try {
    await fs.access(filePath);
  } catch {
    log.error(`Backup file not found: ${filePath}`);
    process.exit(1);
  }

  if (config.db.client === 'sqlite') {
    log.info('SQLite detected, copying database file directly.');
    await fs.copyFile(filePath, config.db.sqliteFilename);
    log.info(`Restore successful: ${filePath}`);
    return;
  }

  const { host, port, name, user, password } = config.db;

  // Construct pg_restore command
  // Note: -c drops objects before creating, -C creates the database if it doesn't exist.
  const cmd = `PGPASSWORD="${password}" pg_restore -h ${host} -p ${port} -U ${user} -d ${name} -1 -c "${filePath}"`;

  try {
    log.warn('WARNING: This will overwrite existing data in the database!');
    const { stdout, stderr } = await execAsync(cmd);
    log.info(`Database restore completed successfully from: ${filePath}`);
  } catch (error) {
    log.error('Database restore failed', { error });
    process.exit(1);
  }
}

restore().then(() => process.exit(0));
