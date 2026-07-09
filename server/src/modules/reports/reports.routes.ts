/**
 * @module modules/reports/reports.routes
 * Report route definitions.
 */

import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditMiddleware } from '../../middleware/auditLogger.js';

const router = Router();
router.use(authenticate);

router.post(
  '/generate/:scanId',
  requirePermission('reports', 'create'),
  auditMiddleware('report_generate', 'reports'),
  reportsController.generate.bind(reportsController),
);

router.get(
  '/:id',
  requirePermission('reports', 'read'),
  reportsController.getById.bind(reportsController),
);
router.get(
  '/:id/download',
  requirePermission('reports', 'read'),
  auditMiddleware('report_download', 'reports'),
  reportsController.download.bind(reportsController),
);
router.get(
  '/:id/qr',
  requirePermission('reports', 'read'),
  reportsController.getQrCode.bind(reportsController),
);

export { router as reportRoutes };
