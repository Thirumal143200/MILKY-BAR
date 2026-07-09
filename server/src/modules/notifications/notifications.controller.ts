/**
 * @module modules/notifications/notifications.controller
 * Notification route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { notificationsService } from './notifications.service.js';
import { sendSuccess } from '../../utils/response.js';
import { paginationSchema } from '@milkboy/shared';

export class NotificationsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const unreadOnly = req.query.unreadOnly === 'true';
      const result = await notificationsService.listByUser(req.user!.id, { ...params, unreadOnly });
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAsRead(req.user!.id, String(req.params.id));
      sendSuccess(res, null, 200, 'Notification marked as read.');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAllAsRead(req.user!.id);
      sendSuccess(res, null, 200, 'All notifications marked as read.');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
