import './setup-admin-env.js';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import { app } from '../../../app.js';
import { db } from '../../../database/connection.js';
import { up, down } from '../../../database/migrations/001_initial_schema.js';
import { authService } from '../../auth/auth.service.js';
import { hashPassword } from '../../../utils/crypto.js';

describe('Admin User & Permission Management Integration Tests', () => {
  let adminToken: string;
  let normalUserId: string;
  let superAdminRoleId: string;

  beforeAll(async () => {
    // Reset schema to ensure isolation
    await down(db);
    await up(db);

    // Seed roles
    const roles = [
      { id: 'role-super-admin', name: 'super_admin', display_name: 'Super Administrator' },
      { id: 'role-admin', name: 'admin', display_name: 'Administrator' },
      { id: 'role-producer', name: 'producer', display_name: 'Producer' },
      { id: 'role-consumer', name: 'consumer', display_name: 'Consumer' },
    ];
    await db('roles').insert(roles);
    superAdminRoleId = 'role-super-admin';

    // Seed permissions
    await db('permissions').insert([
      { id: 'perm-users-read', name: 'users:read', resource: 'users', action: 'read' },
      { id: 'perm-users-create', name: 'users:create', resource: 'users', action: 'create' },
      { id: 'perm-users-update', name: 'users:update', resource: 'users', action: 'update' },
      { id: 'perm-users-delete', name: 'users:delete', resource: 'users', action: 'delete' },
      {
        id: 'perm-permissions-read',
        name: 'permissions:read',
        resource: 'permissions',
        action: 'read',
      },
      {
        id: 'perm-permissions-update',
        name: 'permissions:update',
        resource: 'permissions',
        action: 'update',
      },
      { id: 'perm-roles-read', name: 'roles:read', resource: 'roles', action: 'read' },
    ]);

    // Create super_admin user directly via DB
    const adminPasswordHash = await hashPassword('Password@123!');
    await db('users').insert({
      id: 'admin-user-id',
      email: 'admin@milkboy.com',
      password_hash: adminPasswordHash,
      first_name: 'Super',
      last_name: 'Admin',
      role_id: 'role-super-admin',
      status: 'active',
      email_verified: true,
    });

    const loginRes = await authService.login(
      'admin@milkboy.com',
      'Password@123!',
      '127.0.0.1',
      'test-agent',
    );
    adminToken = loginRes.tokens!.accessToken;
  });

  afterAll(async () => {
    try {
      if (fs.existsSync('./data/milkboy_admin_test.sqlite')) {
        fs.unlinkSync('./data/milkboy_admin_test.sqlite');
      }
    } catch {
      // ignore
    }
  });

  describe('Admin User CRUD Endpoints', () => {
    it('should allow admin to create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newproducer@milkboy.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'producer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('newproducer@milkboy.com');
      normalUserId = res.body.data.id;
    });

    it('should retrieve the user details by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe('Jane');
      expect(res.body.data.status).toBe('active');
    });

    it('should deactivate the user successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${normalUserId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const check = await db('users').where('id', normalUserId).first();
      expect(check.status).toBe('deactivated');
    });

    it('should reactivate the user successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${normalUserId}/reactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const check = await db('users').where('id', normalUserId).first();
      expect(check.status).toBe('active');
    });

    it('should soft delete the user successfully', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const check = await db('users').where('id', normalUserId).first();
      expect(check.status).toBe('deleted');
      expect(check.deleted_at).not.toBeNull();
    });
  });

  describe('Admin Permissions & Roles Endpoints', () => {
    it('should list all available permissions', async () => {
      const res = await request(app)
        .get('/api/v1/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should list all available roles', async () => {
      const res = await request(app)
        .get('/api/v1/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should sync permissions of a role successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/roles/${superAdminRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          permissionIds: ['perm-users-read', 'perm-users-create'],
        });

      expect(res.status).toBe(200);

      const currentMappings = await db('role_permissions').where('role_id', superAdminRoleId);
      expect(currentMappings.length).toBe(2);
    });
  });
});
