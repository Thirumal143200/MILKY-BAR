import { apiGet, apiPost, apiDelete, apiUpload } from './client';
import type { Scan, ScanResult } from '@milkboy/shared';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface CreateScanData {
  title?: string;
  notes?: string;
  location?: { latitude?: number; longitude?: number; address?: string };
}

/** Scans API module */
export const scansApi = {
  list: (token: string, params?: { page?: number; limit?: number; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiGet<PaginatedResponse<Scan>>(`/scans${qs ? `?${qs}` : ''}`, token);
  },

  create: (token: string, data: CreateScanData) => apiPost<Scan>('/scans', data, token),

  get: (token: string, scanId: string) => apiGet<ScanResult>(`/scans/${scanId}`, token),

  delete: (token: string, scanId: string) => apiDelete(`/scans/${scanId}`, token),

  uploadImage: (token: string, scanId: string, formData: FormData) =>
    apiUpload<{ imageId: string }>(`/scans/${scanId}/images`, formData, token),

  analyze: (token: string, scanId: string) =>
    apiPost<{ jobId: string }>(`/scans/${scanId}/analyze`, {}, token),

  downloadReport: async (token: string, scanId: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/reports/${scanId}/download`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error('Download failed');
    return res.blob();
  },
};
