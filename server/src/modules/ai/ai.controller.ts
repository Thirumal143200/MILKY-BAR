/**
 * @module modules/ai/ai.controller
 * AI route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { aiService } from './ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/AppError.js';

export class AiController {
  async predictDirect(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw AppError.badRequest('VAL_002', 'Image file is required.');
      }
      const result = await aiService.predictDirect(req.file);
      sendSuccess(res, result, 201, 'Direct prediction ran successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getActiveModelStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getActiveModelStatus();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getModelVersions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getModelVersions();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getModelHealth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getModelHealth();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getConfidenceScoreMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getConfidenceScoreMetrics();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPredictionExplanation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getPredictionExplanation();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getImagePreprocessingStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getImagePreprocessingStatus(String(req.params.imageId));
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
