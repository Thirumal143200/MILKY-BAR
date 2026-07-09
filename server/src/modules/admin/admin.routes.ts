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
router.patch(
  '/users/:id',
  requirePermission('users', 'update'),
  auditMiddleware('user_update', 'users'),
  adminController.updateUser.bind(adminController),
);

// Audit Logs
router.get(
  '/audit-logs',
  requirePermission('audit_logs', 'read'),
  adminController.getAuditLogs.bind(adminController),
);

// Analytics & System Health
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
