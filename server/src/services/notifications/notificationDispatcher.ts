/**
 * @module services/notifications/notificationDispatcher
 * Real-time event-driven notification dispatcher.
 */

import { EventEmitter } from 'node:events';
import { notificationsService } from '../../modules/notifications/notifications.service.js';
import { createModuleLogger } from '../../utils/logger.js';
import type {
  ApplicationEventType,
  NotificationCategory,
  NotificationPriority,
  DispatchEventPayload,
} from '@milkboy/shared';

const log = createModuleLogger('notification-dispatcher');

export class NotificationDispatcher extends EventEmitter {
  constructor() {
    super();
    this.registerSystemListeners();
  }

  /**
   * Derive category from event type name.
   */
  public getCategoryForEvent(eventType: ApplicationEventType): NotificationCategory {
    if (eventType.startsWith('auth:')) return 'auth';
    if (eventType.startsWith('scan:')) return 'scan';
    if (eventType.startsWith('report:')) return 'report';
    if (eventType.startsWith('sync:')) return 'sync';
    if (eventType.startsWith('lab:')) return 'laboratory';
    if (eventType.startsWith('admin:')) return 'admin';
    return 'system';
  }

  /**
   * Dispatch notification payload to single user or role.
   */
  public async dispatch(payload: DispatchEventPayload): Promise<number> {
    try {
      const category = this.getCategoryForEvent(payload.event);
      const priority: NotificationPriority = payload.priority || 'normal';

      const data = {
        category,
        type: payload.event,
        title: payload.title,
        message: payload.message,
        priority,
        data: payload.data,
      };

      if (payload.userId) {
        await notificationsService.create(payload.userId, data);
        log.info(`Dispatched event '${payload.event}' to user ${payload.userId}`);
        return 1;
      }

      if (payload.role) {
        const count = await notificationsService.dispatchToRole(payload.role, data);
        log.info(
          `Dispatched role event '${payload.event}' to ${count} users in role '${payload.role}'`,
        );
        return count;
      }

      return 0;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Event dispatch failed';
      log.error(`Failed to dispatch notification event '${payload.event}': ${errorMsg}`);
      return 0;
    }
  }

  private registerSystemListeners() {
    this.on('dispatch', (payload: DispatchEventPayload) => {
      this.dispatch(payload).catch(() => {});
    });
  }
}

export const notificationDispatcher = new NotificationDispatcher();
