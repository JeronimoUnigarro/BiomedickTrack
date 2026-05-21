import { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alerta } from '../types';
import { api } from '../services/api';

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [filter, setFilter] = useState<'todas' | 'alta' | 'media' | 'baja'>('todas');

  useEffect(() => {
    api.getAlertas()
      .then(setAlertas)
      .catch((error) => toast.error(error.message));
  }, []);

  const filteredAlertas = alertas.filter(a =>
    filter === 'todas' || a.prioridad === filter
  );

  const marcarComoLeida = async (id: string) => {
    try {
      const alerta = await api.markAlertaRead(id);
      setAlertas(alertas.map(a => a.id === id ? alerta : a));
      toast.success('Alerta marcada como leida');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar la alerta');
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.markAllAlertasRead();
      setAlertas(alertas.map(a => ({ ...a, leida: true })));
      toast.success('Todas las alertas marcadas como leidas');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron actualizar las alertas');
    }
  };

  const getIconoAlerta = (tipo: string) => {
    switch (tipo) {
      case 'mantenimiento_vencido':
      case 'equipo_inactivo':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'mantenimiento_proximo':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'equipo_critico':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'border-red-500 bg-red-50';
      case 'media':
        return 'border-yellow-500 bg-yellow-50';
      case 'baja':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas del Sistema</h1>
          <p className="text-gray-600 mt-1">
            Notificaciones y alertas importantes sobre equipos
          </p>
        </div>
        <button
          onClick={marcarTodasLeidas}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Marcar todas como leidas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Alertas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{alertas.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">No Leidas</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{alertas.filter(a => !a.leida).length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Alta Prioridad</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{alertas.filter(a => a.prioridad === 'alta').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Leidas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{alertas.filter(a => a.leida).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-3">
          {(['todas', 'alta', 'media', 'baja'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === item
                  ? item === 'alta'
                    ? 'bg-red-600 text-white'
                    : item === 'media'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item === 'todas' ? 'Todas' : `${item.charAt(0).toUpperCase()}${item.slice(1)} Prioridad`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAlertas.map((alerta) => (
          <div
            key={alerta.id}
            className={`border-l-4 rounded-lg p-6 transition-all ${getPrioridadColor(alerta.prioridad)} ${!alerta.leida ? 'shadow-md' : 'opacity-75'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  alerta.prioridad === 'alta' ? 'bg-red-100' :
                  alerta.prioridad === 'media' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {getIconoAlerta(alerta.tipo)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{alerta.equipoNombre}</h3>
                    {!alerta.leida && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                  </div>
                  <p className="text-gray-700 mb-3">{alerta.mensaje}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Fecha: {alerta.fecha.toLocaleDateString('es-CO')}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alerta.prioridad === 'alta' ? 'bg-red-200 text-red-800' :
                      alerta.prioridad === 'media' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {alerta.prioridad.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              {!alerta.leida && (
                <button
                  onClick={() => marcarComoLeida(alerta.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Marcar como leida"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredAlertas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No hay alertas en esta categoria</p>
          </div>
        )}
      </div>
    </div>
  );
}
