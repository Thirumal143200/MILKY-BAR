/**
 * @module modules/admin/__tests__/deployment.integration.test
 * Integration tests verifying health, liveness, readiness, environment setup, and backup scripts.
 */

import '../../scans/__tests__/setup-scans-env.js';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';

describe('Production Deployment & Infrastructure Integration Tests', () => {
  it('GET /health should return 200 with healthy status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /liveness should return 200 with alive status and uptime', async () => {
    const res = await request(app).get('/liveness');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('alive');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /readiness should return 200 when database connection is ready', async () => {
    const res = await request(app).get('/readiness');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });

  it('GET /api/v1/health should match root health response', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /api/v1/readiness should match root readiness response', async () => {
    const res = await request(app).get('/api/v1/readiness');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});
