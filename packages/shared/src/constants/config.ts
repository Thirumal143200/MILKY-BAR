/**
 * @module @milkboy/shared/constants/config
 * Application-wide configuration constants.
 */

/** Image upload constraints */
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_SCAN: 5,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  THUMBNAIL_WIDTH: 200,
  THUMBNAIL_HEIGHT: 200,
  PROCESSED_MAX_WIDTH: 1024,
  PROCESSED_MAX_HEIGHT: 1024,
  QUALITY_COMPRESSION: 85,
} as const;

/** Image quality thresholds */
export const QUALITY_THRESHOLDS = {
  MIN_BLUR_SCORE: 0.4,
  MIN_LIGHTING_SCORE: 0.3,
  MIN_FOCUS_SCORE: 0.5,
  MAX_NOISE_LEVEL: 0.6,
  MIN_OVERALL_SCORE: 0.5,
  REFLECTION_THRESHOLD: 0.7,
} as const;

/** AI inference configuration */
export const AI_CONFIG = {
  DEFAULT_CONFIDENCE_THRESHOLD: 0.6,
  MIN_CONFIDENCE_THRESHOLD: 0.3,
  MAX_CONFIDENCE_THRESHOLD: 0.95,
  MAX_INFERENCE_TIMEOUT_MS: 30000,
  MODEL_INPUT_SIZE: 224,
  BATCH_SIZE: 16,
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

/** Security constants */
export const SECURITY = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  MFA_CODE_LENGTH: 6,
  MFA_CODE_EXPIRY_SECONDS: 300,
  BCRYPT_ROUNDS: 12,
  SESSION_MAX_AGE_HOURS: 24,
  MAX_SESSIONS_PER_USER: 5,
} as const;

/** Rate limiting */
export const RATE_LIMITS = {
  GENERAL: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  UPLOAD: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
  AI_INFERENCE: { windowMs: 60 * 60 * 1000, maxRequests: 30 },
} as const;

/** Batch limits */
export const BATCH_CONFIG = {
  MAX_SCANS_PER_BATCH: 50,
  MAX_CONCURRENT_PROCESSING: 5,
} as const;

/** Report configuration */
export const REPORT_CONFIG = {
  QR_CODE_SIZE: 200,
  PDF_PAGE_SIZE: 'A4' as const,
  MAX_IMAGES_PER_REPORT: 10,
} as const;

/** Supported languages */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
] as const;

/** Date formats */
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  FILE_NAME: 'yyyy-MM-dd_HH-mm-ss',
} as const;
