/**
 * @module modules/scans/scans.controller
 * Scan route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { scansService } from './scans.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response.js';
import { paginationSchema } from '@milkboy/shared';
import { AppError } from '../../utils/AppError.js';

export class ScansController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const scan = await scansService.create(req.user!.id, req.body);
      sendCreated(res, scan, 'Scan created successfully.');
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const status = req.query.status as string | undefined;
      const result = await scansService.listByUser(req.user!.id, { ...params, status });
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      const userId = isAdmin ? undefined : req.user!.id;
      const result = await scansService.getById(String(req.params.id), userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      const userId = isAdmin ? undefined : req.user!.id;
      await scansService.delete(String(req.params.id), userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw AppError.badRequest('VAL_002', 'Image file is required.');
      }
      const result = await scansService.addImage(String(req.params.id), req.user!.id, req.file);
      sendSuccess(res, result, 201, 'Image uploaded and processed successfully.');
    } catch (error) {
      next(error);
    }
  }

  async analyze(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const predictions = await scansService.analyze(String(req.params.id), req.user!.id);
      sendSuccess(res, predictions, 200, 'Scan analyzed successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getPrediction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      const userId = isAdmin ? undefined : req.user!.id;
      const predictions = await scansService.getPrediction(String(req.params.id), userId);
      sendSuccess(res, predictions);
    } catch (error) {
      next(error);
    }
  }

  async retry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const predictions = await scansService.retry(String(req.params.id), req.user!.id);
      sendSuccess(res, predictions, 200, 'Scan analysis retried successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export const scansController = new ScansController();
