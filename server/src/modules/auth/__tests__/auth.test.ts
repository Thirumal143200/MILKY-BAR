import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';
import { app } from '../../../app.js';
import { authService } from '../auth.service.js';

// Mock the auth service
vi.mock('../auth.service.js', () => {
  return {
    authService: {
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
    },
  };
});

// Mock database connection test to avoid hitting db during boot in tests
vi.mock('../../../database/connection.js', () => {
  return {
    db: vi.fn(),
    testConnection: vi.fn().mockResolvedValue(true),
    closeConnection: vi.fn().mockResolvedValue(undefined),
  };
});

const request = supertest(app);

describe('Auth Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fail registration with invalid email', async () => {
    const res = await request.post('/api/v1/auth/register').send({
      email: 'invalid-email',
      password: 'Password@123!',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should register a new consumer successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'consumer@test.com',
      firstName: 'Consumer',
      lastName: 'Test',
      role: 'consumer',
    };

    vi.mocked(authService.register).mockResolvedValue(mockUser);

    const res = await request.post('/api/v1/auth/register').send({
      email: 'consumer@test.com',
      password: 'Password@123!',
      firstName: 'Consumer',
      lastName: 'Test',
      role: 'consumer',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('consumer@test.com');
    expect(authService.register).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'consumer@test.com',
        firstName: 'Consumer',
        lastName: 'Test',
        role: 'consumer',
      }),
    );
  });

  it('should log in successfully', async () => {
    const mockLoginResult = {
      requiresMfa: false,
      user: {
        id: 'user-123',
        email: 'consumer@test.com',
        firstName: 'Consumer',
        lastName: 'Test',
        role: 'consumer',
        avatarUrl: null,
        phone: null,
        language: 'en',
        theme: 'system',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900,
      },
    };

    vi.mocked(authService.login).mockResolvedValue(mockLoginResult);

    const res = await request.post('/api/v1/auth/login').send({
      email: 'consumer@test.com',
      password: 'Password@123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBe('mock-access-token');
  });
});
