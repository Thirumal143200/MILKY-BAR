/**
 * @module @milkboy/shared/constants/errors
 * Standardized error codes used across the platform.
 */

export const ERROR_CODES = {
  // Authentication errors (AUTH_xxx)
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_TOKEN_INVALID: 'AUTH_003',
  AUTH_REFRESH_TOKEN_INVALID: 'AUTH_004',
  AUTH_MFA_REQUIRED: 'AUTH_005',
  AUTH_MFA_INVALID: 'AUTH_006',
  AUTH_ACCOUNT_SUSPENDED: 'AUTH_007',
  AUTH_ACCOUNT_INACTIVE: 'AUTH_008',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_009',
  AUTH_SESSION_EXPIRED: 'AUTH_010',

  // Authorization errors (AUTHZ_xxx)
  AUTHZ_FORBIDDEN: 'AUTHZ_001',
  AUTHZ_INSUFFICIENT_ROLE: 'AUTHZ_002',
  AUTHZ_RESOURCE_NOT_OWNED: 'AUTHZ_003',

  // Validation errors (VAL_xxx)
  VAL_INVALID_INPUT: 'VAL_001',
  VAL_MISSING_FIELD: 'VAL_002',
  VAL_INVALID_FORMAT: 'VAL_003',
  VAL_DUPLICATE_ENTRY: 'VAL_004',
  VAL_PASSWORD_TOO_WEAK: 'VAL_005',

  // Resource errors (RES_xxx)
  RES_NOT_FOUND: 'RES_001',
  RES_ALREADY_EXISTS: 'RES_002',
  RES_CONFLICT: 'RES_003',
  RES_GONE: 'RES_004',

  // Image errors (IMG_xxx)
  IMG_UPLOAD_FAILED: 'IMG_001',
  IMG_INVALID_FORMAT: 'IMG_002',
  IMG_TOO_LARGE: 'IMG_003',
  IMG_QUALITY_TOO_LOW: 'IMG_004',
  IMG_PROCESSING_FAILED: 'IMG_005',
  IMG_BLUR_DETECTED: 'IMG_006',
  IMG_LOW_LIGHTING: 'IMG_007',
  IMG_REFLECTION_DETECTED: 'IMG_008',
  IMG_OUT_OF_FOCUS: 'IMG_009',

  // AI errors (AI_xxx)
  AI_MODEL_NOT_FOUND: 'AI_001',
  AI_MODEL_LOAD_FAILED: 'AI_002',
  AI_INFERENCE_FAILED: 'AI_003',
  AI_LOW_CONFIDENCE: 'AI_004',
  AI_PREPROCESSING_FAILED: 'AI_005',

  // Report errors (RPT_xxx)
  RPT_GENERATION_FAILED: 'RPT_001',
  RPT_NOT_READY: 'RPT_002',
  RPT_QR_GENERATION_FAILED: 'RPT_003',

  // System errors (SYS_xxx)
  SYS_INTERNAL_ERROR: 'SYS_001',
  SYS_DATABASE_ERROR: 'SYS_002',
  SYS_CACHE_ERROR: 'SYS_003',
  SYS_STORAGE_ERROR: 'SYS_004',
  SYS_QUEUE_ERROR: 'SYS_005',
  SYS_RATE_LIMIT: 'SYS_006',
  SYS_SERVICE_UNAVAILABLE: 'SYS_007',
  SYS_MAINTENANCE_MODE: 'SYS_008',
  SYS_BACKUP_FAILED: 'SYS_009',

  // Batch errors (BATCH_xxx)
  BATCH_TOO_LARGE: 'BATCH_001',
  BATCH_PROCESSING_FAILED: 'BATCH_002',
  BATCH_ALREADY_PROCESSING: 'BATCH_003',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** Human-readable error messages */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Invalid authentication token.',
  [ERROR_CODES.AUTH_MFA_REQUIRED]: 'Multi-factor authentication code is required.',
  [ERROR_CODES.AUTH_MFA_INVALID]: 'Invalid MFA code. Please try again.',
  [ERROR_CODES.AUTH_ACCOUNT_SUSPENDED]: 'Your account has been suspended. Contact support.',
  [ERROR_CODES.AUTH_ACCOUNT_INACTIVE]: 'Your account is inactive.',
  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email before logging in.',
  [ERROR_CODES.AUTHZ_FORBIDDEN]: 'You do not have permission to perform this action.',
  [ERROR_CODES.AUTHZ_INSUFFICIENT_ROLE]: 'Insufficient privileges for this operation.',
  [ERROR_CODES.VAL_INVALID_INPUT]: 'Invalid input provided.',
  [ERROR_CODES.VAL_DUPLICATE_ENTRY]: 'This entry already exists.',
  [ERROR_CODES.VAL_PASSWORD_TOO_WEAK]: 'Password does not meet security requirements.',
  [ERROR_CODES.RES_NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.IMG_QUALITY_TOO_LOW]: 'Image quality is too low for analysis.',
  [ERROR_CODES.IMG_BLUR_DETECTED]: 'The image appears blurry. Please retake.',
  [ERROR_CODES.IMG_LOW_LIGHTING]: 'Insufficient lighting. Move to a brighter area.',
  [ERROR_CODES.IMG_REFLECTION_DETECTED]: 'Reflections detected. Adjust the angle.',
  [ERROR_CODES.AI_LOW_CONFIDENCE]: 'AI confidence is too low for a reliable result.',
  [ERROR_CODES.SYS_RATE_LIMIT]: 'Too many requests. Please slow down.',
  [ERROR_CODES.SYS_MAINTENANCE_MODE]: 'System is under maintenance. Please try later.',
};
