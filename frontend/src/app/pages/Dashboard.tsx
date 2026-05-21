import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Package,
  Wrench,
  Bell,
  AlertTriangle,
  TrendingUp,
  Activity,
  DollarSign,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Alerta, Equipo, Mantenimiento } from '../types';
import { api } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  useEffect(() => {
    Promise.all([api.getEquipos(), api.getMantenimientos(), api.getAlertas()])
      .then(([equiposData, mantenimientosData, alertasData]) => {
        setEquipos(equiposData);
        setMantenimientos(mantenimientosData);
        setAlertas(alertasData);
      })
      .catch(() => {
        setEquipos([]);
        setMantenimientos([]);
        setAlertas([]);
      });
  }, []);

  // Calcular estadísticas
  const totalEquipos = equipos.length;
  const equiposActivos = equipos.filter(e => e.estado === 'activo').length;
  const equiposMantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length;
  const equiposInactivos = equipos.filter(e => e.estado === 'inactivo').length;
  const alertasActivas = alertas.filter(a => !a.leida).length;
  const equiposCriticos = equipos.filter(e => e.criticidad === 'alta').length;
  const mantenimientosMes = mantenimientos.filter(
    m => m.fecha.getMonth() === new Date().getMonth()
  ).length;
  const costoMantenimientoMes = mantenimientos
    .filter(m => m.fecha.getMonth() === new Date().getMonth())
    .reduce((sum, m) => sum + (m.costo || 0), 0);

  // Datos para gráficas
  const estadoData = [
    { name: 'Activos', value: equiposActivos, color: '#10b981' },
    { name: 'Mantenimiento', value: equiposMantenimiento, color: '#f59e0b' },
    { name: 'Inactivos', value: equiposInactivos, color: '#ef4444' },
  ];

  const criticidadData = [
    { name: 'Alta', value: equipos.filter(e => e.criticidad === 'alta').length, color: '#ef4444' },
    { name: 'Media', value: equipos.filter(e => e.criticidad === 'media').length, color: '#f59e0b' },
    { name: 'Baja', value: equipos.filter(e => e.criticidad === 'baja').length, color: '#10b981' },
  ];

  const mantenimientosPorMes = [
    { mes: 'Ene', preventivo: 3, correctivo: 1 },
    { mes: 'Feb', preventivo: 2, correctivo: 2 },
    { mes: 'Mar', preventivo: 4, correctivo: 1 },
    { mes: 'Abr', preventivo: 3, correctivo: 2 },
  ];

  const stats = [
    {
      label: 'Total Equipos',
      value: totalEquipos,
      icon: Package,
      color: 'bg-blue-500',
      change: '+2.5%',
      trend: 'up',
    },
    {
      label: 'En Mantenimiento',
      value: equiposMantenimiento,
      icon: Wrench,
      color: 'bg-yellow-500',
      change: '-1.2%',
      trend: 'down',
    },
    {
      label: 'Alertas Activas',
      value: alertasActivas,
      icon: Bell,
      color: 'bg-red-500',
      change: '+5.7%',
      trend: 'up',
    },
    {
      label: 'Equipos Críticos',
      value: equiposCriticos,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      change: '0%',
      trend: 'neutral',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.nombre} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Resumen general del sistema de equipos biomédicos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        stat.trend === 'up'
                          ? 'text-green-600'
                          : stat.trend === 'down'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        stat.trend === 'up'
                          ? 'text-green-600'
                          : stat.trend === 'down'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Equipos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Equipos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estadoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {estadoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {estadoData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Criticidad */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nivel de Criticidad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={criticidadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mantenimientos Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mantenimientos por Mes</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">Preventivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm text-gray-600">Correctivo</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mantenimientosPorMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="preventivo" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="correctivo" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Mantenimientos Este Mes</p>
              <p className="text-4xl font-bold">{mantenimientosMes}</p>
            </div>
            <Activity className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Equipos Activos</p>
              <p className="text-4xl font-bold">{equiposActivos}</p>
            </div>
            <Package className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-1">Costo Mantenimiento Mes</p>
              <p className="text-2xl font-bold">
                ${(costoMantenimientoMes / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {mantenimientos.slice(0, 5).map((mant) => {
            const equipo = equipos.find(e => e.id === mant.equipoId);
            return (
              <div key={mant.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  mant.tipo === 'preventivo' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <Wrench className={`w-5 h-5 ${
                    mant.tipo === 'preventivo' ? 'text-blue-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{equipo?.nombre}</p>
                  <p className="text-sm text-gray-600">{mant.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {mant.tecnicoResponsable} • {mant.fecha.toLocaleDateString('es-CO')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  mant.tipo === 'preventivo'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {mant.tipo}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
