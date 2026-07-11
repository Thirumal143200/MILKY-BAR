/**
 * @module modules/lab/lab.routes
 * Laboratory validation route definitions.
 */

import { Router } from 'express';
import { labController } from './lab.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditMiddleware } from '../../middleware/auditLogger.js';

const router = Router();

router.use(authenticate);

router.get(
  '/pending',
  requirePermission('lab_validations', 'read'),
  labController.getPending.bind(labController),
);

router.get(
  '/compare',
  requirePermission('lab_validations', 'read'),
  labController.compare.bind(labController),
);

router.get(
  '/reports',
  requirePermission('lab_validations', 'read'),
  labController.reports.bind(labController),
);

router.post(
  '/validate/:scanId/approve',
  requirePermission('lab_validations', 'create'),
  auditMiddleware('lab_validate', 'lab_validations'),
  labController.approve.bind(labController),
);

router.post(
  '/validate/:scanId/reject',
  requirePermission('lab_validations', 'create'),
  auditMiddleware('lab_validate', 'lab_validations'),
  labController.reject.bind(labController),
);

router.post(
  '/validate/:scanId',
  requirePermission('lab_validations', 'create'),
  auditMiddleware('lab_validate', 'lab_validations'),
  labController.validate.bind(labController),
);

router.get(
  '/history',
  requirePermission('lab_validations', 'read'),
  labController.getHistory.bind(labController),
);

export { router as labRoutes };
