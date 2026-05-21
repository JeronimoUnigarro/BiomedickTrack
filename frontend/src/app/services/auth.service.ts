import { User } from '../types';
import { asDate, request } from './api-client';

function normalizeUser(user: any): User {
  return {
    ...user,
    role: user.role ?? (user.rol === 'GERENCIA' ? 'gerencia' : 'ingeniero'),
    apellido: user.apellido ?? '',
    createdAt: asDate(user.createdAt),
  };
}

export const authService = {
  async login(email: string, password: string) {
    return request<{ requires2FA: true; email: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async verifyTwoFactor(email: string, code: string) {
    const data = await request<{ token: string; user: User }>('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    return {
      token: data.token,
      user: normalizeUser(data.user),
    };
  },

  async recover(email: string) {
    return request('/auth/recover', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  async registerGerencia(data: {
    nombre: string;
    apellido?: string;
    email: string;
    password: string;
    telefono?: string;
  }) {
    const user = await request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        role: 'gerencia',
      }),
    });
    return normalizeUser(user);
  },

  normalizeUser,
};
