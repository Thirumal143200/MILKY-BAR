/**
 * @module @milkboy/shared/types/api
 * API request/response wrapper types and common patterns.
 */

/** Standard API success response */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    stack?: string;
  };
}

/** Pagination & count metadata */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  unreadCount?: number;
}

/** Paginated query params */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/** Date range filter */
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

/** Scan list query params */
export interface ScanListParams extends PaginationParams, DateRangeFilter {
  status?: string;
  qualityLabel?: string;
}

/** User list query params (admin) */
export interface UserListParams extends PaginationParams {
  role?: string;
  status?: string;
}

/** Audit log query params */
export interface AuditLogParams extends PaginationParams, DateRangeFilter {
  action?: string;
  userId?: string;
  resource?: string;
}

/** Export format */
export type ExportFormat = 'csv' | 'pdf' | 'json';

/** Export request */
export interface ExportRequest {
  format: ExportFormat;
  filters?: Record<string, string>;
  columns?: string[];
}

/** Batch operation result */
export interface BatchOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    message: string;
  }>;
}
