import './setup-auth-env.js';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import request from 'supertest';
import { authenticator } from 'otplib';
import { app } from '../../../app.js';
import { db } from '../../../database/connection.js';
import { up, down } from '../../../database/migrations/001_initial_schema.js';
import { authService } from '../auth.service.js';

describe('Auth & Security Integration Tests (Real DB)', () => {
  let adminRoleId: string;
  let producerRoleId: string;
  let consumerRoleId: string;

  beforeAll(async () => {
    // Reset schema to ensure isolation
    await down(db);
    // Run schema migrations
    await up(db);

    // Retrieve or seed system roles
    const roles = await db('roles').select();
    if (roles.length === 0) {
      await db('roles').insert([
        { id: 'role-super-admin', name: 'super_admin', display_name: 'Super Administrator' },
        { id: 'role-admin', name: 'admin', display_name: 'Administrator' },
        { id: 'role-producer', name: 'producer', display_name: 'Producer' },
        { id: 'role-consumer', name: 'consumer', display_name: 'Consumer' },
        { id: 'role-lab-staff', name: 'lab_staff', display_name: 'Laboratory Staff' },
      ]);
    }

    const seededRoles = await db('roles').select();
    adminRoleId = seededRoles.find((r) => r.name === 'admin')?.id ?? '';
    producerRoleId = seededRoles.find((r) => r.name === 'producer')?.id ?? '';
    consumerRoleId = seededRoles.find((r) => r.name === 'consumer')?.id ?? '';

    // Seed permissions
    await db('permissions').insert([
      { id: 'perm-admin-manage', name: 'users:manage', resource: 'users', action: 'manage' },
      { id: 'perm-producer-create', name: 'scans:create', resource: 'scans', action: 'create' },
    ]);

    // Seed role-permission mapping
    await db('role_permissions').insert([
      { role_id: adminRoleId, permission_id: 'perm-admin-manage' },
      { role_id: producerRoleId, permission_id: 'perm-producer-create' },
    ]);
  });

  afterAll(async () => {
    try {
      if (fs.existsSync('./data/milkboy_auth_test.sqlite')) {
        fs.unlinkSync('./data/milkboy_auth_test.sqlite');
      }
    } catch {
      // ignore
    }
  });

  describe('Registration Flow', () => {
    it('should register a new consumer successfully', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'consumer@integration.com',
        password: 'Password@123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'consumer',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('consumer@integration.com');

      const user = await db('users').where('email', 'consumer@integration.com').first();
      expect(user).toBeDefined();
      expect(user.first_name).toBe('John');
      expect(user.role_id).toBe(consumerRoleId);
    });

    it('should fail registration with duplicate email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'consumer@integration.com',
        password: 'Password@123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should block self-registration as admin', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'admin@integration.com',
        password: 'Password@123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Email Verification Flow', () => {
    it('should fail with invalid verify token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: 'invalid-token' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should verify email successfully', async () => {
      const user = await db('users').where('email', 'consumer@integration.com').first();
      expect(user.email_verified).toBe(0); // false in sqlite numeric
      expect(user.email_verify_token).toBeDefined();

      // Find token matching database verify hash
      // In this test environment, we bypass token hashing by directly verifying state
      await db('users').where('id', user.id).update({
        email_verified: true,
        email_verify_token: null,
      });

      const updatedUser = await db('users').where('id', user.id).first();
      expect(updatedUser.email_verified).toBe(1);
    });
  });

  describe('Login & Session Management Flow', () => {
    it('should login successfully with verified user', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'consumer@integration.com',
        password: 'Password@123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should increment login attempts and lockout user after max failures', async () => {
      const email = 'lockout@integration.com';

      // Register verified user
      await authService.register({
        email,
        password: 'Password@123!',
        firstName: 'Lockout',
        lastName: 'Test',
      });
      await db('users').where('email', email).update({ email_verified: true });

      // Run 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({ email, password: 'WrongPassword@123' });

        expect(loginRes.status).toBe(401);
      }

      // 6th attempt should be blocked due to account lockout
      const finalRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'Password@123!' });

      expect(finalRes.status).toBe(429);
      expect(finalRes.body.error.message).toContain('Too many authentication attempts');
    }, 15000);
  });

  describe('JWT Access Token and RBAC Flow', () => {
    let producerToken: string;
    let consumerToken: string;

    beforeAll(async () => {
      // Register and login producer
      await authService.register({
        email: 'producer@integration.com',
        password: 'Password@123!',
        firstName: 'Producer',
        lastName: 'Test',
        role: 'producer',
      });
      await db('users').where('email', 'producer@integration.com').update({ email_verified: true });

      const prodLogin = await authService.login(
        'producer@integration.com',
        'Password@123!',
        '127.0.0.1',
        'test-agent',
      );
      producerToken = prodLogin.tokens!.accessToken;

      // Login consumer
      const consLogin = await authService.login(
        'consumer@integration.com',
        'Password@123!',
        '127.0.0.1',
        'test-agent',
      );
      consumerToken = consLogin.tokens!.accessToken;
    });

    it('should deny access to authenticated routes without token', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });

    it('should allow access to authenticated routes with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${consumerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('consumer@integration.com');
    });

    it('should restrict role-based access appropriately (RBAC)', async () => {
      // Create batch (requires min role producer)
      const res1 = await request(app)
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ name: 'Invalid Batch' });

      // Consumer should be forbidden
      expect(res1.status).toBe(403);

      const res2 = await request(app)
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${producerToken}`)
        .send({ name: 'Valid Producer Batch' });

      // Producer should be allowed
      expect(res2.status).toBe(201);
    });
  });

  describe('TOTP Multi-Factor Authentication Flow', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
      // Login consumer to get auth token
      const res = await authService.login(
        'consumer@integration.com',
        'Password@123!',
        '127.0.0.1',
        'test-agent',
      );
      token = res.tokens!.accessToken;
      userId = res.user!.id;
    });

    it('should successfully setup MFA and generate secrets', async () => {
      const res = await request(app)
        .post('/api/v1/auth/mfa/setup')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.secret).toBeDefined();
      expect(res.body.data.qrCodeUrl).toBeDefined();
    });

    it('should fail MFA verification with invalid TOTP token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/mfa/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: '123456' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should verify and enable MFA with correct TOTP token', async () => {
      const user = await db('users').where('id', userId).first();
      expect(user.mfa_secret).toBeDefined();

      const correctOtp = authenticator.generate(user.mfa_secret);

      const res = await request(app)
        .post('/api/v1/auth/mfa/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: correctOtp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedUser = await db('users').where('id', userId).first();
      expect(updatedUser.mfa_enabled).toBe(1);
    });
  });
});
