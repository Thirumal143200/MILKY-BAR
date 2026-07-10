/**
 * @module modules/auth/auth.routes
 * Authentication route definitions.
 */

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validator.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@milkboy/shared';

import { z } from 'zod';

const router = Router();

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// Public routes (rate limited)
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register.bind(authController),
);
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login.bind(authController),
);
router.post(
  '/verify-email',
  authLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail.bind(authController),
);
router.post(
  '/password/forgot',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController),
);
router.post(
  '/password/reset',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController),
);

// Authenticated routes
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/mfa/setup', authenticate, authController.setupMfa.bind(authController));
router.post('/mfa/verify', authenticate, authController.verifyMfa.bind(authController));

export { router as authRoutes };
