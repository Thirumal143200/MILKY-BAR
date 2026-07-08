/**
 * @module @milkboy/shared/validators
 * Zod validation schemas shared between frontend and backend.
 */

import { z } from 'zod';
import { SECURITY, IMAGE_CONFIG, PAGINATION, BATCH_CONFIG } from '../constants/config.js';

// ─── Auth Schemas ───────────────────────────────────────────

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email is too long')
  .transform((v) => v.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(SECURITY.PASSWORD_MIN_LENGTH, `Password must be at least ${SECURITY.PASSWORD_MIN_LENGTH} characters`)
  .max(SECURITY.PASSWORD_MAX_LENGTH, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().length(SECURITY.MFA_CODE_LENGTH).optional(),
  deviceInfo: z.string().max(500).optional(),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  role: z.enum(['producer', 'consumer', 'lab_staff']).optional().default('consumer'),
  phone: z.string().max(20).optional(),
  language: z.enum(['en', 'es', 'fr', 'hi', 'ta']).optional().default('en'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const mfaSetupSchema = z.object({
  password: z.string().min(1, 'Password is required for MFA setup'),
});

export const mfaVerifySchema = z.object({
  code: z.string().length(SECURITY.MFA_CODE_LENGTH, `Code must be ${SECURITY.MFA_CODE_LENGTH} digits`),
});

// ─── User Schemas ───────────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  phone: z.string().max(20).optional().nullable(),
  language: z.enum(['en', 'es', 'fr', 'hi', 'ta']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const updateUserAdminSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  role: z.enum(['admin', 'producer', 'consumer', 'lab_staff']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  email: emailSchema.optional(),
});

// ─── Scan Schemas ───────────────────────────────────────────

export const createScanSchema = z.object({
  title: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    address: z.string().max(500).optional(),
  }).optional(),
});

// ─── Batch Schemas ──────────────────────────────────────────

export const createBatchSchema = z.object({
  name: z.string().min(1, 'Batch name is required').max(200),
  description: z.string().max(2000).optional(),
});

export const addScansToBatchSchema = z.object({
  scanIds: z
    .array(z.string().uuid())
    .min(1, 'At least one scan is required')
    .max(BATCH_CONFIG.MAX_SCANS_PER_BATCH, `Maximum ${BATCH_CONFIG.MAX_SCANS_PER_BATCH} scans per batch`),
});

// ─── Lab Schemas ────────────────────────────────────────────

export const labValidationSchema = z.object({
  result: z.enum(['confirmed', 'rejected', 'inconclusive']),
  notes: z.string().max(2000).optional(),
  parameters: z.object({
    fatContent: z.number().min(0).max(100).optional(),
    proteinContent: z.number().min(0).max(100).optional(),
    lactoseContent: z.number().min(0).max(100).optional(),
    snf: z.number().min(0).max(100).optional(),
    ph: z.number().min(0).max(14).optional(),
    density: z.number().min(0).optional(),
    temperature: z.number().min(-50).max(100).optional(),
    adulterants: z.array(z.string()).optional(),
  }).optional(),
});

// ─── Feedback Schemas ───────────────────────────────────────

export const feedbackSchema = z.object({
  type: z.enum(['feedback', 'bug_report', 'feature_request']),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
});

// ─── Admin Schemas ──────────────────────────────────────────

export const featureFlagSchema = z.object({
  enabled: z.boolean(),
});

export const systemSettingSchema = z.object({
  value: z.string().min(1).max(5000),
});

// ─── Pagination Schema ─────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(PAGINATION.MIN_LIMIT).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().max(200).optional(),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ─── Image Upload Validation ────────────────────────────────

export const imageUploadSchema = z.object({
  mimeType: z.enum(IMAGE_CONFIG.ALLOWED_MIME_TYPES as unknown as [string, ...string[]]),
  fileSize: z.number().max(IMAGE_CONFIG.MAX_FILE_SIZE, 'File size exceeds maximum allowed'),
});

// ─── Export Types ───────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateScanInput = z.infer<typeof createScanSchema>;
export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type LabValidationInput = z.infer<typeof labValidationSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
