/**
 * @module utils/crypto
 * Cryptographic utilities for password hashing, token generation, etc.
 */

import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { SECURITY } from '@milkboy/shared';

/**
 * Hash a password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS);
}

/**
 * Compare a plain text password with a bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token (hex encoded).
 */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a random UUID v4.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Hash a token for safe database storage (SHA-256).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a TOTP secret for MFA setup.
 */
export function generateMfaSecret(): string {
  return crypto.randomBytes(20).toString('hex');
}

/**
 * Generate a numeric OTP code.
 */
export function generateOtp(length = SECURITY.MFA_CODE_LENGTH): string {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i]! % digits.length];
  }
  return otp;
}
