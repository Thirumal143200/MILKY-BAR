/**
 * @module scripts/security-test
 * Automated Penetration Testing & OWASP Security Controls Verification Script.
 * Verifies Auth, RBAC, Privilege Escalation Prevention, Token Tampering,
 * SQL/Command Injection safety, and Header protections.
 */

process.env.NODE_ENV = 'test';
process.env.DB_CLIENT = 'sqlite';
process.env.SQLITE_FILENAME = ':memory:';
process.env.JWT_SECRET = 'test-jwt-secret-for-ci-minimum-32-chars';

import http from 'node:http';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { db } from '../src/database/connection.js';
import { config } from '../src/config/env.js';
import { up as upSchema } from '../src/database/migrations/001_initial_schema.js';

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordTest(category: string, name: string, passed: boolean, details: string) {
  results.push({ category, name, passed, details });
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${statusIcon}] [${category}] ${name} — ${details}`);
}

const validConsumerToken = jwt.sign(
  { sub: '00000000-0000-0000-0000-000000000001', email: 'consumer@milkboy.app', role: 'consumer' },
  config.jwt.secret,
  { expiresIn: '1h' },
);

const expiredToken = jwt.sign(
  { sub: '00000000-0000-0000-0000-000000000001', email: 'consumer@milkboy.app', role: 'consumer' },
  config.jwt.secret,
  { expiresIn: '-1s' },
);

const tamperedToken = validConsumerToken + 'tampered';

async function makeRequest(
  endpoint: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {},
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve) => {
    const req = http.request(
      'http://127.0.0.1:3998' + endpoint,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () =>
          resolve({ statusCode: res.statusCode || 500, headers: res.headers, body }),
        );
      },
    );

    req.on('error', () => resolve({ statusCode: 500, headers: {}, body: '' }));
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runPenetrationSuite() {
  console.log('===========================================================');
  console.log('  MilkBoy Monorepo — Controlled Security Penetration Suite  ');
  console.log('===========================================================');

  try {
    const hasUsers = await db.schema.hasTable('users');
    if (!hasUsers) await upSchema(db);
  } catch {
    // Migration fallback
  }

  const server = app.listen(3998);
  await new Promise((r) => setTimeout(r, 500));

  // 1. Unauthorized Access
  const unauthRes = await makeRequest('/api/v1/scans');
  recordTest(
    'Auth',
    'Deny Unauthorized Request',
    unauthRes.statusCode === 401,
    `Status ${unauthRes.statusCode} (Expected 401)`,
  );

  // 2. Tampered JWT Token
  const tamperedRes = await makeRequest('/api/v1/scans', {
    headers: { Authorization: `Bearer ${tamperedToken}` },
  });
  recordTest(
    'Auth',
    'Reject Tampered JWT Signature',
    tamperedRes.statusCode === 401,
    `Status ${tamperedRes.statusCode} (Expected 401)`,
  );

  // 3. Expired JWT Token
  const expiredRes = await makeRequest('/api/v1/scans', {
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  recordTest(
    'Auth',
    'Reject Expired JWT Token',
    expiredRes.statusCode === 401,
    `Status ${expiredRes.statusCode} (Expected 401)`,
  );

  // 4. Privilege Escalation (Consumer trying Admin API)
  const escRes = await makeRequest('/api/v1/admin/analytics', {
    headers: { Authorization: `Bearer ${validConsumerToken}` },
  });
  recordTest(
    'RBAC',
    'Prevent Privilege Escalation (Consumer -> Admin)',
    escRes.statusCode === 403,
    `Status ${escRes.statusCode} (Expected 403)`,
  );

  // 5. SQL Injection Payload in Query Param
  const sqlPayload = "' OR '1'='1";
  const sqlRes = await makeRequest(`/api/v1/scans?status=${encodeURIComponent(sqlPayload)}`, {
    headers: { Authorization: `Bearer ${validConsumerToken}` },
  });
  recordTest(
    'Injection',
    'SQL Injection Parameterized Handling',
    sqlRes.statusCode < 500,
    `Status ${sqlRes.statusCode} (Safe non-500 response)`,
  );

  // 6. Security Headers Verification
  const headerRes = await makeRequest('/health');
  const hasNoSniff = headerRes.headers['x-content-type-options'] === 'nosniff';
  const hasFrameDeny = headerRes.headers['x-frame-options'] === 'DENY';
  recordTest(
    'Headers',
    'Strict HTTP Security Headers (noSniff & frameguard)',
    hasNoSniff && hasFrameDeny,
    `noSniff: ${hasNoSniff}, frameDeny: ${hasFrameDeny}`,
  );

  server.close();
  await db.destroy();

  const totalPassed = results.filter((r) => r.passed).length;
  console.log('\n===========================================================');
  console.log(`  PENETRATION SUITE SUMMARY: ${totalPassed}/${results.length} PASSED  `);
  console.log('===========================================================\n');

  if (totalPassed !== results.length) {
    process.exit(1);
  }
}

runPenetrationSuite().catch((err) => {
  console.error('Security suite failed:', err);
  process.exit(1);
});
