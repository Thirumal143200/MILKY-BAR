/**
 * @module index
 * Server entry point — starts the Express server and initializes services.
 */

import { app } from './app.js';
import { config } from './config/env.js';
import { testConnection } from './database/connection.js';
import { inferenceService } from './services/ai/inference.service.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('Starting MilkBoy server...');
  logger.info(`Environment: ${config.nodeEnv}`);

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.error('Failed to connect to database. Exiting.');
    process.exit(1);
  }

  // Initialize AI inference service
  try {
    await inferenceService.initialize();
    logger.info('AI inference service initialized');
  } catch (error) {
    logger.warn('AI inference service failed to initialize — will use fallback', { error });
  }

  // Start HTTP server
  const server = app.listen(config.port, () => {
    logger.info(`🥛 MilkBoy API running on http://localhost:${config.port}`);
    logger.info(`📡 API prefix: /api/${config.apiVersion}`);
    logger.info(`❤️  Health check: http://localhost:${config.port}/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise: String(promise) });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error });
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
