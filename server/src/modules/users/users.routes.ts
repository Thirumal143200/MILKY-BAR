/**
 * @module modules/users/users.routes
 * User profile, session, and device route definitions.
 */

import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { auditMiddleware } from '../../middleware/auditLogger.js';

const router = Router();

router.use(authenticate);

// Profile
router.get('/me', usersController.getProfile.bind(usersController));
router.patch(
  '/me',
  auditMiddleware('user_update', 'users'),
  usersController.updateProfile.bind(usersController),
);
router.put(
  '/profile',
  auditMiddleware('user_update', 'users'),
  usersController.updateProfile.bind(usersController),
);
router.put(
  '/change-password',
  auditMiddleware('user_update', 'users'),
  usersController.changePassword.bind(usersController),
);


// Sessions
router.get('/me/sessions', usersController.listSessions.bind(usersController));
router.delete(
  '/me/sessions/:id',
  auditMiddleware('user_update', 'users'),
  usersController.revokeSession.bind(usersController),
);

// Devices
router.get('/me/devices', usersController.listDevices.bind(usersController));
router.post(
  '/me/devices',
  auditMiddleware('user_update', 'users'),
  usersController.registerDevice.bind(usersController),
);
router.delete(
  '/me/devices/:id',
  auditMiddleware('user_update', 'users'),
  usersController.removeDevice.bind(usersController),
);

export { router as userRoutes };
