/**
 * @module modules/feedback/feedback.routes
 * Feedback route definitions.
 */

import { Router } from 'express';
import { feedbackController } from './feedback.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditMiddleware } from '../../middleware/auditLogger.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requirePermission('feedback', 'create'),
  auditMiddleware('feedback_create', 'feedback'),
  feedbackController.create.bind(feedbackController),
);

router.get(
  '/',
  requirePermission('feedback', 'read'),
  feedbackController.list.bind(feedbackController),
);

router.patch(
  '/:id/status',
  requirePermission('feedback', 'update'),
  auditMiddleware('feedback_update', 'feedback'),
  feedbackController.updateStatus.bind(feedbackController),
);

export { router as feedbackRoutes };
