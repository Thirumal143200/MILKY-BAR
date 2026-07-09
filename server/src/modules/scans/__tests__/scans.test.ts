import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../../app.js';
import { scansService } from '../scans.service.js';
import { config } from '../../../config/env.js';

// Mock the scans service
vi.mock('../scans.service.js', () => {
  return {
    scansService: {
      create: vi.fn(),
      listByUser: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      addImage: vi.fn(),
      analyze: vi.fn(),
    },
  };
});

// Mock database connection test
vi.mock('../../../database/connection.js', () => {
  return {
    db: vi.fn(),
    testConnection: vi.fn().mockResolvedValue(true),
    closeConnection: vi.fn().mockResolvedValue(undefined),
  };
});

const request = supertest(app);

describe('Scans Endpoints', () => {
  let token: string;
  const scanId = 'scan-123';
  const userId = 'user-123';

  beforeAll(() => {
    // Generate a valid mock JWT token signed with the test secret
    token = jwt.sign(
      {
        sub: userId,
        email: 'producer@test.com',
        role: 'producer',
        roleId: 'role-producer',
        sessionId: 'session-123',
      },
      config.jwt.secret,
      { expiresIn: '1h' },
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access without token', async () => {
    const res = await request.get('/api/v1/scans');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should create a scan', async () => {
    const mockScan = {
      id: scanId,
      userId,
      status: 'created',
      title: 'Test Scan',
      notes: 'Test Notes',
      imageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(scansService.create).mockResolvedValue(mockScan);

    const res = await request.post('/api/v1/scans').set('Authorization', `Bearer ${token}`).send({
      title: 'Test Scan',
      notes: 'Test Notes',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(scanId);
    expect(scansService.create).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        title: 'Test Scan',
        notes: 'Test Notes',
      }),
    );
  });

  it('should list scans for user', async () => {
    const mockListResult = {
      data: [
        {
          id: scanId,
          userId,
          status: 'completed',
          title: 'Test Scan',
          imageCount: 1,
          createdAt: new Date().toISOString(),
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };

    vi.mocked(scansService.listByUser).mockResolvedValue(mockListResult);

    const res = await request.get('/api/v1/scans').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('should get scan by ID', async () => {
    const mockScanDetails = {
      scan: {
        id: scanId,
        userId,
        status: 'completed',
        title: 'Test Scan',
        imageCount: 1,
      },
      images: [],
      qualityChecks: [],
      predictions: [],
      report: null,
    };

    vi.mocked(scansService.getById).mockResolvedValue(mockScanDetails);

    const res = await request
      .get(`/api/v1/scans/${scanId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scan.id).toBe(scanId);
  });
});
