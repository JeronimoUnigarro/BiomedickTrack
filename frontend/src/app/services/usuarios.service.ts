import { User } from '../types';
import { request } from './api-client';
import { authService } from './auth.service';

export const usuariosService = {
  async getUsuarios() {
    const data = await request<any[]>('/usuarios');
    return data.map(authService.normalizeUser);
  },

  async createUsuario(data: {
    nombre: string;
    apellido?: string;
    email: string;
    password: string;
    role: User['role'];
    telefono?: string;
  }) {
    const user = await request<any>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return authService.normalizeUser(user);
  },

  async updateUsuario(id: string, data: {
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    role?: User['role'];
    telefono?: string;
  }) {
    const user = await request<any>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return authService.normalizeUser(user);
  },

  async deleteUsuario(id: string) {
    return request(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },
};
