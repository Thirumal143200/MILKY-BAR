/**
 * @module middleware/auth
 * JWT authentication middleware.
 * Extracts and verifies the access token from the Authorization header.
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { db } from '../database/connection.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_CODES } from '@milkboy/shared';
import { createModuleLogger } from '../utils/logger.js';

const log = createModuleLogger('auth-middleware');

/** Extended request with authenticated user */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    roleId: string;
    sessionId: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  roleId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

/**
 * Middleware that requires a valid JWT access token.
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized(ERROR_CODES.AUTH_TOKEN_INVALID, 'No authentication token provided.');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      roleId: decoded.roleId,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized(ERROR_CODES.AUTH_TOKEN_EXPIRED, 'Authentication token has expired.'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized(ERROR_CODES.AUTH_TOKEN_INVALID, 'Invalid authentication token.'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication — sets req.user if token is present but doesn't fail.
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      roleId: decoded.roleId,
      sessionId: decoded.sessionId,
    };

    next();
  } catch {
    // Token invalid but auth is optional — continue without user
    next();
  }
}
