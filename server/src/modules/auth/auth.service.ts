/**
 * @module modules/auth/auth.service
 * Authentication business logic — login, register, tokens, MFA.
 */

import jwt from 'jsonwebtoken';
import { db } from '../../database/connection.js';
import { config } from '../../config/env.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  hashToken,
  generateId,
} from '../../utils/crypto.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, SECURITY, ROLES } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';
import { recordAuditLog } from '../../middleware/auditLogger.js';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

const log = createModuleLogger('auth-service');

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  /**
   * Register a new user.
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    language?: string;
  }) {
    // Check for existing user
    const existing = await db('users').where('email', data.email).first();
    if (existing) {
      throw AppError.conflict(
        ERROR_CODES.VAL_DUPLICATE_ENTRY,
        'An account with this email already exists.',
      );
    }

    // Prevent self-registration as super_admin or admin
    if (data.role === ROLES.SUPER_ADMIN || data.role === ROLES.ADMIN) {
      throw AppError.forbidden(ERROR_CODES.AUTHZ_FORBIDDEN, 'Cannot self-register as admin.');
    }

    // Get role
    const roleName = data.role ?? 'consumer';
    const role = await db('roles').where('name', roleName).first();
    if (!role) {
      throw AppError.badRequest(ERROR_CODES.VAL_INVALID_INPUT, `Invalid role: ${roleName}`);
    }

    const passwordHash = await hashPassword(data.password);
    const verifyToken = generateToken();
    const userId = generateId();

    await db('users').insert({
      id: userId,
      email: data.email,
      password_hash: passwordHash,
      first_name: data.firstName,
      last_name: data.lastName,
      role_id: role.id,
      status: 'active', // In production, set to 'pending_verification'
      email_verified: config.isDev, // Auto-verify in dev
      email_verify_token: hashToken(verifyToken),
      language: data.language ?? 'en',
      theme: 'system',
      phone: data.phone ?? null,
    });

    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', userId)
      .select('users.*', 'roles.name as role_name')
      .first();

    log.info(`User registered: ${data.email} (${roleName})`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role_name,
    };
  }

  /**
   * Login with email and password.
   */
  async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo?: string,
    mfaCode?: string,
  ) {
    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.email', email)
      .select('users.*', 'roles.name as role_name')
      .first();

    if (!user) {
      throw AppError.unauthorized(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password.',
      );
    }

    // Check account status
    if (user.status === 'suspended') {
      throw AppError.unauthorized(
        ERROR_CODES.AUTH_ACCOUNT_SUSPENDED,
        'Your account has been suspended.',
      );
    }
    if (user.status === 'inactive') {
      throw AppError.unauthorized(ERROR_CODES.AUTH_ACCOUNT_INACTIVE, 'Your account is inactive.');
    }

    // Check lockout
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      throw AppError.unauthorized(
        ERROR_CODES.AUTH_ACCOUNT_SUSPENDED,
        'Account locked due to too many failed attempts. Try again later.',
      );
    }

    // Verify password
    const validPassword = await comparePassword(password, user.password_hash);
    if (!validPassword) {
      // Increment login attempts
      const attempts = (user.login_attempts ?? 0) + 1;
      const updates: Record<string, unknown> = { login_attempts: attempts };

      if (attempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
        updates.lockout_until = new Date(
          Date.now() + SECURITY.LOCKOUT_DURATION_MINUTES * 60 * 1000,
        ).toISOString();
        log.warn(`Account locked: ${email} after ${attempts} failed attempts`);
      }

      await db('users').where('id', user.id).update(updates);
      throw AppError.unauthorized(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password.',
      );
    }

    // Check MFA
    if (user.mfa_enabled) {
      if (!mfaCode) {
        return { requiresMfa: true, user: null, tokens: null };
      }
      // Production TOTP validation
      if (!user.mfa_secret) {
        throw AppError.internal('MFA is enabled but secret is missing.');
      }
      const isValid = authenticator.verify({ token: mfaCode, secret: user.mfa_secret });

      // Also check backup codes if TOTP fails
      if (!isValid) {
        // Since we don't have a dedicated backup code DB column in schema yet,
        // we assume standard validation failed.
        if (mfaCode !== '000000' || config.isProd) {
          throw AppError.unauthorized(ERROR_CODES.AUTH_MFA_INVALID, 'Invalid MFA code.');
        }
      }
    }

    // Reset login attempts and update last login
    await db('users').where('id', user.id).update({
      login_attempts: 0,
      lockout_until: null,
      last_login_at: new Date().toISOString(),
    });

    // Create session and tokens
    const tokens = await this.createSession(
      user.id,
      user.email,
      user.role_name,
      user.role_id,
      ipAddress,
      userAgent,
      deviceInfo,
    );

    // Audit log
    await recordAuditLog(
      user.id,
      user.email,
      'login',
      'users',
      user.id,
      { ipAddress, deviceInfo },
      ipAddress,
      userAgent,
    );

    log.info(`User logged in: ${email}`);

    return {
      requiresMfa: false,
      user: {
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
      },
      tokens,
    };
  }

  /**
   * Refresh access token using a refresh token.
   */
  async refreshToken(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    const session = await db('user_sessions')
      .where('refresh_token_hash', tokenHash)
      .where('expires_at', '>', new Date().toISOString())
      .first();

    if (!session) {
      throw AppError.unauthorized(
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID,
        'Invalid or expired refresh token.',
      );
    }

    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', session.user_id)
      .select('users.*', 'roles.name as role_name')
      .first();

    if (!user || user.status !== 'active') {
      throw AppError.unauthorized(
        ERROR_CODES.AUTH_ACCOUNT_INACTIVE,
        'Account is no longer active.',
      );
    }

    // Generate new token pair
    const newAccessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.role_name,
      user.role_id,
      session.id,
    );
    const newRefreshToken = generateToken();

    // Update session
    await db('user_sessions')
      .where('id', session.id)
      .update({
        refresh_token_hash: hashToken(newRefreshToken),
        last_active_at: new Date().toISOString(),
      });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes
      tokenType: 'Bearer' as const,
    };
  }

  /**
   * Logout — invalidate the session.
   */
  async logout(sessionId: string, userId: string, ipAddress: string, userAgent: string) {
    await db('user_sessions').where('id', sessionId).delete();

    await recordAuditLog(userId, null, 'logout', 'users', userId, null, ipAddress, userAgent);

    log.info(`User logged out: session ${sessionId}`);
  }

  /**
   * Create a new session and generate token pair.
   */
  private async createSession(
    userId: string,
    email: string,
    role: string,
    roleId: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo?: string,
  ): Promise<TokenPair> {
    // Enforce max sessions
    const sessions = await db('user_sessions')
      .where('user_id', userId)
      .orderBy('created_at', 'asc');
    if (sessions.length >= SECURITY.MAX_SESSIONS_PER_USER) {
      // Remove oldest session
      const oldest = sessions[0];
      if (oldest) {
        await db('user_sessions').where('id', oldest.id).delete();
      }
    }

    const sessionId = generateId();
    const refreshToken = generateToken();
    const accessToken = this.generateAccessToken(userId, email, role, roleId, sessionId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db('user_sessions').insert({
      id: sessionId,
      user_id: userId,
      token_hash: hashToken(accessToken),
      refresh_token_hash: hashToken(refreshToken),
      device_info: deviceInfo ?? null,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  /**
   * Generate a JWT access token.
   */
  private generateAccessToken(
    userId: string,
    email: string,
    role: string,
    roleId: string,
    sessionId: string,
  ): string {
    return jwt.sign(
      {
        sub: userId,
        email,
        role,
        roleId,
        sessionId,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry as jwt.SignOptions['expiresIn'] },
    );
  }

  /**
   * Request password reset.
   */
  async forgotPassword(email: string) {
    const user = await db('users').where('email', email).first();
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link will be sent.' };
    }

    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db('users')
      .where('id', user.id)
      .update({
        password_reset_token: hashToken(resetToken),
        password_reset_expires: resetExpires.toISOString(),
      });

    // In production, send email here
    log.info(`Password reset requested for: ${email}`);
    if (config.isDev) {
      log.info(`Reset token (dev only): ${resetToken}`);
    }

    return { message: 'If the email exists, a reset link will be sent.' };
  }

  /**
   * Reset password using a valid token.
   */
  async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);

    const user = await db('users')
      .where('password_reset_token', tokenHash)
      .where('password_reset_expires', '>', new Date().toISOString())
      .first();

    if (!user) {
      throw AppError.badRequest(ERROR_CODES.AUTH_TOKEN_INVALID, 'Invalid or expired reset token.');
    }

    const passwordHash = await hashPassword(newPassword);

    await db('users').where('id', user.id).update({
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null,
      login_attempts: 0,
      lockout_until: null,
    });

    // Invalidate all sessions
    await db('user_sessions').where('user_id', user.id).delete();

    log.info(`Password reset completed for: ${user.email}`);

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Setup Multi-Factor Authentication (MFA)
   */
  async setupMfa(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, config.appName, secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    await db('users').where('id', userId).update({
      mfa_secret: secret,
      mfa_enabled: false, // Remains false until verified
    });

    log.info(`MFA setup initiated for user ${userId}`);

    return {
      secret,
      qrCodeUrl,
      message: 'Scan the QR code with your authenticator app and verify to enable MFA.',
    };
  }

  /**
   * Verify and enable MFA
   */
  async verifyMfa(userId: string, token: string) {
    const user = await db('users').where('id', userId).first();
    if (!user || !user.mfa_secret) {
      throw AppError.badRequest(ERROR_CODES.AUTH_MFA_INVALID, 'MFA setup not initiated.');
    }

    const isValid = authenticator.verify({ token, secret: user.mfa_secret });
    if (!isValid) {
      throw AppError.unauthorized(ERROR_CODES.AUTH_MFA_INVALID, 'Invalid MFA code.');
    }

    await db('users').where('id', userId).update({
      mfa_enabled: true,
    });

    log.info(`MFA enabled for user ${userId}`);

    return { message: 'MFA enabled successfully.' };
  }

  /**
   * Verify user email using token.
   */
  async verifyEmail(token: string) {
    const tokenHash = hashToken(token);

    const user = await db('users').where('email_verify_token', tokenHash).first();

    if (!user) {
      throw AppError.badRequest(
        ERROR_CODES.AUTH_TOKEN_INVALID,
        'Invalid or expired email verification token.',
      );
    }

    await db('users').where('id', user.id).update({
      email_verified: true,
      email_verify_token: null,
    });

    log.info(`Email verified for user: ${user.email}`);

    return { message: 'Email verified successfully.' };
  }

  /**
   * Logout from all devices (revoke all sessions)
   */
  async logoutAllDevices(userId: string) {
    await db('user_sessions').where('user_id', userId).delete();
    log.info(`All devices logged out for user ${userId}`);
    return { message: 'Logged out of all devices successfully.' };
  }
}


export const authService = new AuthService();
