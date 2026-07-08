/**
 * @module @milkboy/shared/utils
 * Pure utility functions shared across the platform.
 */

import type { ResponseMeta } from '../types/api.types.js';

/**
 * Build pagination metadata from query results.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): ResponseMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Calculate offset for SQL queries.
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Format a user's full name.
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Mask an email address for display (e.g., "j***@example.com").
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const masked = local.length > 2
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : `${local[0]}${'*'.repeat(Math.max(local.length - 1, 1))}`;
  return `${masked}@${domain}`;
}

/**
 * Format file size in human-readable format.
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format duration in milliseconds to human-readable.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Get quality label color for UI display.
 */
export function getQualityColor(label: string): string {
  const colors: Record<string, string> = {
    excellent: '#10B981',
    good: '#34D399',
    acceptable: '#FBBF24',
    poor: '#F87171',
    adulterated: '#EF4444',
    spoiled: '#DC2626',
    inconclusive: '#9CA3AF',
  };
  return colors[label] ?? '#6B7280';
}

/**
 * Get confidence level description.
 */
export function getConfidenceLevel(confidence: number): {
  level: 'high' | 'medium' | 'low';
  label: string;
  color: string;
} {
  if (confidence >= 0.85) return { level: 'high', label: 'High Confidence', color: '#10B981' };
  if (confidence >= 0.6) return { level: 'medium', label: 'Medium Confidence', color: '#FBBF24' };
  return { level: 'low', label: 'Low Confidence', color: '#F87171' };
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Deep clone an object (using structuredClone).
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

/**
 * Generate a random hex color.
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Check if a string is a valid UUID v4.
 */
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Safe JSON parse that returns undefined on failure.
 */
export function safeJsonParse<T>(json: string): T | undefined {
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

/**
 * Delay execution (for retry logic, etc.)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
