/**
 * @module modules/notifications/notifications.routes
 * Notification route definitions.
 */

import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get(
  '/preferences',
  requirePermission('notifications', 'read'),
  notificationsController.getPreferences.bind(notificationsController),
);

router.put(
  '/preferences',
  requirePermission('notifications', 'update'),
  notificationsController.updatePreferences.bind(notificationsController),
);

router.get(
  '/',
  requirePermission('notifications', 'read'),
  notificationsController.list.bind(notificationsController),
);

router.patch(
  '/:id/read',
  requirePermission('notifications', 'update'),
  notificationsController.markAsRead.bind(notificationsController),
);

router.post(
  '/read-all',
  requirePermission('notifications', 'update'),
  notificationsController.markAllAsRead.bind(notificationsController),
);

router.delete(
  '/:id',
  requirePermission('notifications', 'delete'),
  notificationsController.delete.bind(notificationsController),
);

router.delete(
  '/',
  requirePermission('notifications', 'delete'),
  notificationsController.deleteAll.bind(notificationsController),
);

export { router as notificationRoutes };
