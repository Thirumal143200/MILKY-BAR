/**
 * @module middleware/errorHandler
 * Global error handling middleware.
 * Catches all errors and returns standardized API error responses.
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';
import { createModuleLogger } from '../utils/logger.js';
import { config } from '../config/env.js';

const log = createModuleLogger('error-handler');

/**
 * Global error handler — must be the last middleware registered.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Already sent response
  if (res.headersSent) return;

  if (err instanceof AppError) {
    // Operational errors (expected)
    if (err.statusCode >= 500) {
      log.error(err.message, {
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        stack: err.stack,
      });
    } else {
      log.warn(err.message, {
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      });
    }

    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Unexpected errors
  log.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  sendError(
    res,
    500,
    'SYS_001',
    config.isProd ? 'An unexpected error occurred.' : err.message,
  );
}

/**
 * Handle 404 Not Found for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, 'RES_001', `Route ${req.method} ${req.path} not found.`);
}
