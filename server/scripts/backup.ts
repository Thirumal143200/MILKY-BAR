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

  const logId = generateId();

  // Insert initial pending state in backup_logs
  await db('backup_logs').insert({
    id: logId,
    type: 'full',
    file_path: filePath,
    file_size: 0,
    status: 'pending',
    created_at: new Date(),
  });

  try {
    if (config.db.client === 'sqlite') {
      log.info('SQLite detected, copying database file directly.');
      await fs.copyFile(config.db.sqliteFilename, filePath);
    } else {
      const { host, port, name, user, password } = config.db;
      // Construct pg_dump command
      const cmd = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -F c -b -v -f "${filePath}" ${name}`;
      await execAsync(cmd);
    }

    const stat = await fs.stat(filePath);
    await db('backup_logs').where('id', logId).update({
      file_size: stat.size,
      status: 'success',
      completed_at: new Date(),
    });

    log.info(`Database backup completed successfully: ${filePath}`);
  } catch (error: any) {
    log.error('Database backup failed', { error });

    await db('backup_logs')
      .where('id', logId)
      .update({
        status: 'failed',
        error_message: error.message || String(error),
        completed_at: new Date(),
      });

    process.exit(1);
  }
}

backup().then(() => process.exit(0));
