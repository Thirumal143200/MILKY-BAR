/**
 * @module modules/scans/scans.routes
 * Scan route definitions.
 */

import { Router } from 'express';
import { scansController } from './scans.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validator.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditMiddleware } from '../../middleware/auditLogger.js';
import { createScanSchema } from '@milkboy/shared';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requirePermission('scans', 'create'),
  validate(createScanSchema),
  auditMiddleware('scan_create', 'scans'),
  scansController.create.bind(scansController),
);

router.get(
  '/',
  requirePermission('scans', 'read'),
  scansController.list.bind(scansController),
);

router.get(
  '/:id',
  requirePermission('scans', 'read'),
  scansController.getById.bind(scansController),
);

router.delete(
  '/:id',
  requirePermission('scans', 'delete'),
  auditMiddleware('scan_delete', 'scans'),
  scansController.delete.bind(scansController),
);

export { router as scanRoutes };
