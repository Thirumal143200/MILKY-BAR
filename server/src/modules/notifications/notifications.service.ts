/**
 * @module modules/notifications/notifications.service
 * Enterprise notification delivery, preference filtering, and role-based broadcasting logic.
 */

import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import { AppError } from '../../utils/AppError.js';
import {
  ERROR_CODES,
  buildPaginationMeta,
  calculateOffset,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@milkboy/shared';
import type {
  PaginationInput,
  NotificationCategory,
  NotificationPriority,
  NotificationPreferences,
  PushTokenRegistrationPayload,
} from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';

const log = createModuleLogger('notifications-service');

export class NotificationsService {
  /**
   * Create and deliver a notification for a user.
   */
  async create(
    userId: string,
    data: {
      category?: NotificationCategory;
      type: string;
      title: string;
      message: string;
      priority?: NotificationPriority;
      data?: Record<string, unknown>;
    },
  ) {
    const prefs = await this.getPreferences(userId);

    // 1. Master toggle check
    if (prefs.enableNotifications === false) {
      log.debug(`Notification skipped for user ${userId}: Notifications globally disabled in preferences.`);
      return null;
    }

    const category = data.category || 'system';

    // 2. Category preference check
    if (prefs.categories && prefs.categories[category] === false) {
      log.debug(`Notification skipped for user ${userId}: Category '${category}' disabled in preferences.`);
      return null;
    }

    // 3. Quiet Hours Check
    if (prefs.quietHours?.enabled && data.priority !== 'urgent') {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startH, startM] = (prefs.quietHours.startTime || '22:00').split(':').map(Number);
      const [endH, endM] = (prefs.quietHours.endTime || '07:00').split(':').map(Number);

      const startMinutes = (startH ?? 22) * 60 + (startM ?? 0);
      const endMinutes = (endH ?? 7) * 60 + (endM ?? 0);

      let inQuietHours = false;
      if (startMinutes > endMinutes) {
        // Spans midnight (e.g. 22:00 to 07:00)
        inQuietHours = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      } else {
        inQuietHours = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      }

      if (inQuietHours) {
        log.info(`Non-urgent notification quiet hours suppressed for user ${userId}`);
        // Suppress non-urgent push alerts during quiet hours
      }
    }

    const notificationId = generateId();

    const newNotification = {
      id: notificationId,
      user_id: userId,
      category,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      data: data.data ? JSON.stringify(data.data) : null,
      read: false,
      created_at: new Date().toISOString(),
    };

    await db('notifications').insert(newNotification);
    log.info(`Notification ${notificationId} [${category}] sent to user ${userId}`);

    return {
      id: notificationId,
      userId,
      category,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      read: false,
      data: data.data ?? null,
      createdAt: newNotification.created_at,
    };
  }

  /**
   * Broadcast notification to all active users in a specified role.
   */
  async dispatchToRole(
    roleName: string,
    data: {
      category?: NotificationCategory;
      type: string;
      title: string;
      message: string;
      priority?: NotificationPriority;
      data?: Record<string, unknown>;
    },
  ): Promise<number> {
    const roleUsers = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('roles.name', roleName)
      .where('users.status', 'active')
      .select('users.id');

    let count = 0;
    for (const user of roleUsers) {
      const res = await this.create(user.id, data);
      if (res) count++;
    }

    log.info(`Broadcasted notification [${data.type}] to ${count} users in role '${roleName}'`);
    return count;
  }

  /**
   * List notifications for a user with category filtering & search.
   */
  async listByUser(
    userId: string,
    params: PaginationInput & { unreadOnly?: boolean; category?: NotificationCategory; search?: string },
  ) {
    let query = db('notifications').where('user_id', userId);

    if (params.unreadOnly) {
      query = query.where('read', false);
    }

    if (params.category) {
      query = query.where('category', params.category);
    }

    if (params.search) {
      query = query.where((builder) => {
        builder
          .where('title', 'like', `%${params.search}%`)
          .orWhere('message', 'like', `%${params.search}%`);
      });
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
        category: n.category || 'system',
        type: n.type,
        title: n.title,
        message: n.message,
        priority: n.priority || 'normal',
        read: Boolean(n.read),
        data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : null,
        createdAt: n.created_at,
      })),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Get unread notifications & total unread count for a user.
   */
  async getUnread(userId: string) {
    const countResult = (await db('notifications')
      .where({ user_id: userId, read: false })
      .count('* as count')) as unknown as { count: string | number }[];

    const unreadCount = Number(countResult[0]?.count ?? 0);

    const notifications = await db('notifications')
      .where({ user_id: userId, read: false })
      .orderBy('created_at', 'desc')
      .limit(20);

    return {
      unreadCount,
      data: notifications.map((n) => ({
        id: n.id,
        userId: n.user_id,
        category: n.category || 'system',
        type: n.type,
        title: n.title,
        message: n.message,
        priority: n.priority || 'normal',
        read: false,
        data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : null,
        createdAt: n.created_at,
      })),
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

  /**
   * Delete a single notification.
   */
  async delete(userId: string, notificationId: string) {
    const deleted = await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .delete();

    if (!deleted) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Notification not found.');
    }

    log.info(`Notification ${notificationId} deleted by user ${userId}`);
  }

  /**
   * Delete all notifications for a user.
   */
  async deleteAll(userId: string) {
    await db('notifications').where('user_id', userId).delete();
    log.info(`All notifications deleted for user ${userId}`);
  }

  /**
   * Register or update a user device push token.
   */
  async registerPushToken(userId: string, payload: PushTokenRegistrationPayload) {
    const deviceId = generateId();
    const existing = await db('user_devices')
      .where({ user_id: userId, push_token: payload.token })
      .first();

    if (existing) {
      await db('user_devices')
        .where('id', existing.id)
        .update({
          last_active_at: new Date().toISOString(),
        });
      log.info(`Push token updated for device ${existing.id}`);
      return existing;
    }

    const newDevice = {
      id: deviceId,
      user_id: userId,
      device_name: payload.deviceName || 'Mobile Device',
      device_type: payload.deviceType || 'android',
      push_token: payload.token,
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await db('user_devices').insert(newDevice);
    log.info(`Push token registered for user ${userId}`);
    return newDevice;
  }

  /**
   * Get user notification preferences.
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const preference = await db('system_settings')
      .where('key', `user:preferences:${userId}`)
      .first();

    if (!preference) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    try {
      const parsed = JSON.parse(preference.value);
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed };
    } catch {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
  }

  /**
   * Update user notification preferences.
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    const key = `user:preferences:${userId}`;
    const current = await this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...preferences,
      categories: {
        ...current.categories,
        ...(preferences.categories || {}),
      },
      quietHours: {
        ...current.quietHours,
        ...(preferences.quietHours || {}),
      },
    };

    const existing = await db('system_settings').where('key', key).first();
    if (existing) {
      await db('system_settings')
        .where('key', key)
        .update({
          value: JSON.stringify(updated),
          updated_at: new Date().toISOString(),
        });
    } else {
      await db('system_settings').insert({
        id: generateId(),
        key,
        value: JSON.stringify(updated),
        category: 'notification',
        description: `Notification preferences for user ${userId}`,
        updated_at: new Date().toISOString(),
      });
    }

    log.info(`Notification preferences updated for user ${userId}`);
    return updated;
  }
}

export const notificationsService = new NotificationsService();
