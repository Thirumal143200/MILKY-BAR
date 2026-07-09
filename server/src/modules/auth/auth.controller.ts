/**
 * @module modules/auth/auth.controller
 * Authentication route handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { authService } from './auth.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      sendCreated(res, user, 'Account created successfully. Please verify your email.');
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, mfaCode, deviceInfo } = req.body;
      const result = await authService.login(
        email,
        password,
        req.ip ?? 'unknown',
        req.get('user-agent') ?? 'unknown',
        deviceInfo,
        mfaCode,
      );

      if (result.requiresMfa) {
        sendSuccess(res, { requiresMfa: true }, 200, 'MFA code required.');
        return;
      }

      sendSuccess(
        res,
        {
          user: result.user,
          tokens: {
            ...result.tokens,
            tokenType: 'Bearer',
          },
        },
        200,
        'Login successful.',
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logout(
        req.user!.sessionId,
        req.user!.id,
        req.ip ?? 'unknown',
        req.get('user-agent') ?? 'unknown',
      );
      sendSuccess(res, null, 200, 'Logged out successfully.');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      sendSuccess(res, tokens, 200, 'Token refreshed.');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async setupMfa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.setupMfa(req.user!.id, req.user!.email);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async verifyMfa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyMfa(req.user!.id, req.body.token);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
