/**
 * @module modules/batches/batches.routes
 * Batch route definitions.
 */

import { Router } from 'express';
import { batchesController } from './batches.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditMiddleware } from '../../middleware/auditLogger.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requirePermission('batches', 'create'),
  auditMiddleware('batch_create', 'batches'),
  batchesController.create.bind(batchesController),
);

router.get(
  '/',
  requirePermission('batches', 'read'),
  batchesController.list.bind(batchesController),
);

router.get(
  '/:id',
  requirePermission('batches', 'read'),
  batchesController.getById.bind(batchesController),
);

router.post(
  '/:id/scans',
  requirePermission('batches', 'update'),
  auditMiddleware('batch_create', 'batches'), // reuse batch_create action for modification log
  batchesController.addScans.bind(batchesController),
);

router.post(
  '/:id/analyze',
  requirePermission('batches', 'update'),
  auditMiddleware('batch_analyze', 'batches'),
  batchesController.analyze.bind(batchesController),
);

router.get(
  '/:id/results',
  requirePermission('batches', 'read'),
  batchesController.getResults.bind(batchesController),
);

export { router as batchRoutes };
