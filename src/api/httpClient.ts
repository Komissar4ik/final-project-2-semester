const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? 'https://nexus-social-backend.onrender.com/api'
  : 'http://localhost:3000/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export { API_BASE_URL };

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function toAbsoluteMediaUrl(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { body, ...requestOptions } = options;
  const headers = new Headers(options.headers);
  const isFormData = body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    credentials: 'include',
    headers,
    body: isFormData ? body : JSON.stringify(body ?? undefined),
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join(', ');
      } else if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Keep the generic status message when the backend returns no JSON body.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export const apiClient = {
  get: <TResponse>(path: string) => apiRequest<TResponse>(path),
  post: <TResponse>(path: string, body?: RequestOptions['body']) =>
    apiRequest<TResponse>(path, { method: 'POST', body }),
  put: <TResponse>(path: string, body?: RequestOptions['body']) =>
    apiRequest<TResponse>(path, { method: 'PUT', body }),
  patch: <TResponse>(path: string, body?: RequestOptions['body']) =>
    apiRequest<TResponse>(path, { method: 'PATCH', body }),
  delete: <TResponse>(path: string) =>
    apiRequest<TResponse>(path, { method: 'DELETE' }),
};
