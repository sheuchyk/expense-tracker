import { apiRequest } from '@/shared/api/base';
import type { AuthResponse, User } from '@/entities/user/model/types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (dto: LoginDto) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  register: (dto: RegisterDto) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  me: () => apiRequest<User>('/auth/me'),
};
