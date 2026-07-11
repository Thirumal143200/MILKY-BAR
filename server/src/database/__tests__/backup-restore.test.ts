import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

// Setup environment for the test database
process.env.NODE_ENV = 'test';
process.env.DB_CLIENT = 'sqlite';
process.env.SQLITE_FILENAME = './data/milkboy_backup_test.sqlite';

// Ensure SQLite directory exists
const dir = path.dirname(process.env.SQLITE_FILENAME);
try {
  await fs.mkdir(dir, { recursive: true });
} catch {
  // ignore
}

const execAsync = promisify(exec);

describe('Database Backup & Restore System', () => {
  const backupsDir = path.resolve(process.cwd(), 'backups');
  let db: any;

  beforeAll(async () => {
    // Recreate/migrate the test database
    const knex = (await import('knex')).default;
    const { getKnexConfig } = await import('../connection.js');
    db = knex(getKnexConfig());

    // Run migration
    const { up } = await import('../migrations/001_initial_schema.js');
    const hasUsers = await db.schema.hasTable('users');
    if (!hasUsers) {
      await up(db);
    }

    try {
      await fs.rm(backupsDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  afterAll(async () => {
    if (db) {
      await db.destroy();
    }
    // Clean up test DB file
    try {
      await fs.unlink(process.env.SQLITE_FILENAME!);
    } catch {
      // ignore
    }
    // Clean up backups
    try {
      await fs.rm(backupsDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('should successfully run backup script, create SQL file, and log to backup_logs', async () => {
    // 1. Run the backup command
    const { stderr } = await execAsync('npx tsx scripts/backup.ts');
    expect(stderr).toBeFalsy();

    // 2. Read backups directory to find the backup file
    const files = await fs.readdir(backupsDir);
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/^backup_.*\.sql$/);

    const backupFile = files[0];
    const filePath = path.join(backupsDir, backupFile);
    const stat = await fs.stat(filePath);
    expect(stat.size).toBeGreaterThan(0);

    // 3. Query backup_logs to verify logging occurred
    const logs = await db('backup_logs').select('*');
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('success');
    expect(logs[0].type).toBe('full');
    expect(Number(logs[0].file_size)).toBe(stat.size);
  });

  it('should successfully restore database back to backup state', async () => {
    // 1. Find the backup file we created
    const files = await fs.readdir(backupsDir);
    const backupFile = files.find((f) => f.endsWith('.sql'));
    expect(backupFile).toBeDefined();

    // 2. Make a modification in the database (e.g. insert a unique dummy setting)
    const uniqueKey = `backup-restore-test-${Date.now()}`;
    await db('system_settings').insert({
      id: 'd9e03d42-ef49-43c2-8fe2-a279db04b901',
      key: uniqueKey,
      value: 'dummy-value',
      category: 'test',
      description: 'temporary test value',
    });

    // Verify it is there
    let setting = await db('system_settings').where('key', uniqueKey).first();
    expect(setting).toBeDefined();

    // 3. Close connection before restore (essential for SQLite file lock release)
    await db.destroy();

    // 4. Run the restore command
    const { stderr } = await execAsync(`npx tsx scripts/restore.ts ${backupFile}`);
    expect(stderr).toBeFalsy();

    // Re-initialize db connection to verify content
    const knex = (await import('knex')).default;
    const { getKnexConfig } = await import('../connection.js');
    db = knex(getKnexConfig());

    // 5. Verify the setting is no longer present (since it was restored to the snapshot state)
    setting = await db('system_settings').where('key', uniqueKey).first();
    expect(setting).toBeUndefined();
  });
});
