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
  '/export/csv',
  requirePermission('reports', 'read'),
  reportsController.exportCsv.bind(reportsController),
);

router.get(
  '/export/excel',
  requirePermission('reports', 'read'),
  reportsController.exportExcel.bind(reportsController),
);

router.get(
  '/export',
  requirePermission('reports', 'read'),
  reportsController.export.bind(reportsController),
);

router.get('/verify/:id', reportsController.verifyReport.bind(reportsController));

router.get(
  '/:id/preview',
  requirePermission('reports', 'read'),
  reportsController.previewReport.bind(reportsController),
);

router.post(
  '/:id/share',
  requirePermission('reports', 'read'),
  reportsController.shareReport.bind(reportsController),
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

router.get(
  '/',
  requirePermission('reports', 'read'),
  reportsController.list.bind(reportsController),
);

export { router as reportRoutes };
