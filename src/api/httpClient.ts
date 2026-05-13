const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown>;
};

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
    throw new Error(`API request failed with status ${response.status}`);
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
