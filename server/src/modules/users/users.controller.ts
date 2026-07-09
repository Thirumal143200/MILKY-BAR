/**
 * @module modules/users/users.controller
 * User route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { usersService } from './users.service.js';
import { sendSuccess, sendNoContent } from '../../utils/response.js';
import { updateProfileSchema } from '@milkboy/shared';

export class UsersController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.getProfile(req.user!.id);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const profile = await usersService.updateProfile(req.user!.id, validated);
      sendSuccess(res, profile, 200, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await usersService.listSessions(req.user!.id);
      sendSuccess(res, sessions);
    } catch (error) {
      next(error);
    }
  }

  async revokeSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await usersService.revokeSession(req.user!.id, String(req.params.id));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async listDevices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const devices = await usersService.listDevices(req.user!.id);
      sendSuccess(res, devices);
    } catch (error) {
      next(error);
    }
  }

  async registerDevice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const device = await usersService.registerDevice(req.user!.id, req.body);
      sendSuccess(res, device, 201, 'Device registered successfully.');
    } catch (error) {
      next(error);
    }
  }

  async removeDevice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await usersService.removeDevice(req.user!.id, String(req.params.id));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
