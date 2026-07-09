import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date string for display */
export function formatDate(date: string | Date, fmt = 'MMM dd, yyyy') {
  return format(new Date(date), fmt);
}

/** Format a date as a relative time (e.g., "2 hours ago") */
export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Format file size in human-readable form */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Capitalize first letter */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Convert snake_case to Title Case */
export function snakeToTitle(str: string) {
  return str.split('_').map(capitalize).join(' ');
}

/** Generate initials from first and last name */
export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

/** Truncate a string to a max length */
export function truncate(str: string, max = 50) {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

/** Format a confidence score as a percentage */
export function formatConfidence(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

/** Delay utility for loading states */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Check if running on client side */
export const isClient = typeof window !== 'undefined';
