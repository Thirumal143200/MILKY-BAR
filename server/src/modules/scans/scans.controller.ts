/**
 * @module modules/scans/scans.controller
 * Scan route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { scansService } from './scans.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response.js';
import { paginationSchema } from '@milkboy/shared';

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
      const result = await scansService.getById(req.params.id!, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      const userId = isAdmin ? undefined : req.user!.id;
      await scansService.delete(req.params.id!, userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const scansController = new ScansController();
