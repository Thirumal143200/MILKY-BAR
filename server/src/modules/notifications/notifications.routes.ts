/**
 * @module modules/notifications/notifications.routes
 * Enterprise notification route definitions.
 */

import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Preferences routes
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

// Device Push Token registration
router.post(
  '/tokens',
  requirePermission('notifications', 'update'),
  notificationsController.registerPushToken.bind(notificationsController),
);

// Unread notifications endpoint
router.get(
  '/unread',
  requirePermission('notifications', 'read'),
  notificationsController.getUnread.bind(notificationsController),
);

// Notification List
router.get(
  '/',
  requirePermission('notifications', 'read'),
  notificationsController.list.bind(notificationsController),
);

// Mark single as read (PUT & PATCH)
router.put(
  '/read',
  requirePermission('notifications', 'update'),
  notificationsController.markAsRead.bind(notificationsController),
);

router.put(
  '/:id/read',
  requirePermission('notifications', 'update'),
  notificationsController.markAsRead.bind(notificationsController),
);

router.patch(
  '/:id/read',
  requirePermission('notifications', 'update'),
  notificationsController.markAsRead.bind(notificationsController),
);

// Mark all as read (PUT & POST)
router.put(
  '/read-all',
  requirePermission('notifications', 'update'),
  notificationsController.markAllAsRead.bind(notificationsController),
);

router.post(
  '/read-all',
  requirePermission('notifications', 'update'),
  notificationsController.markAllAsRead.bind(notificationsController),
);

// Delete single notification
router.delete(
  '/:id',
  requirePermission('notifications', 'delete'),
  notificationsController.delete.bind(notificationsController),
);

// Delete all notifications
router.delete(
  '/',
  requirePermission('notifications', 'delete'),
  notificationsController.deleteAll.bind(notificationsController),
);

export { router as notificationRoutes };
