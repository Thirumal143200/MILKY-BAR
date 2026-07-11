import './setup-scans-env.js';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import { config } from '../../../config/env.js';
import { app } from '../../../app.js';
import { db } from '../../../database/connection.js';
import { up, down } from '../../../database/migrations/001_initial_schema.js';
import { authService } from '../../auth/auth.service.js';
import sharp from 'sharp';

describe('Scans & ML Integration Tests (Real DB)', () => {
  let producerToken: string;
  let scanId: string;
  let reportId: string;
  let testImageBuffer: Buffer;

  beforeAll(async () => {
    // Generate a valid 200x200 JPEG buffer dynamically
    testImageBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 200, g: 200, b: 200 },
      },
    })
      .jpeg()
      .toBuffer();

    // Reset schema to ensure isolation
    await down(db);
    // Run schema migrations
    await up(db);

    // Seed roles and models
    await db('roles').insert([
      { id: 'role-producer', name: 'producer', display_name: 'Producer' },
      { id: 'role-consumer', name: 'consumer', display_name: 'Consumer' },
    ]);

    await db('ai_models').insert({
      id: 'model-123',
      name: 'milk-quality-classifier',
      type: 'classification',
    });

    await db('ai_model_versions').insert({
      id: 'version-123',
      model_id: 'model-123',
      version: '1.0.0',
      file_path: 'models/milk-quality-v1/best_model.torchscript.pt',
      is_active: true,
      is_default: true,
    });

    // Seed permissions
    await db('permissions').insert([
      { id: 'perm-scans-create', name: 'scans:create', resource: 'scans', action: 'create' },
      { id: 'perm-scans-read', name: 'scans:read', resource: 'scans', action: 'read' },
      { id: 'perm-images-create', name: 'images:create', resource: 'images', action: 'create' },
      { id: 'perm-reports-create', name: 'reports:create', resource: 'reports', action: 'create' },
      { id: 'perm-reports-read', name: 'reports:read', resource: 'reports', action: 'read' },
    ]);

    await db('role_permissions').insert([
      { role_id: 'role-producer', permission_id: 'perm-scans-create' },
      { role_id: 'role-producer', permission_id: 'perm-scans-read' },
      { role_id: 'role-producer', permission_id: 'perm-images-create' },
      { role_id: 'role-producer', permission_id: 'perm-reports-create' },
      { role_id: 'role-producer', permission_id: 'perm-reports-read' },
    ]);

    // Register and login producer
    await authService.register({
      email: 'producer@scans.com',
      password: 'Password@123!',
      firstName: 'Producer',
      lastName: 'Joe',
      role: 'producer',
    });
    await db('users').where('email', 'producer@scans.com').update({ email_verified: true });

    const loginRes = await authService.login(
      'producer@scans.com',
      'Password@123!',
      '127.0.0.1',
      'test-agent',
    );
    producerToken = loginRes.tokens!.accessToken;
  });

  afterAll(async () => {
    // Clean up created report files and uploads directory
    try {
      if (fs.existsSync(config.storage.localPath)) {
        fs.rmSync(config.storage.localPath, { recursive: true, force: true });
      }
    } catch {
      // ignore clean up errors
    }
    try {
      if (fs.existsSync('./data/milkboy_scans_test.sqlite')) {
        fs.unlinkSync('./data/milkboy_scans_test.sqlite');
      }
    } catch {
      // ignore
    }
  });

  it('1. should create a new scan successfully', async () => {
    const res = await request(app)
      .post('/api/v1/scans')
      .set('Authorization', `Bearer ${producerToken}`)
      .send({
        title: 'Producer Milk Batch A',
        notes: 'Testing scans integration',
        location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe('Producer Milk Batch A');
    scanId = res.body.data.id;
  });

  it('2. should upload and preprocess a scan image successfully', async () => {
    const res = await request(app)
      .post(`/api/v1/scans/${scanId}/images`)
      .set('Authorization', `Bearer ${producerToken}`)
      .attach('image', testImageBuffer, 'milk_sample.jpg');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.imageId).toBeDefined();
    expect(res.body.data.qualityCheck).toBeDefined();

    const imageId = res.body.data.imageId;

    // Force the quality check to pass in database to bypass blur/lighting heuristic rejection in test
    await db('image_quality_checks')
      .where('image_id', imageId)
      .update({ passed: true, overall_score: 0.95 });
  });

  it('3. should perform AI prediction runs successfully', async () => {
    const res = await request(app)
      .post(`/api/v1/scans/${scanId}/analyze`)
      .set('Authorization', `Bearer ${producerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].qualityLabel).toBeDefined();
    expect(res.body.data[0].confidence).toBeDefined();

    // Verify scan status updated to completed in DB
    const scan = await db('scans').where('id', scanId).first();
    expect(scan.status).toBe('completed');
  });

  it('4. should generate an A4 PDF report successfully', async () => {
    const res = await request(app)
      .post(`/api/v1/reports/generate/${scanId}`)
      .set('Authorization', `Bearer ${producerToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reportId).toBeDefined();
    expect(res.body.data.filePath).toBeDefined();
    expect(res.body.data.qrCodePath).toBeDefined();
    reportId = res.body.data.reportId;
  });

  it('5. should fetch report details successfully', async () => {
    const res = await request(app)
      .get(`/api/v1/reports/${reportId}`)
      .set('Authorization', `Bearer ${producerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(reportId);
    expect(res.body.data.scanId).toBe(scanId);
    expect(res.body.data.qrCodeUrl).toBeDefined();
  });

  it('6. should download the compiled PDF report successfully', async () => {
    const res = await request(app)
      .get(`/api/v1/reports/${reportId}/download`)
      .set('Authorization', `Bearer ${producerToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('application/pdf');
  });
});
