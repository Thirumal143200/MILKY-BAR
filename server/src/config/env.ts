/**
 * @module config/env
 * Environment configuration with validation and defaults.
 * All configuration flows through here — no direct process.env access elsewhere.
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function envInt(key: string, fallback: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : fallback;
}

function envBool(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  if (!value) return fallback;
  return value === 'true' || value === '1';
}

export const config = {
  // App
  nodeEnv: env('NODE_ENV', 'development'),
  port: envInt('PORT', 3001),
  apiVersion: env('API_VERSION', 'v1'),
  appName: env('APP_NAME', 'MilkBoy'),
  appUrl: env('APP_URL', 'http://localhost:3000'),
  apiUrl: env('API_URL', 'http://localhost:3001'),
  isDev: env('NODE_ENV', 'development') === 'development',
  isProd: env('NODE_ENV', 'development') === 'production',
  isTest: env('NODE_ENV', 'development') === 'test',

  // Database
  db: {
    client: (process.env.NODE_ENV === 'production'
      ? 'postgresql'
      : (process.env.DB_CLIENT ?? 'sqlite')) as 'sqlite' | 'postgresql',
    host: env('DB_HOST', 'localhost'),
    port: envInt('DB_PORT', 5432),
    name: env('DB_NAME', 'milkboy'),
    user: env('DB_USER', 'milkboy'),
    password: env('DB_PASSWORD', ''),
    sqliteFilename: env('SQLITE_FILENAME', './data/milkboy.sqlite'),
  },

  // Redis
  redis: {
    host: env('REDIS_HOST', 'localhost'),
    port: envInt('REDIS_PORT', 6379),
    password: env('REDIS_PASSWORD', ''),
    enabled: envBool('REDIS_ENABLED', false),
  },

  // JWT
  jwt: {
    secret: env('JWT_SECRET', 'dev-jwt-secret-change-in-production-please'),
    refreshSecret: env('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
    accessExpiry: env('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: env('JWT_REFRESH_EXPIRY', '7d'),
  },

  // Encryption
  encryptionKey: env('ENCRYPTION_KEY', 'dev-encryption-key-32-bytes-long!'),

  // Email
  email: {
    enabled: envBool('EMAIL_ENABLED', false),
    host: env('SMTP_HOST', 'smtp.gmail.com'),
    port: envInt('SMTP_PORT', 587),
    user: env('SMTP_USER', ''),
    password: env('SMTP_PASSWORD', ''),
    from: env('SMTP_FROM', 'MilkBoy <noreply@milkboy.app>'),
  },

  // Storage
  storage: {
    type: env('STORAGE_TYPE', 'local') as 'local' | 's3',
    localPath: env('STORAGE_LOCAL_PATH', './uploads'),
    s3: {
      bucket: env('S3_BUCKET', ''),
      region: env('S3_REGION', ''),
      accessKey: env('S3_ACCESS_KEY', ''),
      secretKey: env('S3_SECRET_KEY', ''),
      endpoint: env('S3_ENDPOINT', ''),
    },
  },

  // AI
  ai: {
    serviceUrl: env('AI_SERVICE_URL', 'http://127.0.0.1:8000'),
    modelPath: env('AI_MODEL_PATH', './ai/models/milk-quality-v1'),
    confidenceThreshold: parseFloat(env('AI_CONFIDENCE_THRESHOLD', '0.6')),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: envInt('RATE_LIMIT_WINDOW_MS', 900000),
    maxRequests: envInt('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  // Super Admin
  superAdmin: {
    email: env('SUPER_ADMIN_EMAIL', 'admin@milkboy.app'),
    password: env('SUPER_ADMIN_PASSWORD', 'SuperAdmin@123!'),
    firstName: env('SUPER_ADMIN_FIRST_NAME', 'Super'),
    lastName: env('SUPER_ADMIN_LAST_NAME', 'Admin'),
  },

  // Logging
  logging: {
    level: env('LOG_LEVEL', 'debug'),
    file: env('LOG_FILE', './logs/app.log'),
  },

  // CORS
  cors: {
    origins: env('CORS_ORIGINS', 'http://localhost:3000,http://localhost:8081').split(','),
  },
} as const;

export type Config = typeof config;
