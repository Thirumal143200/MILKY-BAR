/**
 * @module modules/admin/admin.service
 * Administration operations, analytics, system health, and audit logs.
 */

import { db } from '../../database/connection.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, buildPaginationMeta, calculateOffset } from '@milkboy/shared';
import type { PaginationInput } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';
import { generateId } from '../../utils/crypto.js';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../config/env.js';

const log = createModuleLogger('admin-service');

export class AdminService {
  /**
   * List users with pagination and role/status filters.
   */
  async getUsers(params: PaginationInput & { role?: string; status?: string }) {
    let query = db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select('users.*', 'roles.name as role_name');

    if (params.role) {
      query = query.where('roles.name', params.role);
    }
    if (params.status) {
      query = query.where('users.status', params.status);
    }

    if (params.search) {
      query = query.where((builder) => {
        builder
          .where('users.email', 'like', `%${params.search}%`)
          .orWhere('users.first_name', 'like', `%${params.search}%`)
          .orWhere('users.last_name', 'like', `%${params.search}%`);
      });
    }

    const countResult = (await query.clone().count('* as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    const users = await query
      .orderBy('users.created_at', 'desc')
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_name,
        status: user.status,
        mfaEnabled: Boolean(user.mfa_enabled),
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      })),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Update user status or role.
   */
  async updateUser(userId: string, data: { status?: string; role?: string }) {
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'User not found.');
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.status) {
      updates.status = data.status;
    }

    if (data.role) {
      const role = await db('roles').where('name', data.role).first();
      if (!role) throw AppError.badRequest(ERROR_CODES.VAL_INVALID_INPUT, 'Invalid role.');
      updates.role_id = role.id;
    }

    await db('users').where('id', userId).update(updates);
    log.info(`User ${userId} updated by Admin`);
  }

  /**
   * Get audit logs.
   */
  async getAuditLogs(params: PaginationInput & { action?: string; userId?: string }) {
    let query = db('audit_logs');

    if (params.action) {
      query = query.where('action', params.action);
    }
    if (params.userId) {
      query = query.where('user_id', params.userId);
    }

    if (params.search) {
      query = query.where((builder) => {
        builder
          .where('user_email', 'like', `%${params.search}%`)
          .orWhere('action', 'like', `%${params.search}%`)
          .orWhere('resource', 'like', `%${params.search}%`);
      });
    }

    const countResult = (await query.clone().count('* as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    const logs = await query
      .orderBy('created_at', 'desc')
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: logs.map((l) => ({
        id: l.id,
        userId: l.user_id,
        userEmail: l.user_email,
        action: l.action,
        resource: l.resource,
        resourceId: l.resource_id,
        details: l.details
          ? typeof l.details === 'string'
            ? JSON.parse(l.details)
            : l.details
          : null,
        ipAddress: l.ip_address,
        userAgent: l.user_agent,
        createdAt: l.created_at,
      })),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Get analytics dashboard data.
   */
  async getAnalytics() {
    // 1. Quality distribution
    const qualityStats = await db('predictions')
      .select('quality_label')
      .count('* as count')
      .groupBy('quality_label');

    const qualityDistribution: Record<string, number> = {};
    for (const stat of qualityStats) {
      qualityDistribution[String(stat.quality_label)] = Number(stat.count);
    }

    // 2. Scan count stats
    const totalScans = await db('scans').count('* as count').first();
    const completedScans = await db('scans')
      .where('status', 'completed')
      .count('* as count')
      .first();
    const rejectedScans = await db('scans').where('status', 'rejected').count('* as count').first();

    // 3. User growth stats
    const totalUsers = await db('users').count('* as count').first();

    // 4. Time series: scans over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const scanHistory = await db('scans')
      .where('created_at', '>=', sevenDaysAgo.toISOString())
      .select(db.raw('date(created_at) as date'))
      .count('* as count')
      .groupBy('date')
      .orderBy('date', 'asc');

    return {
      summary: {
        totalUsers: Number(totalUsers?.count ?? 0),
        totalScans: Number(totalScans?.count ?? 0),
        completedScans: Number(completedScans?.count ?? 0),
        rejectedScans: Number(rejectedScans?.count ?? 0),
        rejectionRate:
          Number(totalScans?.count) > 0
            ? (Number(rejectedScans?.count ?? 0) / Number(totalScans?.count)) * 100
            : 0,
      },
      qualityDistribution,
      scansOverTime: scanHistory.map((h) => ({
        date: String(h.date),
        count: Number(h.count),
      })),
    };
  }

  /**
   * Get system health metrics.
   */
  async getSystemHealth() {
    let dbStatus: 'up' | 'down' = 'up';
    try {
      await db.raw('SELECT 1');
    } catch {
      dbStatus = 'down';
    }

    const storagePath = path.resolve(config.storage.localPath);
    let storageStatus: 'up' | 'down' = 'up';
    let storageUsed = 0;
    try {
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }
      storageUsed = this.getDirSize(storagePath);
    } catch {
      storageStatus = 'down';
    }

    return {
      status: dbStatus === 'up' && storageStatus === 'up' ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        database: { status: dbStatus },
        storage: { status: storageStatus, size: storageUsed },
      },
    };
  }

  /**
   * Create database backup (exports data as json files).
   */
  async backupDatabase() {
    const backupDir = path.join(config.storage.localPath, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    try {
      const backupData: Record<string, unknown[]> = {};

      const tables = [
        'roles',
        'permissions',
        'users',
        'scans',
        'scan_images',
        'predictions',
        'reports',
        'lab_validations',
        'audit_logs',
        'notifications',
        'system_settings',
        'feature_flags',
        'feedback',
      ];

      for (const table of tables) {
        backupData[table] = await db(table).select('*');
      }

      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

      const stats = fs.statSync(backupFile);
      const backupId = generateId();

      await db('backup_logs').insert({
        id: backupId,
        type: 'full',
        file_path: backupFile,
        file_size: stats.size,
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      log.info(`System backup created: ${backupFile}`);

      return {
        id: backupId,
        filePath: backupFile,
        size: stats.size,
      };
    } catch (error) {
      log.error('Backup failed', { error });

      await db('backup_logs').insert({
        id: generateId(),
        type: 'full',
        file_path: backupFile,
        file_size: 0,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        created_at: new Date().toISOString(),
      });

      throw AppError.internal('Database backup execution failed.');
    }
  }

  /**
   * List backups.
   */
  async listBackups() {
    return db('backup_logs').orderBy('created_at', 'desc');
  }

  private getDirSize(dirPath: string): number {
    let size = 0;
    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += this.getDirSize(filePath);
        } else {
          size += stats.size;
        }
      }
    } catch {
      // ignore errors
    }
    return size;
  }
}

export const adminService = new AdminService();
