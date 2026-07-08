/**
 * @module utils/AppError
 * Custom application error class for structured error handling.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, string[]>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    options?: {
      isOperational?: boolean;
      details?: Record<string, string[]>;
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;

    Error.captureStackTrace(this, this.constructor);
  }

  /** 400 Bad Request */
  static badRequest(code: string, message: string, details?: Record<string, string[]>) {
    return new AppError(400, code, message, { details });
  }

  /** 401 Unauthorized */
  static unauthorized(code: string, message: string) {
    return new AppError(401, code, message);
  }

  /** 403 Forbidden */
  static forbidden(code: string, message: string) {
    return new AppError(403, code, message);
  }

  /** 404 Not Found */
  static notFound(code: string, message: string) {
    return new AppError(404, code, message);
  }

  /** 409 Conflict */
  static conflict(code: string, message: string) {
    return new AppError(409, code, message);
  }

  /** 422 Unprocessable Entity */
  static unprocessable(code: string, message: string, details?: Record<string, string[]>) {
    return new AppError(422, code, message, { details });
  }

  /** 429 Too Many Requests */
  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new AppError(429, 'SYS_006', message);
  }

  /** 500 Internal Server Error */
  static internal(message = 'An unexpected error occurred.') {
    return new AppError(500, 'SYS_001', message, { isOperational: false });
  }
}
