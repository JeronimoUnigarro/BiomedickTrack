import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Package, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Equipo } from '../types';
import { api } from '../services/api';

export default function Criticidad() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  useEffect(() => {
    api.getEquipos().then(setEquipos).catch(() => setEquipos([]));
  }, []);

  const equiposCriticidadAlta = equipos.filter(e => e.criticidad === 'alta');
  const equiposCriticidadMedia = equipos.filter(e => e.criticidad === 'media');
  const equiposCriticidadBaja = equipos.filter(e => e.criticidad === 'baja');

  const criticidadData = [
    { name: 'Alta', value: equiposCriticidadAlta.length, color: '#ef4444' },
    { name: 'Media', value: equiposCriticidadMedia.length, color: '#f59e0b' },
    { name: 'Baja', value: equiposCriticidadBaja.length, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Criticidad</h1>
        <p className="text-gray-600 mt-1">
          Clasificación de equipos por nivel de criticidad operacional
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Equipos</p>
              <p className="text-3xl font-bold text-gray-900">{equipos.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 mb-1">Criticidad Alta</p>
              <p className="text-4xl font-bold">{equiposCriticidadAlta.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 mb-1">Criticidad Media</p>
              <p className="text-4xl font-bold">{equiposCriticidadMedia.length}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Criticidad Baja</p>
              <p className="text-4xl font-bold">{equiposCriticidadBaja.length}</p>
            </div>
            <Shield className="w-10 h-10 text-green-200" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución de Criticidad</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={criticidadData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {criticidadData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            {criticidadData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm text-gray-600">
                    {equipos.length ? ((item.value / equipos.length) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Criticidad Alta */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Equipos de Alta Criticidad</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Equipos esenciales para la operación hospitalaria que requieren monitoreo constante
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equiposCriticidadAlta.map((equipo) => (
            <div
              key={equipo.id}
              className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
            >
              <h4 className="font-semibold text-gray-900 mb-1">{equipo.nombre}</h4>
              <p className="text-sm text-gray-600 mb-2">{equipo.ubicacion}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  equipo.estado === 'activo'
                    ? 'bg-green-200 text-green-800'
                    : equipo.estado === 'mantenimiento'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-red-200 text-red-800'
                }`}>
                  {equipo.estado}
                </span>
                <span className="text-xs text-gray-500">
                  Próx. mant: {equipo.proximoMantenimiento?.toLocaleDateString('es-CO') || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Criticidad Media */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Equipos de Criticidad Media</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Equipos importantes para la operación que tienen alternativas disponibles
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equiposCriticidadMedia.map((equipo) => (
            <div
              key={equipo.id}
              className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg"
            >
              <h4 className="font-semibold text-gray-900 mb-1">{equipo.nombre}</h4>
              <p className="text-sm text-gray-600">{equipo.ubicacion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Criticidad Baja */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Equipos de Baja Criticidad</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Equipos auxiliares o de soporte con impacto limitado en la operación
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {equiposCriticidadBaja.map((equipo) => (
            <div
              key={equipo.id}
              className="border border-green-200 bg-green-50 p-3 rounded-lg"
            >
              <p className="font-medium text-gray-900 text-sm">{equipo.nombre}</p>
              <p className="text-xs text-gray-600">{equipo.ubicacion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
