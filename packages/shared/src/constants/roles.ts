/**
 * @module @milkboy/shared/constants
 * Role definitions and permission constants for the RBAC system.
 */

import type { UserRole } from '../types/user.types.js';

/** All available roles ordered by privilege level */
export const ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  PRODUCER: 'producer' as const,
  CONSUMER: 'consumer' as const,
  LAB_STAFF: 'lab_staff' as const,
} as const;

/** Role hierarchy (higher index = higher privilege) */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  consumer: 0,
  producer: 1,
  lab_staff: 2,
  admin: 3,
  super_admin: 4,
};

/** Role display names */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: 'Super Administrator',
  admin: 'Administrator',
  producer: 'Producer',
  consumer: 'Consumer',
  lab_staff: 'Laboratory Staff',
};

/** Default role for new registrations */
export const DEFAULT_ROLE: UserRole = 'consumer';

/** All permission resources */
export const RESOURCES = {
  USERS: 'users',
  SCANS: 'scans',
  IMAGES: 'images',
  PREDICTIONS: 'predictions',
  REPORTS: 'reports',
  BATCHES: 'batches',
  AUDIT_LOGS: 'audit_logs',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  FEATURE_FLAGS: 'feature_flags',
  AI_MODELS: 'ai_models',
  BACKUPS: 'backups',
  FEEDBACK: 'feedback',
  LAB_VALIDATIONS: 'lab_validations',
  ANALYTICS: 'analytics',
} as const;

/** Permission actions */
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

/**
 * Role-based permission matrix.
 * Each role maps to an array of "resource:action" permission strings.
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*:*'], // Full access
  admin: [
    'users:read',
    'users:update',
    'scans:read',
    'scans:manage',
    'images:read',
    'predictions:read',
    'reports:read',
    'reports:create',
    'batches:read',
    'audit_logs:read',
    'notifications:manage',
    'settings:read',
    'settings:update',
    'feature_flags:read',
    'ai_models:read',
    'backups:read',
    'feedback:read',
    'feedback:update',
    'lab_validations:read',
    'analytics:read',
  ],
  producer: [
    'scans:create',
    'scans:read',
    'scans:delete',
    'images:create',
    'images:read',
    'predictions:read',
    'reports:read',
    'reports:create',
    'batches:create',
    'batches:read',
    'notifications:read',
    'notifications:update',
    'notifications:delete',
    'feedback:create',
  ],
  consumer: [
    'scans:create',
    'scans:read',
    'images:create',
    'images:read',
    'predictions:read',
    'reports:read',
    'notifications:read',
    'notifications:update',
    'notifications:delete',
    'feedback:create',
  ],
  lab_staff: [
    'scans:read',
    'images:read',
    'predictions:read',
    'reports:read',
    'reports:create',
    'lab_validations:create',
    'lab_validations:read',
    'notifications:read',
    'notifications:update',
    'notifications:delete',
    'feedback:create',
  ],
};

/**
 * Check if a role has a specific permission.
 * @param role - The user's role
 * @param resource - The resource to check
 * @param action - The action to check
 * @returns true if the role has the permission
 */
export function hasPermission(role: UserRole, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  return permissions.some((perm) => {
    if (perm === '*:*') return true;
    const [permResource, permAction] = perm.split(':');
    return (
      (permResource === resource || permResource === '*') &&
      (permAction === action || permAction === '*' || permAction === 'manage')
    );
  });
}

/**
 * Check if a role is at or above a minimum level.
 * @param role - The role to check
 * @param minimumRole - The minimum required role
 */
export function isRoleAtLeast(role: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
}
