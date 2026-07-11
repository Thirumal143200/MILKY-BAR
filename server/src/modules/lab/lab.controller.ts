/**
 * @module modules/lab/lab.controller
 * Laboratory route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { labService } from './lab.service.js';
import { sendSuccess } from '../../utils/response.js';
import { paginationSchema, labValidationSchema } from '@milkboy/shared';

export class LabController {
  async getPending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await labService.getPending(params);
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async validate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = labValidationSchema.parse(req.body);
      const result = await labService.validate(String(req.params.scanId), req.user!.id, validated);
      sendSuccess(res, result, 200, 'Lab validation recorded successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await labService.getHistory(params);
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await labService.validate(String(req.params.scanId), req.user!.id, {
        result: 'confirmed',
        notes: req.body.notes,
        parameters: req.body.parameters,
      });
      sendSuccess(res, result, 200, 'Sample approved successfully.');
    } catch (error) {
      next(error);
    }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await labService.validate(String(req.params.scanId), req.user!.id, {
        result: 'rejected',
        notes: req.body.notes,
        parameters: req.body.parameters,
      });
      sendSuccess(res, result, 200, 'Sample rejected successfully.');
    } catch (error) {
      next(error);
    }
  }

  async compare(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await labService.compareAiVsLab();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async reports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await labService.getHistory(params);
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }
}

export const labController = new LabController();
