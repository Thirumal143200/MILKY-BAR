/**
 * @module modules/scans/__tests__/batch-sync.integration.test
 * Integration tests for POST /api/v1/scans/batch-sync endpoint.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { db } from '../../../database/connection.js';
import { generateTokenPair } from '../../../utils/crypto.js';
import type { Express } from 'express';

describe('Batch Synchronization API Endpoint Integration Tests', () => {
  let app: Express;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    app = createApp();

    // Ensure database connection is ready and schema is migrated
    await db.migrate.latest();

    // Fetch or create a test role
    let role = await db('roles').where('name', 'producer').first();
    if (!role) {
      role = await db('roles').first();
    }

    // Create test user
    testUserId = 'test-batch-user-001';
    await db('users').insert({
      id: testUserId,
      email: 'batchuser@test.com',
      password_hash: 'hash123',
      first_name: 'Batch',
      last_name: 'Tester',
      role_id: role.id,
      status: 'active',
      email_verified: true,
    });

    const tokenPair = await generateTokenPair({
      id: testUserId,
      email: 'batchuser@test.com',
      role: 'producer',
    });
    authToken = tokenPair.accessToken;
  });

  afterAll(async () => {
    // Cleanup test records
    await db('scans').where('user_id', testUserId).delete();
    await db('users').where('id', testUserId).delete();
  });

  it('should deny unauthorized access without token', async () => {
    const res = await request(app).post('/api/v1/scans/batch-sync').send({ scans: [] });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should successfully sync a batch of offline scans', async () => {
    const clientScanId1 = `client-scan-101-${Date.now()}`;
    const clientScanId2 = `client-scan-102-${Date.now()}`;

    const payload = {
      scans: [
        {
          clientScanId: clientScanId1,
          timestamp: Date.now() - 5000,
          title: 'Offline Batch Test Scan 1',
          notes: 'Test notes 1',
          location: { latitude: 12.9716, longitude: 77.5946 },
        },
        {
          clientScanId: clientScanId2,
          timestamp: Date.now() - 2000,
          title: 'Offline Batch Test Scan 2',
          notes: 'Test notes 2',
        },
      ],
    };

    const res = await request(app)
      .post('/api/v1/scans/batch-sync')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.syncedCount).toBe(2);
    expect(res.body.data.failedCount).toBe(0);
    expect(res.body.data.results).toHaveLength(2);

    const item1 = res.body.data.results.find((r: any) => r.clientScanId === clientScanId1);
    expect(item1).toBeDefined();
    expect(item1.status).toBe('synced');
    expect(item1.serverId).toBeDefined();

    // Verify DB record created
    const dbScan = await db('scans').where('client_scan_id', clientScanId1).first();
    expect(dbScan).toBeDefined();
    expect(dbScan.user_id).toBe(testUserId);
  });

  it('should handle duplicate clientScanId idempotently without duplicating records', async () => {
    const duplicateScanId = `duplicate-scan-${Date.now()}`;

    const payload = {
      scans: [
        {
          clientScanId: duplicateScanId,
          timestamp: Date.now(),
          title: 'Initial Upload Scan',
        },
      ],
    };

    // First upload
    const firstRes = await request(app)
      .post('/api/v1/scans/batch-sync')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(firstRes.status).toBe(200);
    expect(firstRes.body.data.syncedCount).toBe(1);

    // Second upload with same clientScanId
    const secondRes = await request(app)
      .post('/api/v1/scans/batch-sync')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(secondRes.status).toBe(200);
    expect(secondRes.body.data.duplicateCount).toBe(1);

    const dupResult = secondRes.body.data.results[0];
    expect(dupResult.status).toBe('duplicate');
    expect(dupResult.serverId).toBe(firstRes.body.data.results[0].serverId);

    // Confirm only 1 scan exists in database
    const dbScans = await db('scans').where('client_scan_id', duplicateScanId);
    expect(dbScans).toHaveLength(1);
  });

  it('should handle invalid items with partial batch error handling', async () => {
    const validScanId = `valid-partial-${Date.now()}`;

    const payload = {
      scans: [
        {
          clientScanId: '', // Invalid missing clientScanId
          timestamp: Date.now(),
        },
        {
          clientScanId: validScanId,
          timestamp: Date.now(),
          title: 'Valid Partial Item',
        },
      ],
    };

    const res = await request(app)
      .post('/api/v1/scans/batch-sync')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.data.syncedCount).toBe(1);
    expect(res.body.data.failedCount).toBe(1);
    expect(res.body.data.results).toHaveLength(2);
  });
});
