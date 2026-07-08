/**
 * @module middleware/rateLimiter
 * Rate limiting middleware for API protection.
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '@milkboy/shared';
import { sendError } from '../utils/response.js';

/**
 * General API rate limiter.
 */
export const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'SYS_006', 'Too many requests. Please try again later.');
  },
});

/**
 * Strict rate limiter for authentication endpoints.
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'SYS_006', 'Too many authentication attempts. Please wait 15 minutes.');
  },
});

/**
 * Rate limiter for file uploads.
 */
export const uploadLimiter = rateLimit({
  windowMs: RATE_LIMITS.UPLOAD.windowMs,
  max: RATE_LIMITS.UPLOAD.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'SYS_006', 'Too many uploads. Please try again later.');
  },
});

/**
 * Rate limiter for AI inference requests.
 */
export const inferenceLimiter = rateLimit({
  windowMs: RATE_LIMITS.AI_INFERENCE.windowMs,
  max: RATE_LIMITS.AI_INFERENCE.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'SYS_006', 'AI processing limit reached. Please try again later.');
  },
});
