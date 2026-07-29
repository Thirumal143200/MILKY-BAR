/**
 * @module modules/admin/admin.service
 * Administration operations, analytics, system health, and audit logs.
 */

import { db } from '../../database/connection.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, buildPaginationMeta, calculateOffset } from '@milkboy/shared';
import type { PaginationInput } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';
import { generateId, hashPassword } from '../../utils/crypto.js';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../config/env.js';
import { globalCache } from '../../utils/cache.js';

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
   * Create a new user.
   */
  async createUser(data: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: string;
    status?: string;
  }) {
    const existing = await db('users').where('email', data.email).first();
    if (existing) {
      throw AppError.badRequest(ERROR_CODES.RES_CONFLICT, 'Email already in use.');
    }

    const role = await db('roles').where('name', data.role).first();
    if (!role) {
      throw AppError.badRequest(ERROR_CODES.VAL_INVALID_INPUT, 'Invalid role.');
    }

    const userId = generateId();
    const password = data.password ?? 'Test@1234!';
    const passwordHash = await hashPassword(password);

    await db('users').insert({
      id: userId,
      email: data.email,
      password_hash: passwordHash,
      first_name: data.firstName,
      last_name: data.lastName,
      role_id: role.id,
      status: data.status ?? 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    log.info(`User created by Admin: ${userId}`);
    return this.getUserById(userId);
  }

  /**
   * Delete a user (soft delete).
   */
  async deleteUser(userId: string) {
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'User not found.');
    }

    await db('users').where('id', userId).update({
      deleted_at: new Date().toISOString(),
      status: 'deleted',
      updated_at: new Date().toISOString(),
    });

    log.info(`User ${userId} soft deleted by Admin`);
  }

  /**
   * Deactivate a user.
   */
  async deactivateUser(userId: string) {
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'User not found.');
    }

    await db('users').where('id', userId).update({
      status: 'deactivated',
      updated_at: new Date().toISOString(),
    });

    log.info(`User ${userId} deactivated by Admin`);
  }

  /**
   * Reactivate a user.
   */
  async reactivateUser(userId: string) {
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'User not found.');
    }

    await db('users').where('id', userId).update({
      status: 'active',
      updated_at: new Date().toISOString(),
    });

    log.info(`User ${userId} reactivated by Admin`);
  }

  /**
   * Get user by ID.
   */
  async getUserById(userId: string) {
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
      status: user.status,
      mfaEnabled: Boolean(user.mfa_enabled),
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      deletedAt: user.deleted_at,
    };
  }

  /**
   * List all permissions.
   */
  async listPermissions() {
    return db('permissions').orderBy('resource', 'asc').orderBy('action', 'asc');
  }

  /**
   * List all roles.
   */
  async listRoles() {
    return db('roles').orderBy('name', 'asc');
  }

  /**
   * List permissions of a role.
   */
  async listRolePermissions(roleId: string) {
    return db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', roleId)
      .select('permissions.*');
  }

  /**
   * Update/sync permissions of a role.
   */
  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await db('roles').where('id', roleId).first();
    if (!role) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Role not found.');
    }

    await db.transaction(async (trx) => {
      // Clear existing
      await trx('role_permissions').where('role_id', roleId).delete();

      // Insert new mappings
      if (permissionIds.length > 0) {
        const mappings = permissionIds.map((pId) => ({
          role_id: roleId,
          permission_id: pId,
        }));
        await trx('role_permissions').insert(mappings);
      }
    });

    log.info(`Permissions updated for role ${roleId}`);
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
    const cacheKey = 'admin:analytics:summary';
    const cached = globalCache.get<any>(cacheKey);
    if (cached) return cached;

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

    const result = {
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

    globalCache.set(cacheKey, result, 15); // Cache for 15 seconds
    return result;
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

  /**
   * Get advanced user analytics.
   */
  async getUserAnalytics() {
    const roles = await db('roles').select('id', 'name');
    const counts = await db('users')
      .select('role_id', 'status')
      .count('* as count')
      .groupBy('role_id', 'status');

    const totalUsers = await db('users').count('* as count').first();
    const activeUsers = await db('users').where('status', 'active').count('* as count').first();

    return {
      total: Number(totalUsers?.count ?? 0),
      active: Number(activeUsers?.count ?? 0),
      byRoleAndStatus: counts.map((c) => {
        const role = roles.find((r) => r.id === c.role_id);
        return {
          role: role ? role.name : 'unknown',
          status: c.status,
          count: Number(c.count),
        };
      }),
    };
  }

  /**
   * Get advanced milk quality and confidence analytics.
   */
  async getMilkAnalytics() {
    const avgConfidence = await db('predictions').avg('confidence as avg').first();
    const labelCounts = await db('predictions')
      .select('quality_label')
      .count('* as count')
      .groupBy('quality_label');

    return {
      averageConfidence: Number(avgConfidence?.avg ?? 0),
      byLabel: labelCounts.map((l) => ({
        label: l.quality_label,
        count: Number(l.count),
      })),
    };
  }

  /**
   * Get database client details and table row statistics.
   */
  async getDatabaseStatus() {
    const tables = [
      'roles',
      'permissions',
      'users',
      'scans',
      'predictions',
      'reports',
      'lab_validations',
      'audit_logs',
      'notifications',
      'system_settings',
      'feature_flags',
    ];

    const rowCounts: Record<string, number> = {};
    for (const table of tables) {
      try {
        const count = await db(table).count('* as count').first();
        rowCounts[table] = Number(count?.count ?? 0);
      } catch {
        rowCounts[table] = 0;
      }
    }

    return {
      client: db.client.config.client,
      environment: config.nodeEnv,
      tables: rowCounts,
    };
  }

  /**
   * Get AI model monitoring performance stats.
   */
  async getAiModelMonitoring() {
    const avgResponseTime = await db('predictions').avg('processing_time_ms as avg').first();
    const totalPredictions = await db('predictions').count('* as count').first();
    const activeModel = await db('ai_model_versions').where('is_active', true).first();

    return {
      totalPredictions: Number(totalPredictions?.count ?? 0),
      averageProcessingTimeMs: Number(avgResponseTime?.avg ?? 0),
      activeModel,
    };
  }

  /**
   * List all general system settings (excluding user preferences).
   */
  async getSettings() {
    return db('system_settings').whereNot('key', 'like', 'user:preferences:%');
  }

  /**
   * Update a system setting.
   */
  async updateSettings(key: string, value: string, updatedBy: string) {
    const setting = await db('system_settings').where('key', key).first();
    if (!setting) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Setting not found.');
    }

    await db('system_settings').where('key', key).update({
      value,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    });

    log.info(`Setting ${key} updated by Admin user ${updatedBy}`);
    return db('system_settings').where('key', key).first();
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

  /**
   * Get producer statistics and collection metrics.
   */
  async getProducerAnalytics() {
    const producerRole = await db('roles').where('name', 'producer').first();
    const roleId = producerRole ? producerRole.id : '';

    const producers = await db('users')
      .where('role_id', roleId)
      .select('id', 'email', 'first_name', 'last_name', 'status', 'created_at');

    const totalProducers = producers.length;
    const activeProducers = producers.filter((p) => p.status === 'active').length;

    const collections = await db('scans')
      .join('users', 'scans.user_id', 'users.id')
      .where('users.role_id', roleId)
      .count('* as count')
      .first();

    return {
      totalProducers,
      activeProducers,
      totalCollections: Number(collections?.count ?? 0),
      producersList: producers.map((p) => ({
        id: p.id,
        email: p.email,
        name: `${p.first_name} ${p.last_name}`,
        status: p.status,
        createdAt: p.created_at,
      })),
    };
  }

  /**
   * Get consumer statistics and consumption metrics.
   */
  async getConsumerAnalytics() {
    const consumerRole = await db('roles').where('name', 'consumer').first();
    const roleId = consumerRole ? consumerRole.id : '';

    const consumers = await db('users')
      .where('role_id', roleId)
      .select('id', 'email', 'first_name', 'last_name', 'status', 'created_at');

    const totalConsumers = consumers.length;
    const activeConsumers = consumers.filter((c) => c.status === 'active').length;

    return {
      totalConsumers,
      activeConsumers,
      consumersList: consumers.map((c) => ({
        id: c.id,
        email: c.email,
        name: `${c.first_name} ${c.last_name}`,
        status: c.status,
        createdAt: c.created_at,
      })),
    };
  }

  /**
   * Get laboratory validation metrics and review counts.
   */
  async getLabAnalytics() {
    const labRole = await db('roles').where('name', 'lab_staff').first();
    const roleId = labRole ? labRole.id : '';

    const labStaff = await db('users').where('role_id', roleId).count('* as count').first();
    const pendingReviews = await db('scans')
      .leftJoin('lab_validations', 'scans.id', 'lab_validations.scan_id')
      .where('scans.status', 'completed')
      .whereNull('lab_validations.id')
      .count('* as count')
      .first();

    const confirmed = await db('lab_validations')
      .where('result', 'confirmed')
      .count('* as count')
      .first();
    const rejected = await db('lab_validations')
      .where('result', 'rejected')
      .count('* as count')
      .first();
    const inconclusive = await db('lab_validations')
      .where('result', 'inconclusive')
      .count('* as count')
      .first();

    return {
      totalLabStaff: Number(labStaff?.count ?? 0),
      pendingReviewsCount: Number(pendingReviews?.count ?? 0),
      confirmedCount: Number(confirmed?.count ?? 0),
      rejectedCount: Number(rejected?.count ?? 0),
      inconclusiveCount: Number(inconclusive?.count ?? 0),
    };
  }

  /**
   * Get report generation and QR verification metrics.
   */
  async getReportAnalytics() {
    const totalReports = await db('reports').count('* as count').first();
    const totalQrCodes = await db('report_qr_codes').count('* as count').first();
    const totalAuditVerifications = await db('audit_logs')
      .where('action', 'report_download')
      .count('* as count')
      .first();

    return {
      totalReportsGenerated: Number(totalReports?.count ?? 0),
      totalQrCodesIssued: Number(totalQrCodes?.count ?? 0),
      totalVerifications: Number(totalAuditVerifications?.count ?? 0),
    };
  }

  /**
   * Get full system resource & active sessions monitoring metrics.
   */
  async getSystemMonitoring() {
    const activeSessions = await db('user_sessions')
      .where('expires_at', '>', new Date().toISOString())
      .count('* as count')
      .first();

    const memUsage = process.memoryUsage();
    const uptimeSeconds = Math.floor(process.uptime());

    return {
      uptimeSeconds,
      activeSessionsCount: Number(activeSessions?.count ?? 0),
      memory: {
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
        heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      },
      nodeVersion: process.version,
      environment: config.nodeEnv,
    };
  }

  /**
   * List all feature flags.
   */
  async getFeatureFlags() {
    return db('feature_flags').select('*');
  }

  /**
   * Update feature flag toggle.
   */
  async updateFeatureFlag(name: string, enabled: boolean) {
    const flag = await db('feature_flags').where('name', name).first();
    if (!flag) {
      const id = generateId();
      await db('feature_flags').insert({
        id,
        name,
        description: `Feature flag ${name}`,
        enabled,
        updated_at: new Date().toISOString(),
      });
    } else {
      await db('feature_flags').where('name', name).update({
        enabled,
        updated_at: new Date().toISOString(),
      });
    }

    log.info(`Feature flag '${name}' set to ${enabled}`);
    return db('feature_flags').where('name', name).first();
  }
}

export const adminService = new AdminService();
