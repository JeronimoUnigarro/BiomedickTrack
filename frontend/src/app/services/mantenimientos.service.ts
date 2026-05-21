import { Bitacora, Mantenimiento } from '../types';
import { asDate, request } from './api-client';

function normalizeMantenimiento(mantenimiento: any): Mantenimiento {
  return {
    ...mantenimiento,
    fecha: asDate(mantenimiento.fecha),
    createdAt: asDate(mantenimiento.createdAt),
    repuestos: Array.isArray(mantenimiento.repuestos) ? mantenimiento.repuestos : [],
  };
}

function normalizeBitacora(bitacora: any): Bitacora {
  return {
    ...bitacora,
    fecha: asDate(bitacora.fecha),
  };
}

export const mantenimientosService = {
  async getMantenimientos() {
    const data = await request<any[]>('/mantenimientos');
    return data.map(normalizeMantenimiento);
  },

  async createMantenimiento(data: Record<string, unknown>) {
    const mantenimiento = await request<any>('/mantenimientos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeMantenimiento(mantenimiento);
  },

  async updateMantenimiento(id: string, data: Record<string, unknown>) {
    const mantenimiento = await request<any>(`/mantenimientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return normalizeMantenimiento(mantenimiento);
  },

  async deleteMantenimiento(id: string) {
    return request(`/mantenimientos/${id}`, {
      method: 'DELETE',
    });
  },

  async getBitacoras(): Promise<Bitacora[]> {
    const data = await request<any[]>('/bitacora');
    return data.map(normalizeBitacora);
  },
};
