/**
 * @module utils/response
 * Standardized API response helpers.
 */

import type { Response } from 'express';
import type { ApiResponse, ApiErrorResponse, ResponseMeta } from '@milkboy/shared';

/**
 * Send a successful API response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
  meta?: ResponseMeta,
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta }),
  };
  res.status(statusCode).json(response);
}

/**
 * Send an error API response.
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, string[]>,
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  res.status(statusCode).json(response);
}

/**
 * Send a created response (201).
 */
export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, 201, message);
}

/**
 * Send a no-content response (204).
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}
