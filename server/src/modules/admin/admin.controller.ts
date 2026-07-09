/**
 * @module modules/admin/admin.controller
 * Admin route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { adminService as svc } from './admin.service.js';
import { sendSuccess } from '../../utils/response.js';
import { paginationSchema, updateUserAdminSchema } from '@milkboy/shared';

export class AdminController {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const role = req.query.role as string | undefined;
      const status = req.query.status as string | undefined;
      const result = await svc.getUsers({ ...params, role, status });
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateUserAdminSchema.parse(req.body);
      await svc.updateUser(String(req.params.id), validated);
      sendSuccess(res, null, 200, 'User updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const action = req.query.action as string | undefined;
      const userId = req.query.userId as string | undefined;
      const result = await svc.getAuditLogs({ ...params, action, userId });
      sendSuccess(res, result.data, 200, undefined, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.getAnalytics();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSystemHealth(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.getSystemHealth();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async backup(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.backupDatabase();
      sendSuccess(res, result, 201, 'Backup completed successfully.');
    } catch (error) {
      next(error);
    }
  }

  async listBackups(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.listBackups();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
