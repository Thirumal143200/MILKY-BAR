/** Base URL for all API requests */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type FetchOptions = RequestInit & {
  token?: string;
};

async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let code = 'UNKNOWN';
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { code?: string; message?: string };
      code = body.code ?? code;
      message = body.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) return undefined as T;

  const body = (await res.json()) as { data: T };
  return body.data;
}

/** Typed GET request */
export function apiGet<T>(path: string, token?: string): Promise<T> {
  return fetchJson<T>(path, { method: 'GET', token });
}

/** Typed POST request */
export function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  return fetchJson<T>(path, { method: 'POST', body: JSON.stringify(body), token });
}

/** Typed PATCH request */
export function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  return fetchJson<T>(path, { method: 'PATCH', body: JSON.stringify(body), token });
}

/** Typed DELETE request */
export function apiDelete<T = void>(path: string, token?: string): Promise<T> {
  return fetchJson<T>(path, { method: 'DELETE', token });
}

/** Multipart/form-data upload */
export async function apiUpload<T>(path: string, formData: FormData, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!res.ok) {
    const body = (await res.json()) as { code?: string; message?: string };
    throw new ApiError(res.status, body.code ?? 'UPLOAD_FAILED', body.message ?? 'Upload failed');
  }

  const body = (await res.json()) as { data: T };
  return body.data;
}
