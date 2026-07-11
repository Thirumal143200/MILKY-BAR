/**
 * @module app
 * Express application setup with all middleware and route mounting.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { scanRoutes } from './modules/scans/scans.routes.js';
import { reportRoutes } from './modules/reports/reports.routes.js';
import { userRoutes } from './modules/users/users.routes.js';
import { batchRoutes } from './modules/batches/batches.routes.js';
import { notificationRoutes } from './modules/notifications/notifications.routes.js';
import { feedbackRoutes } from './modules/feedback/feedback.routes.js';
import { labRoutes } from './modules/lab/lab.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { sendSuccess } from './utils/response.js';

const app = express();

// ─── Security Middleware ──────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: config.isProd ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

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
app.use(`${apiPrefix}/reports`, reportRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/batches`, batchRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/feedback`, feedbackRoutes);
app.use(`${apiPrefix}/lab`, labRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);

app.get(`${apiPrefix}/openapi.yaml`, (_req, res) => {
  const filePath = path.resolve('OPENAPI_SPEC.yaml');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/yaml');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Spec not found.');
  }
});

app.get(`${apiPrefix}/docs`, (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>MilkBoy API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      <style>
        html { box-sizing: border-box; overflow: -inherit; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '${apiPrefix}/openapi.yaml',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
            ],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `);
});

// ─── Static Files (uploads) ──────────────────────────────
app.use('/uploads', express.static(config.storage.localPath));

// ─── 404 Handler ──────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

export { app };
