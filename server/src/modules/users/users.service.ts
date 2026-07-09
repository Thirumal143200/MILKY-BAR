/**
 * @module modules/users/users.service
 * User profile, session, and device management business logic.
 */

import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';

const log = createModuleLogger('users-service');

export class UsersService {
  /**
   * Get user profile.
   */
  async getProfile(userId: string) {
    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', userId)
      .select('users.*', 'roles.name as role_name')
      .first();

    if (!user) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'User not found.');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role_name,
      avatarUrl: user.avatar_url,
      phone: user.phone,
      language: user.language,
      theme: user.theme,
      mfaEnabled: user.mfa_enabled,
      createdAt: user.created_at,
    };
  }

  /**
   * Update user profile.
   */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      language?: string;
      theme?: string;
    },
  ) {
    const updates: Record<string, unknown> = {};

    if (data.firstName !== undefined) updates.first_name = data.firstName;
    if (data.lastName !== undefined) updates.last_name = data.lastName;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.language !== undefined) updates.language = data.language;
    if (data.theme !== undefined) updates.theme = data.theme;

    updates.updated_at = new Date().toISOString();

    await db('users').where('id', userId).update(updates);
    log.info(`Profile updated for user: ${userId}`);

    return this.getProfile(userId);
  }

  /**
   * List user's active sessions.
   */
  async listSessions(userId: string) {
    const sessions = await db('user_sessions')
      .where('user_id', userId)
      .where('expires_at', '>', new Date().toISOString())
      .orderBy('last_active_at', 'desc');

    return sessions.map((s) => ({
      id: s.id,
      deviceInfo: s.device_info,
      ipAddress: s.ip_address,
      userAgent: s.user_agent,
      lastActiveAt: s.last_active_at,
      expiresAt: s.expires_at,
      createdAt: s.created_at,
    }));
  }

  /**
   * Revoke a specific user session.
   */
  async revokeSession(userId: string, sessionId: string) {
    const deleted = await db('user_sessions')
      .where('user_id', userId)
      .where('id', sessionId)
      .delete();

    if (!deleted) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Session not found.');
    }

    log.info(`Session ${sessionId} revoked for user: ${userId}`);
  }

  /**
   * List user's registered devices.
   */
  async listDevices(userId: string) {
    return db('user_devices').where('user_id', userId).orderBy('last_active_at', 'desc');
  }

  /**
   * Register a new device for push notifications.
   */
  async registerDevice(
    userId: string,
    data: { deviceName: string; deviceType: string; pushToken?: string },
  ) {
    // If push token exists, verify if it's already registered
    if (data.pushToken) {
      const existing = await db('user_devices').where('push_token', data.pushToken).first();
      if (existing) {
        if (existing.user_id === userId) {
          await db('user_devices').where('id', existing.id).update({
            last_active_at: new Date().toISOString(),
          });
          return existing;
        } else {
          // Re-assign token to current user
          await db('user_devices').where('id', existing.id).update({
            user_id: userId,
            last_active_at: new Date().toISOString(),
          });
          return { ...existing, user_id: userId };
        }
      }
    }

    const deviceId = generateId();
    const newDevice = {
      id: deviceId,
      user_id: userId,
      device_name: data.deviceName,
      device_type: data.deviceType,
      push_token: data.pushToken ?? null,
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await db('user_devices').insert(newDevice);
    log.info(`Device registered: ${deviceId} for user ${userId}`);

    return newDevice;
  }

  /**
   * Unregister/remove a device.
   */
  async removeDevice(userId: string, deviceId: string) {
    const deleted = await db('user_devices')
      .where('user_id', userId)
      .where('id', deviceId)
      .delete();

    if (!deleted) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Device not found.');
    }

    log.info(`Device ${deviceId} removed for user: ${userId}`);
  }
}

export const usersService = new UsersService();
