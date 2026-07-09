/**
 * @module modules/feedback/feedback.controller
 * Feedback route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { feedbackService } from './feedback.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { paginationSchema, feedbackSchema } from '@milkboy/shared';

export class FeedbackController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = feedbackSchema.parse(req.body);
      const feedback = await feedbackService.create(req.user!.id, validated);
      sendCreated(res, feedback, 'Feedback submitted successfully.');
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const result = await feedbackService.list({ ...params, type, status });
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      await feedbackService.updateStatus(String(req.params.id), status);
      sendSuccess(res, null, 200, 'Feedback status updated.');
    } catch (error) {
      next(error);
    }
  }
}

export const feedbackController = new FeedbackController();
