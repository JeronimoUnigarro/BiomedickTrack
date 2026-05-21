import { Equipo } from '../types';
import { asDate, optionalDate, request } from './api-client';

function normalizeEquipo(equipo: any): Equipo {
  const legacyYear = equipo['aÃ±oFabricacion'];
  const year = equipo.añoFabricacion ?? equipo.anoFabricacion ?? legacyYear ?? new Date().getFullYear();

  return {
    ...equipo,
    añoFabricacion: year,
    ['aÃ±oFabricacion']: year,
    fechaAdquisicion: optionalDate(equipo.fechaAdquisicion) ?? new Date(),
    ultimoMantenimiento: optionalDate(equipo.ultimoMantenimiento),
    proximoMantenimiento: optionalDate(equipo.proximoMantenimiento),
    createdAt: asDate(equipo.createdAt),
    especificaciones: equipo.especificaciones ?? {},
    accesorios: Array.isArray(equipo.accesorios) ? equipo.accesorios : [],
  };
}

function normalizeEquipoPayload(data: Record<string, unknown>) {
  const payload = { ...data };

  if ('añoFabricacion' in payload) {
    payload.anoFabricacion = payload.añoFabricacion;
    delete payload.añoFabricacion;
  }

  if ('aÃ±oFabricacion' in payload) {
    payload.anoFabricacion = payload['aÃ±oFabricacion'];
    delete payload['aÃ±oFabricacion'];
  }

  return payload;
}

export const equiposService = {
  async getEquipos() {
    const data = await request<any[]>('/equipos');
    return data.map(normalizeEquipo);
  },

  async getEquipo(id: string) {
    const data = await request<any>(`/equipos/${id}`);
    return normalizeEquipo(data);
  },

  async createEquipo(data: Record<string, unknown>) {
    const equipo = await request<any>('/equipos', {
      method: 'POST',
      body: JSON.stringify(normalizeEquipoPayload(data)),
    });
    return normalizeEquipo(equipo);
  },

  async updateEquipo(id: string, data: Record<string, unknown>) {
    const equipo = await request<any>(`/equipos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(normalizeEquipoPayload(data)),
    });
    return normalizeEquipo(equipo);
  },

  async deleteEquipo(id: string) {
    return request(`/equipos/${id}`, {
      method: 'DELETE',
    });
  },
};
