/**
 * @module @milkboy/shared/types/notification
 * Enterprise notification type definitions and preference schemas.
 */

/** High-level notification categories */
export type NotificationCategory =
  'auth' | 'scan' | 'report' | 'sync' | 'laboratory' | 'admin' | 'system';

/** System priority levels */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Application events that emit notifications */
export type ApplicationEventType =
  // Auth Events
  | 'auth:register'
  | 'auth:verify_email'
  | 'auth:password_change'
  | 'auth:new_device'
  | 'auth:mfa_enabled'
  // Scan Events
  | 'scan:started'
  | 'scan:completed'
  | 'scan:failed'
  | 'scan:poor_quality'
  | 'scan:ai_ready'
  // Report Events
  | 'report:pdf_generated'
  | 'report:ready'
  | 'report:qr_verified'
  // Sync Events
  | 'sync:started'
  | 'sync:success'
  | 'sync:failed'
  | 'sync:retry_required'
  // Laboratory Events
  | 'lab:sample_approved'
  | 'lab:sample_rejected'
  | 'lab:verification_completed'
  // Admin & System Events
  | 'admin:new_user'
  | 'admin:system_warning'
  | 'admin:backup_completed'
  | 'admin:model_updated'
  | 'admin:security_alert';

/** Individual Notification Record */
export interface NotificationItem {
  id: string;
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  read: boolean;
  priority?: NotificationPriority;
  data?: Record<string, unknown>;
  createdAt: string;
}

/** User Notification Preferences Schema */
export interface NotificationPreferences {
  enableNotifications: boolean;
  enablePush: boolean;
  enableLocal: boolean;
  enableEmail: boolean;
  enableSms: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  priorityThreshold: NotificationPriority;
  quietHours: {
    enabled: boolean;
    startTime: string; // e.g. "22:00"
    endTime: string; // e.g. "07:00"
  };
  categories: Record<NotificationCategory, boolean>;
}

/** Default User Notification Preferences */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enableNotifications: true,
  enablePush: true,
  enableLocal: true,
  enableEmail: true,
  enableSms: false,
  soundEnabled: true,
  vibrationEnabled: true,
  priorityThreshold: 'low',
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
  },
  categories: {
    auth: true,
    scan: true,
    report: true,
    sync: true,
    laboratory: true,
    admin: true,
    system: true,
  },
};

/** Payload for registering device push tokens */
export interface PushTokenRegistrationPayload {
  token: string;
  deviceType: 'android' | 'ios' | 'web';
  deviceName?: string;
}

/** Event payload structure passed to notificationDispatcher */
export interface DispatchEventPayload {
  event: ApplicationEventType;
  userId?: string;
  role?: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
}
