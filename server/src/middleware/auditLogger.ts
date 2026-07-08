/**
 * @module middleware/auditLogger
 * Audit logging middleware — records user actions for compliance and security.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import { db } from '../database/connection.js';
import { generateId } from '../utils/crypto.js';
import { createModuleLogger } from '../utils/logger.js';
import type { AuditAction } from '@milkboy/shared';

const log = createModuleLogger('audit');

/**
 * Record an audit log entry.
 */
export async function recordAuditLog(
  userId: string | null,
  userEmail: string | null,
  action: AuditAction,
  resource: string,
  resourceId: string | null,
  details: Record<string, unknown> | null,
  ipAddress: string,
  userAgent: string,
): Promise<void> {
  try {
    await db('audit_logs').insert({
      id: generateId(),
      user_id: userId,
      user_email: userEmail,
      action,
      resource,
      resource_id: resourceId,
      details: details ? JSON.stringify(details) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    // Audit logging should never break the request flow
    log.error('Failed to record audit log', { error, action, resource });
  }
}

/**
 * Middleware that automatically logs specific HTTP methods.
 * Useful for POST/PUT/PATCH/DELETE routes.
 */
export function auditMiddleware(action: AuditAction, resource: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Record after response is sent
    res.on('finish', () => {
      if (res.statusCode < 400) {
        const resourceId = req.params['id'] ?? null;
        void recordAuditLog(
          req.user?.id ?? null,
          req.user?.email ?? null,
          action,
          resource,
          resourceId,
          { method: req.method, path: req.path, statusCode: res.statusCode },
          req.ip ?? 'unknown',
          req.get('user-agent') ?? 'unknown',
        );
      }
    });
    next();
  };
}
