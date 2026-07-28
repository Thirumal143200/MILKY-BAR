/**
 * @module modules/notifications/__tests__/notifications.integration.test
 * Integration tests for Enterprise Notification System APIs, dispatcher, and preferences.
 */

import '../../scans/__tests__/setup-scans-env.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../../app.js';
import { config } from '../../../config/env.js';
import { db } from '../../../database/connection.js';
import { up, down } from '../../../database/migrations/001_initial_schema.js';
import { notificationDispatcher } from '../../../services/notifications/notificationDispatcher.js';
import { notificationsService } from '../notifications.service.js';

describe('Enterprise Notification System Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let roleId: string;

  beforeAll(async () => {
    try {
      await down(db);
    } catch {
      // ignore rollback error if tables do not exist
    }
    await up(db);

    roleId = 'role-producer-notif-test';
    await db('roles').insert({
      id: roleId,
      name: 'producer',
      display_name: 'Producer',
    });

    // Create Admin Role
    await db('roles').insert({
      id: 'role-admin-notif-test',
      name: 'admin',
      display_name: 'Admin',
    });

    // Seed notification permissions
    const perms = [
      {
        id: 'perm-notif-read',
        name: 'notifications:read',
        resource: 'notifications',
        action: 'read',
      },
      {
        id: 'perm-notif-update',
        name: 'notifications:update',
        resource: 'notifications',
        action: 'update',
      },
      {
        id: 'perm-notif-delete',
        name: 'notifications:delete',
        resource: 'notifications',
        action: 'delete',
      },
    ];
    await db('permissions').insert(perms);

    await db('role_permissions').insert(
      perms.map((p) => ({ role_id: roleId, permission_id: p.id })),
    );

    testUserId = 'user-notif-001';
    await db('users').insert({
      id: testUserId,
      email: 'notifuser@test.com',
      password_hash: 'hash123',
      first_name: 'Notif',
      last_name: 'Tester',
      role_id: roleId,
      status: 'active',
      email_verified: true,
    });

    authToken = jwt.sign(
      { sub: testUserId, email: 'notifuser@test.com', role: 'producer', roleId },
      config.jwt.secret,
      { expiresIn: '15m' },
    );
  });

  afterAll(async () => {
    if (testUserId) {
      await db('notifications').where('user_id', testUserId).delete();
      await db('user_devices').where('user_id', testUserId).delete();
      await db('users').where('id', testUserId).delete();
    }
  });

  it('should deny unauthorized access without token', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });

  it('should deliver event-driven notification via notificationDispatcher', async () => {
    const count = await notificationDispatcher.dispatch({
      event: 'scan:completed',
      userId: testUserId,
      title: 'Test Scan Completed',
      message: 'Your milk quality scan has been processed successfully.',
      data: { scanId: 'scan-101' },
    });

    expect(count).toBe(1);

    const dbNotif = await db('notifications')
      .where({ user_id: testUserId, type: 'scan:completed' })
      .first();
    expect(dbNotif).toBeDefined();
    expect(dbNotif.title).toBe('Test Scan Completed');
    expect(dbNotif.category).toBe('scan');
  });

  it('should support role-based notification broadcasting to multiple users', async () => {
    const count = await notificationDispatcher.dispatch({
      event: 'admin:system_warning',
      role: 'producer',
      title: 'Scheduled System Maintenance',
      message: 'MilkBoy services will undergo maintenance tonight at midnight.',
    });

    expect(count).toBeGreaterThanOrEqual(1);

    const dbNotif = await db('notifications')
      .where({ user_id: testUserId, type: 'admin:system_warning' })
      .first();
    expect(dbNotif).toBeDefined();
    expect(dbNotif.category).toBe('admin');
  });

  it('GET /api/v1/notifications should return paginated list of user notifications', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/v1/notifications/unread should return unread items and total count', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/unread')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.unreadCount).toBeGreaterThanOrEqual(2);
  });

  it('PUT /api/v1/notifications/:id/read should mark notification as read', async () => {
    const item = await db('notifications').where({ user_id: testUserId, read: false }).first();
    expect(item).toBeDefined();

    const res = await request(app)
      .put(`/api/v1/notifications/${item.id}/read`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    const updated = await db('notifications').where('id', item.id).first();
    expect(Boolean(updated.read)).toBe(true);
  });

  it('PUT /api/v1/notifications/read-all should mark all user notifications as read', async () => {
    const res = await request(app)
      .put('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    const unread = await db('notifications').where({ user_id: testUserId, read: false });
    expect(unread).toHaveLength(0);
  });

  it('POST /api/v1/notifications/tokens should register user push device token', async () => {
    const payload = {
      token: 'fcm-push-token-test-12345',
      deviceType: 'android',
      deviceName: 'Pixel 8 Pro',
    };

    const res = await request(app)
      .post('/api/v1/notifications/tokens')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.push_token).toBe(payload.token);

    const dbDevice = await db('user_devices')
      .where({ user_id: testUserId, push_token: payload.token })
      .first();
    expect(dbDevice).toBeDefined();
  });

  it('PUT /api/v1/notifications/preferences should update and enforce user preference settings', async () => {
    const newPrefs = {
      enableNotifications: true,
      enablePush: true,
      categories: {
        scan: false, // Disable scan category notifications
      },
    };

    const res = await request(app)
      .put('/api/v1/notifications/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newPrefs);

    expect(res.status).toBe(200);
    expect(res.body.data.categories.scan).toBe(false);

    // Attempt to dispatch a scan notification — should be suppressed by preference check
    const dispatchResult = await notificationsService.create(testUserId, {
      category: 'scan',
      type: 'scan:started',
      title: 'Suppressed Scan',
      message: 'This scan notification should be suppressed.',
    });

    expect(dispatchResult).toBeNull();
  });

  it('DELETE /api/v1/notifications/:id should delete single notification', async () => {
    const item = await db('notifications').where({ user_id: testUserId }).first();
    expect(item).toBeDefined();

    const res = await request(app)
      .delete(`/api/v1/notifications/${item.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    const deleted = await db('notifications').where('id', item.id).first();
    expect(deleted).toBeUndefined();
  });

  it('DELETE /api/v1/notifications should clear all notifications for user', async () => {
    const res = await request(app)
      .delete('/api/v1/notifications')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    const remaining = await db('notifications').where('user_id', testUserId);
    expect(remaining).toHaveLength(0);
  });
});
