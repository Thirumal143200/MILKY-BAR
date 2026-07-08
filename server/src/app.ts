/**
 * @module app
 * Express application setup with all middleware and route mounting.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { scanRoutes } from './modules/scans/scans.routes.js';
import { sendSuccess } from './utils/response.js';

const app = express();

// ─── Security Middleware ──────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: config.isProd ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─── General Middleware ───────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (!config.isTest) {
  app.use(morgan(config.isDev ? 'dev' : 'combined'));
}

// Rate limiting
app.use(generalLimiter);

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ─── API Routes ───────────────────────────────────────────
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/scans`, scanRoutes);

// ─── Static Files (uploads) ──────────────────────────────
app.use('/uploads', express.static(config.storage.localPath));

// ─── 404 Handler ──────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

export { app };
