/**
 * @module middleware/rbac
 * Role-Based Access Control middleware.
 * Checks if the authenticated user has the required role or permission.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import type { UserRole } from '@milkboy/shared';
import { hasPermission, isRoleAtLeast, ERROR_CODES } from '@milkboy/shared';
import { AppError } from '../utils/AppError.js';

/**
 * Require the user to have one of the specified roles.
 * @example router.get('/admin', authenticate, requireRole('admin', 'super_admin'), handler)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        AppError.unauthorized(ERROR_CODES.AUTH_TOKEN_INVALID, 'Authentication required.'),
      );
    }

    const userRole = req.user.role as UserRole;
    if (!roles.includes(userRole)) {
      return next(
        AppError.forbidden(
          ERROR_CODES.AUTHZ_INSUFFICIENT_ROLE,
          `Access denied. Required role: ${roles.join(' or ')}.`,
        ),
      );
    }

    next();
  };
}

/**
 * Require the user's role to be at or above a minimum level.
 * @example router.get('/reports', authenticate, requireMinRole('producer'), handler)
 */
export function requireMinRole(minimumRole: UserRole) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        AppError.unauthorized(ERROR_CODES.AUTH_TOKEN_INVALID, 'Authentication required.'),
      );
    }

    const userRole = req.user.role as UserRole;
    if (!isRoleAtLeast(userRole, minimumRole)) {
      return next(
        AppError.forbidden(
          ERROR_CODES.AUTHZ_INSUFFICIENT_ROLE,
          'You do not have sufficient privileges for this action.',
        ),
      );
    }

    next();
  };
}

/**
 * Require the user to have a specific permission (resource:action).
 * @example router.post('/scans', authenticate, requirePermission('scans', 'create'), handler)
 */
export function requirePermission(resource: string, action: string) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        AppError.unauthorized(ERROR_CODES.AUTH_TOKEN_INVALID, 'Authentication required.'),
      );
    }

    const userRole = req.user.role as UserRole;
    if (!hasPermission(userRole, resource, action)) {
      return next(
        AppError.forbidden(
          ERROR_CODES.AUTHZ_FORBIDDEN,
          `You do not have permission to ${action} ${resource}.`,
        ),
      );
    }

    next();
  };
}

/**
 * Require the user to own the resource or be an admin.
 * Checks if req.params contains a userId that matches the authenticated user.
 * @param paramName - The request parameter containing the resource owner's ID
 */
export function requireOwnerOrAdmin(paramName = 'userId') {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        AppError.unauthorized(ERROR_CODES.AUTH_TOKEN_INVALID, 'Authentication required.'),
      );
    }

    const resourceOwnerId = req.params[paramName];
    const isOwner = resourceOwnerId === req.user.id;
    const isAdmin = isRoleAtLeast(req.user.role as UserRole, 'admin');

    if (!isOwner && !isAdmin) {
      return next(
        AppError.forbidden(
          ERROR_CODES.AUTHZ_RESOURCE_NOT_OWNED,
          'You can only access your own resources.',
        ),
      );
    }

    next();
  };
}
