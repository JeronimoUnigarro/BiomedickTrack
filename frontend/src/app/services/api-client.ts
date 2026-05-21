const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

function getToken() {
  return localStorage.getItem('biomedic_token');
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error ?? 'Error de comunicacion con el servidor');
  }

  return payload.data as T;
}

export function asDate(value: unknown): Date {
  return value ? new Date(String(value)) : new Date('');
}

export function optionalDate(value: unknown): Date | undefined {
  return value ? new Date(String(value)) : undefined;
}
