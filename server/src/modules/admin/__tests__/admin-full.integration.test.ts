/**
 * @module modules/admin/__tests__/admin-full.integration.test
 * Integration tests for Super Admin Dashboard APIs, Analytics, Monitoring, and RBAC.
 */

import '../../scans/__tests__/setup-scans-env.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../../app.js';
import { config } from '../../../config/env.js';
import { db } from '../../../database/connection.js';
import { up, down } from '../../../database/migrations/001_initial_schema.js';

describe('Enterprise Super Admin Dashboard Integration Tests', () => {
  let adminAuthToken: string;
  let producerAuthToken: string;
  let adminUserId: string;
  let producerUserId: string;

  beforeAll(async () => {
    try {
      await down(db);
    } catch {}
    await up(db);

    // Seed roles
    const adminRoleId = 'role-super-admin';
    const producerRoleId = 'role-producer';

    await db('roles').insert([
      { id: adminRoleId, name: 'super_admin', display_name: 'Super Administrator' },
      { id: producerRoleId, name: 'producer', display_name: 'Producer' },
    ]);

    // Seed permissions
    const perms = [
      { id: 'p1', name: 'analytics:read', resource: 'analytics', action: 'read' },
      { id: 'p2', name: 'settings:read', resource: 'settings', action: 'read' },
      { id: 'p3', name: 'feature_flags:read', resource: 'feature_flags', action: 'read' },
      { id: 'p4', name: 'backups:read', resource: 'backups', action: 'read' },
      { id: 'p5', name: 'backups:create', resource: 'backups', action: 'create' },
    ];
    await db('permissions').insert(perms);

    await db('role_permissions').insert(
      perms.map((p) => ({ role_id: adminRoleId, permission_id: p.id }))
    );

    adminUserId = 'user-super-admin-001';
    await db('users').insert({
      id: adminUserId,
      email: 'superadmin@test.com',
      password_hash: 'hash123',
      first_name: 'Super',
      last_name: 'Admin',
      role_id: adminRoleId,
      status: 'active',
      email_verified: true,
    });

    producerUserId = 'user-producer-001';
    await db('users').insert({
      id: producerUserId,
      email: 'producer@test.com',
      password_hash: 'hash123',
      first_name: 'Normal',
      last_name: 'Producer',
      role_id: producerRoleId,
      status: 'active',
      email_verified: true,
    });

    adminAuthToken = jwt.sign(
      { sub: adminUserId, email: 'superadmin@test.com', role: 'super_admin', roleId: adminRoleId },
      config.jwt.secret,
      { expiresIn: '15m' },
    );

    producerAuthToken = jwt.sign(
      { sub: producerUserId, email: 'producer@test.com', role: 'producer', roleId: producerRoleId },
      config.jwt.secret,
      { expiresIn: '15m' },
    );
  });

  afterAll(async () => {
    if (adminUserId) {
      await db('users').whereIn('id', [adminUserId, producerUserId]).delete();
    }
  });

  it('should deny non-admin users access to admin analytics with 403', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${producerAuthToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/v1/admin/analytics should return system analytics metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalUsers).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/v1/admin/analytics/producers should return producer analytics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/producers')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalProducers).toBeDefined();
  });

  it('GET /api/v1/admin/analytics/consumers should return consumer analytics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/consumers')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalConsumers).toBeDefined();
  });

  it('GET /api/v1/admin/analytics/lab should return laboratory analytics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/lab')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pendingReviewsCount).toBeDefined();
  });

  it('GET /api/v1/admin/analytics/reports should return report analytics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/reports')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalReportsGenerated).toBeDefined();
  });

  it('GET /api/v1/admin/monitoring should return system resource metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/monitoring')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.memory).toBeDefined();
  });

  it('GET /api/v1/admin/system/health should return system health status', async () => {
    const res = await request(app)
      .get('/api/v1/admin/system/health')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /api/v1/admin/feature-flags and PUT /api/v1/admin/feature-flags should manage feature flags', async () => {
    const getRes = await request(app)
      .get('/api/v1/admin/feature-flags')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(getRes.status).toBe(200);

    const putRes = await request(app)
      .put('/api/v1/admin/feature-flags')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({ name: 'flag_test_demo', enabled: true });

    expect(putRes.status).toBe(200);
    expect(Boolean(putRes.body.data.enabled)).toBe(true);
  });

  it('POST /api/v1/admin/backups should trigger a database backup log', async () => {
    const res = await request(app)
      .post('/api/v1/admin/backups')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.filePath).toBeDefined();
  });
});
