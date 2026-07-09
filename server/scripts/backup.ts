import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import { config } from '../src/config/env.js';
import { createModuleLogger } from '../src/utils/logger.js';
import { db } from '../src/database/connection.js';
import { generateId } from '../src/utils/crypto.js';

const execAsync = promisify(exec);
const log = createModuleLogger('db-backup');

async function backup() {
  log.info('Starting database backup process...');

  const backupDir = path.resolve(process.cwd(), 'backups');
  await fs.mkdir(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${config.db.name}_${timestamp}.sql`;
  const filePath = path.join(backupDir, filename);

  const { host, port, name, user, password } = config.db;

  if (config.db.client === 'sqlite') {
    log.info('SQLite detected, copying database file directly.');
    await fs.copyFile(config.db.sqliteFilename, filePath);
    log.info(`Backup successful: ${filePath}`);
    return;
  }

  // Construct pg_dump command (warning: passing password in env is safer,
  // but for script automation this is common practice in secure environments)
  const cmd = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -F c -b -v -f "${filePath}" ${name}`;

  try {
    const { stdout, stderr } = await execAsync(cmd);

    // Log the backup event in the database
    const stat = await fs.stat(filePath);
    await db('backup_logs').insert({
      id: generateId(),
      file_path: filePath,
      size_bytes: stat.size,
      status: 'success',
    });

    log.info(`Database backup completed successfully: ${filePath}`);
  } catch (error) {
    log.error('Database backup failed', { error });

    await db('backup_logs').insert({
      id: generateId(),
      file_path: filePath,
      size_bytes: 0,
      status: 'failed',
    });

    process.exit(1);
  }
}

backup().then(() => process.exit(0));
