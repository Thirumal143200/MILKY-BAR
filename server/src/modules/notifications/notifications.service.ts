/**
 * @module modules/notifications/notifications.service
 * Notification delivery and status tracking business logic.
 */

import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, buildPaginationMeta, calculateOffset } from '@milkboy/shared';
import type { PaginationInput } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';

const log = createModuleLogger('notifications-service');

export class NotificationsService {
  /**
   * Create and send a notification.
   */
  async create(
    userId: string,
    data: { type: string; title: string; message: string; data?: Record<string, unknown> },
  ) {
    const notificationId = generateId();

    const newNotification = {
      id: notificationId,
      user_id: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data ? JSON.stringify(data.data) : null,
      read: false,
      created_at: new Date().toISOString(),
    };

    await db('notifications').insert(newNotification);
    log.info(`Notification ${notificationId} sent to user ${userId}`);

    return {
      ...newNotification,
      data: data.data ?? null,
    };
  }

  /**
   * List notifications for a user.
   */
  async listByUser(userId: string, params: PaginationInput & { unreadOnly?: boolean }) {
    let query = db('notifications').where('user_id', userId);

    if (params.unreadOnly) {
      query = query.where('read', false);
    }

    const countResult = (await query.clone().count('* as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: notifications.map((n) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: Boolean(n.read),
        data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : null,
        createdAt: n.created_at,
      })),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(userId: string, notificationId: string) {
    const updated = await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({
        read: true,
      });

    if (!updated) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Notification not found.');
    }

    log.debug(`Notification ${notificationId} marked as read by user ${userId}`);
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    await db('notifications').where({ user_id: userId, read: false }).update({
      read: true,
    });

    log.debug(`All notifications marked as read for user ${userId}`);
  }
}

export const notificationsService = new NotificationsService();
