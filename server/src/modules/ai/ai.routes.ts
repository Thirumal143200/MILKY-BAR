/**
 * @module modules/ai/ai.routes
 * AI route definitions.
 */

import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { imageUpload } from '../../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.post(
  '/predict',
  requirePermission('scans', 'create'),
  imageUpload.single('image'),
  aiController.predictDirect.bind(aiController),
);

router.get(
  '/model-status',
  requirePermission('scans', 'read'),
  aiController.getActiveModelStatus.bind(aiController),
);

router.get(
  '/model-versions',
  requirePermission('scans', 'read'),
  aiController.getModelVersions.bind(aiController),
);

router.get(
  '/model-health',
  requirePermission('scans', 'read'),
  aiController.getModelHealth.bind(aiController),
);

router.get(
  '/confidence-score',
  requirePermission('scans', 'read'),
  aiController.getConfidenceScoreMetrics.bind(aiController),
);

router.get(
  '/prediction-explanation',
  requirePermission('scans', 'read'),
  aiController.getPredictionExplanation.bind(aiController),
);

router.get(
  '/preprocessing-status/:imageId',
  requirePermission('scans', 'read'),
  aiController.getImagePreprocessingStatus.bind(aiController),
);

export { router as aiRoutes };
