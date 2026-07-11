import './setup-ai-env.js';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import { app } from '../../../app.js';
import { db } from '../../../database/connection.js';
import { up, down } from '../../../database/migrations/001_initial_schema.js';
import { authService } from '../../auth/auth.service.js';

describe('AI Module Endpoints Integration Tests', () => {
  let userToken: string;

  beforeAll(async () => {
    // Reset schema to ensure isolation
    await down(db);
    await up(db);

    // Seed roles
    await db('roles').insert([
      { id: 'role-super-admin', name: 'super_admin', display_name: 'Super Administrator' },
      { id: 'role-producer', name: 'producer', display_name: 'Producer' },
    ]);

    // Seed permissions
    await db('permissions').insert([
      { id: 'perm-scans-read', name: 'scans:read', resource: 'scans', action: 'read' },
      { id: 'perm-scans-create', name: 'scans:create', resource: 'scans', action: 'create' },
    ]);

    // Role mapping
    await db('role_permissions').insert([
      { role_id: 'role-producer', permission_id: 'perm-scans-read' },
      { role_id: 'role-producer', permission_id: 'perm-scans-create' },
    ]);

    // Create user
    await authService.register({
      email: 'producer@milkboy.com',
      password: 'Password@123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'producer',
    });
    await db('users').where('email', 'producer@milkboy.com').update({ email_verified: true });

    const loginRes = await authService.login(
      'producer@milkboy.com',
      'Password@123!',
      '127.0.0.1',
      'test-agent',
    );
    userToken = loginRes.tokens!.accessToken;
  });

  afterAll(async () => {
    try {
      if (fs.existsSync('./data/milkboy_ai_test.sqlite')) {
        fs.unlinkSync('./data/milkboy_ai_test.sqlite');
      }
    } catch {
      // ignore
    }
  });

  describe('Model Metadata Endpoints', () => {
    it('should return model status details', async () => {
      const res = await request(app)
        .get('/api/v1/ai/model-status')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.modelName).toBe('MilkQualityCNN');
    });

    it('should list all model versions', async () => {
      const res = await request(app)
        .get('/api/v1/ai/model-versions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should check model health successfully', async () => {
      const res = await request(app)
        .get('/api/v1/ai/model-health')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.fallbackModel.status).toBe('up');
    });

    it('should get confidence score thresholds', async () => {
      const res = await request(app)
        .get('/api/v1/ai/confidence-score')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.minimumThresholds).toBeDefined();
    });

    it('should get prediction explanations', async () => {
      const res = await request(app)
        .get('/api/v1/ai/prediction-explanation')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.labels).toBeDefined();
    });
  });
});
