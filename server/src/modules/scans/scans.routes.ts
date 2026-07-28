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
import { imageUpload } from '../../middleware/upload.js';
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

router.post(
  '/batch-sync',
  requirePermission('scans', 'create'),
  auditMiddleware('scan_create', 'scans'),
  scansController.batchSync.bind(scansController),
);

router.get('/', requirePermission('scans', 'read'), scansController.list.bind(scansController));

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

router.post(
  '/:id/images',
  requirePermission('images', 'create'),
  imageUpload.single('image'),
  auditMiddleware('image_upload', 'images'),
  scansController.uploadImage.bind(scansController),
);

router.post(
  '/:id/analyze',
  requirePermission('scans', 'create'),
  auditMiddleware('prediction_run', 'predictions'),
  scansController.analyze.bind(scansController),
);

router.get(
  '/:id/prediction',
  requirePermission('scans', 'read'),
  scansController.getPrediction.bind(scansController),
);

router.post(
  '/:id/retry',
  requirePermission('scans', 'create'),
  auditMiddleware('prediction_run', 'predictions'),
  scansController.retry.bind(scansController),
);

export { router as scanRoutes };
