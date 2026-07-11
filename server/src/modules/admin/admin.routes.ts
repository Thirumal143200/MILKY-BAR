/**
 * @module modules/admin/admin.routes
 * Administration route definitions.
 */

import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission, requireRole } from '../../middleware/rbac.js';
import { auditMiddleware } from '../../middleware/auditLogger.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));

// User Management
router.get(
  '/users',
  requirePermission('users', 'read'),
  adminController.getUsers.bind(adminController),
);
router.post(
  '/users',
  requirePermission('users', 'create'),
  auditMiddleware('user_create', 'users'),
  adminController.createUser.bind(adminController),
);
router.get(
  '/users/:id',
  requirePermission('users', 'read'),
  adminController.getUserById.bind(adminController),
);
router.patch(
  '/users/:id',
  requirePermission('users', 'update'),
  auditMiddleware('user_update', 'users'),
  adminController.updateUser.bind(adminController),
);
router.delete(
  '/users/:id',
  requirePermission('users', 'delete'),
  auditMiddleware('user_delete', 'users'),
  adminController.deleteUser.bind(adminController),
);
router.post(
  '/users/:id/deactivate',
  requirePermission('users', 'update'),
  auditMiddleware('user_update', 'users'),
  adminController.deactivateUser.bind(adminController),
);
router.post(
  '/users/:id/reactivate',
  requirePermission('users', 'update'),
  auditMiddleware('user_update', 'users'),
  adminController.reactivateUser.bind(adminController),
);

// Roles & Permissions Management
router.get(
  '/permissions',
  requirePermission('permissions', 'read'),
  adminController.listPermissions.bind(adminController),
);
router.get(
  '/roles',
  requirePermission('roles', 'read'),
  adminController.listRoles.bind(adminController),
);
router.get(
  '/roles/:id/permissions',
  requirePermission('permissions', 'read'),
  adminController.listRolePermissions.bind(adminController),
);
router.post(
  '/roles/:id/permissions',
  requirePermission('permissions', 'update'),
  auditMiddleware('role_permission_update', 'roles'),
  adminController.updateRolePermissions.bind(adminController),
);


// Audit Logs
router.get(
  '/audit-logs',
  requirePermission('audit_logs', 'read'),
  adminController.getAuditLogs.bind(adminController),
);

// Analytics & System Health
router.get(
  '/analytics/users',
  requirePermission('analytics', 'read'),
  adminController.getUserAnalytics.bind(adminController),
);
router.get(
  '/analytics/milk',
  requirePermission('analytics', 'read'),
  adminController.getMilkAnalytics.bind(adminController),
);
router.get(
  '/analytics',
  requirePermission('analytics', 'read'),
  adminController.getAnalytics.bind(adminController),
);
router.get(
  '/system/health',
  requirePermission('settings', 'read'),
  adminController.getSystemHealth.bind(adminController),
);
router.get(
  '/system/database',
  requirePermission('settings', 'read'),
  adminController.getDatabaseStatus.bind(adminController),
);
router.get(
  '/system/ai',
  requirePermission('settings', 'read'),
  adminController.getAiModelMonitoring.bind(adminController),
);

// Settings
router.get(
  '/settings',
  requirePermission('settings', 'read'),
  adminController.getSettings.bind(adminController),
);
router.put(
  '/settings',
  requirePermission('settings', 'update'),
  auditMiddleware('settings_update', 'settings'),
  adminController.updateSettings.bind(adminController),
);

// Backups
router.post(
  '/backups',
  requirePermission('backups', 'create'),
  auditMiddleware('backup_create', 'backups'),
  adminController.backup.bind(adminController),
);
router.get(
  '/backups',
  requirePermission('backups', 'read'),
  adminController.listBackups.bind(adminController),
);

export { router as adminRoutes };
