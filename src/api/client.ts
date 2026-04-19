import { API_BASE_URL, API_KEY, API_PREFIX } from './config';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type TokenProvider = () => Promise<string | null>;

/**
 * Low-level request helper. Accepts a token provider so callers can inject
 * the Clerk JWT. Absolute URLs bypass the /api/v1 prefix.
 */
export async function apiRequest<T>(
  path: string,
  getToken: TokenProvider,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options;
  const token = await getToken();

  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/api/') ? '' : API_PREFIX}${
        path.startsWith('/') ? path : `/${path}`
      }`;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (API_KEY && !finalHeaders['X-API-Key']) finalHeaders['X-API-Key'] = API_KEY;

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === 'object' && 'detail' in (parsed as Record<string, unknown>)
        ? String((parsed as Record<string, unknown>).detail)
        : res.statusText) || 'Request failed';
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}
