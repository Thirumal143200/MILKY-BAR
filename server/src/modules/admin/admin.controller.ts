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

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await svc.createUser(req.body);
      sendSuccess(res, user, 201, 'User created successfully.');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await svc.deleteUser(String(req.params.id));
      sendSuccess(res, null, 200, 'User deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await svc.deactivateUser(String(req.params.id));
      sendSuccess(res, null, 200, 'User deactivated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async reactivateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await svc.reactivateUser(String(req.params.id));
      sendSuccess(res, null, 200, 'User reactivated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await svc.getUserById(String(req.params.id));
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async listPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await svc.listPermissions();
      sendSuccess(res, permissions);
    } catch (error) {
      next(error);
    }
  }

  async listRoles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const roles = await svc.listRoles();
      sendSuccess(res, roles);
    } catch (error) {
      next(error);
    }
  }

  async listRolePermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await svc.listRolePermissions(String(req.params.id));
      sendSuccess(res, permissions);
    } catch (error) {
      next(error);
    }
  }

  async updateRolePermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await svc.updateRolePermissions(String(req.params.id), req.body.permissionIds);
      sendSuccess(res, null, 200, 'Role permissions updated successfully.');
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

  async getUserAnalytics(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.getUserAnalytics();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMilkAnalytics(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.getMilkAnalytics();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDatabaseStatus(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.getDatabaseStatus();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAiModelMonitoring(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.getAiModelMonitoring();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSettings(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.getSettings();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await svc.updateSettings(
        String(req.body.key),
        String(req.body.value),
        req.user!.id
      );
      sendSuccess(res, result, 200, 'Setting updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
