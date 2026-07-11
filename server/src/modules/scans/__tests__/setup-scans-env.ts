import fs from 'node:fs';
import path from 'node:path';

process.env.NODE_ENV = 'test';
process.env.DB_CLIENT = 'sqlite';
process.env.SQLITE_FILENAME = './data/milkboy_scans_test.sqlite';

const dir = path.dirname(process.env.SQLITE_FILENAME);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
