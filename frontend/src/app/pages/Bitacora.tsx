import { useEffect, useState } from 'react';
import { Activity, Filter } from 'lucide-react';
import { Bitacora as BitacoraType, Equipo } from '../types';
import { api } from '../services/api';

export default function Bitacora() {
  const [bitacoras, setBitacoras] = useState<BitacoraType[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  useEffect(() => {
    Promise.all([api.getBitacoras(), api.getEquipos()])
      .then(([bitacorasData, equiposData]) => {
        setBitacoras(bitacorasData);
        setEquipos(equiposData);
      })
      .catch(() => {
        setBitacoras([]);
        setEquipos([]);
      });
  }, []);

  const getEquipoNombre = (equipoId: string) => {
    return equipos.find(e => e.id === equipoId)?.nombre || 'Equipo no encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bitácora de Actividades</h1>
        <p className="text-gray-600 mt-1">
          Registro cronológico de todas las actividades y operaciones
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Registros</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{bitacoras.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Este Mes</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {bitacoras.filter(b => b.fecha.getMonth() === new Date().getMonth()).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Con Firma Digital</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {bitacoras.filter(b => b.firmaDigital).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Usuarios Activos</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {new Set(bitacoras.map(b => b.usuario)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            aria-label="Buscar en bitacora"
            placeholder="Buscar en bitácora..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            aria-label="Filtrar bitacora por fecha"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Línea de Tiempo
        </h3>
        
        <div className="space-y-6">
          {bitacoras.map((bit, index) => (
            <div key={bit.id} className="relative">
              {/* Timeline line */}
              {index !== bitacoras.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
              )}
              
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{bit.accion}</h4>
                        <p className="text-sm text-gray-600">{getEquipoNombre(bit.equipoId)}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {bit.fecha.toLocaleString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{bit.detalles}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-600">
                        👤 {bit.usuario}
                      </span>
                      
                      {bit.firmaDigital && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-medium">✓ Firmado</span>
                          <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200">
                            {bit.firmaDigital}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
