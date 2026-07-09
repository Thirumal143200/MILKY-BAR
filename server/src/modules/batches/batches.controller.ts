/**
 * @module modules/batches/batches.controller
 * Batch route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { batchesService } from './batches.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { paginationSchema, createBatchSchema, addScansToBatchSchema } from '@milkboy/shared';

export class BatchesController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createBatchSchema.parse(req.body);
      const batch = await batchesService.create(req.user!.id, validated);
      sendCreated(res, batch, 'Batch created successfully.');
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const status = req.query.status as string | undefined;
      const result = await batchesService.listByUser(req.user!.id, { ...params, status });
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await batchesService.getById(String(req.params.id), req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async addScans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = addScansToBatchSchema.parse(req.body);
      const result = await batchesService.addScans(
        String(req.params.id),
        req.user!.id,
        validated.scanIds,
      );
      sendSuccess(res, result, 200, 'Scans added to batch successfully.');
    } catch (error) {
      next(error);
    }
  }

  async analyze(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await batchesService.analyzeBatch(String(req.params.id), req.user!.id);
      sendSuccess(res, result, 200, 'Batch processing started.');
    } catch (error) {
      next(error);
    }
  }
}

export const batchesController = new BatchesController();
