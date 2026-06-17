import { authStorage } from '@/shared/lib/auth-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Ошибка запроса' }));
    if (response.status === 401) {
      authStorage.clearToken();
      if (typeof window !== 'undefined') window.location.replace('/login');
    }
    throw new ApiError(response.status, body.message || 'Ошибка запроса');
  }

  return response.json();
}
