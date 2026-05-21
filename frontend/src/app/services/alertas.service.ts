import { Alerta } from '../types';
import { asDate, request } from './api-client';

function normalizeAlerta(alerta: any): Alerta {
  return {
    ...alerta,
    fecha: asDate(alerta.fecha),
  };
}

export const alertasService = {
  async getAlertas() {
    const data = await request<any[]>('/alertas');
    return data.map(normalizeAlerta);
  },

  async markAlertaRead(id: string) {
    const data = await request<any>(`/alertas/${id}`, {
      method: 'PUT',
    });
    return normalizeAlerta(data);
  },

  async markAllAlertasRead() {
    return request('/alertas', {
      method: 'PUT',
    });
  },
};
