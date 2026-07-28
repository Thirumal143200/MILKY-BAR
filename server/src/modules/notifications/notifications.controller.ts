/**
 * @module modules/notifications/notifications.controller
 * Notification route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { notificationsService } from './notifications.service.js';
import { sendSuccess } from '../../utils/response.js';
import { paginationSchema } from '@milkboy/shared';
import type { NotificationCategory } from '@milkboy/shared';

export class NotificationsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const unreadOnly = req.query.unreadOnly === 'true';
      const category = req.query.category as NotificationCategory | undefined;
      const search = req.query.search as string | undefined;

      const result = await notificationsService.listByUser(req.user!.id, {
        ...params,
        unreadOnly,
        category,
        search,
      });

      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getUnread(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.getUnread(req.user!.id);
      sendSuccess(res, result.data, 200, undefined, { unreadCount: result.unreadCount });
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

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationsService.delete(req.user!.id, String(req.params.id));
      sendSuccess(res, null, 200, 'Notification deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  async deleteAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationsService.deleteAll(req.user!.id);
      sendSuccess(res, null, 200, 'All notifications cleared.');
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const preferences = await notificationsService.getPreferences(req.user!.id);
      sendSuccess(res, preferences);
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const preferences = await notificationsService.updatePreferences(req.user!.id, req.body);
      sendSuccess(res, preferences, 200, 'Notification preferences updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async registerPushToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const device = await notificationsService.registerPushToken(req.user!.id, req.body);
      sendSuccess(res, device, 201, 'Push token registered successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
