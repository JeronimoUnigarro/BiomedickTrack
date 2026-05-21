import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Filter, Eye, Edit, Trash2, Download } from 'lucide-react';
import { Equipo, EstadoEquipo } from '../types';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value?: Date) {
  return value ? value.toLocaleDateString('es-CO') : 'N/A';
}

export default function Equipos() {
  const { user } = useAuth();
  const canManageEquipos = user?.role === 'ingeniero';
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoEquipo | 'todos'>('todos');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipoToDelete, setEquipoToDelete] = useState<string | null>(null);

  useEffect(() => {
    api.getEquipos()
      .then(setEquipos)
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtrar equipos
  const filteredEquipos = equipos.filter(equipo => {
    const matchesSearch = 
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.serie.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'todos' || equipo.estado === filterEstado;
    
    return matchesSearch && matchesEstado;
  });

  const handleDelete = (id: string) => {
    setEquipoToDelete(id);
    setShowDeleteModal(true);
  };

  const handleExportPdf = () => {
    const rows = filteredEquipos.length ? filteredEquipos : equipos;
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Reporte de Equipos</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            p { color: #4b5563; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th { background: #f3f4f6; text-align: left; }
            th, td { border: 1px solid #d1d5db; padding: 7px; vertical-align: top; }
          </style>
        </head>
        <body>
          <h1>Reporte de Equipos</h1>
          <p>Generado desde BiomedicTrack - ${new Date().toLocaleDateString('es-CO')}</p>
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Serie</th>
                <th>Area</th>
                <th>Ubicacion</th>
                <th>Estado</th>
                <th>Criticidad</th>
                <th>Ultimo Mant.</th>
                <th>Proximo Mant.</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((equipo) => `
                <tr>
                  <td>${escapeHtml(equipo.nombre)}</td>
                  <td>${escapeHtml(equipo.marca)}</td>
                  <td>${escapeHtml(equipo.modelo)}</td>
                  <td>${escapeHtml(equipo.serie)}</td>
                  <td>${escapeHtml(equipo.area)}</td>
                  <td>${escapeHtml(equipo.ubicacion)}</td>
                  <td>${escapeHtml(equipo.estado)}</td>
                  <td>${escapeHtml(equipo.criticidad)}</td>
                  <td>${escapeHtml(formatDate(equipo.ultimoMantenimiento))}</td>
                  <td>${escapeHtml(formatDate(equipo.proximoMantenimiento))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      toast.error('Permite ventanas emergentes para exportar PDF');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast.success('Reporte PDF listo para guardar');
  };

  const confirmDelete = async () => {
    if (!equipoToDelete) return;

    try {
      await api.deleteEquipo(equipoToDelete);
      setEquipos(equipos.filter(e => e.id !== equipoToDelete));
      toast.success('Equipo eliminado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el equipo');
    } finally {
      setShowDeleteModal(false);
      setEquipoToDelete(null);
    }
  };

  const getEstadoBadge = (estado: EstadoEquipo) => {
    const styles = {
      activo: 'bg-green-100 text-green-700 border-green-200',
      mantenimiento: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      inactivo: 'bg-red-100 text-red-700 border-red-200',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[estado]}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const getCriticidadBadge = (criticidad: string) => {
    const styles = {
      alta: 'bg-red-100 text-red-700',
      media: 'bg-yellow-100 text-yellow-700',
      baja: 'bg-blue-100 text-blue-700',
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[criticidad as keyof typeof styles]}`}>
        {criticidad.charAt(0).toUpperCase() + criticidad.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
          <p className="text-gray-600 mt-1">
            Administra el inventario de equipos biomédicos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          {canManageEquipos && (
            <Link
              to="/equipos/nuevo"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Registrar Equipo
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Equipos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{equipos.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Activos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {equipos.filter(e => e.estado === 'activo').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">En Mantenimiento</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {equipos.filter(e => e.estado === 'mantenimiento').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Inactivos</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {equipos.filter(e => e.estado === 'inactivo').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              aria-label="Buscar equipos por nombre, marca o serie"
              placeholder="Buscar por nombre, marca o serie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as EstadoEquipo | 'todos')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Más Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca / Modelo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criticidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Mant.
                </th>
                {canManageEquipos && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEquipos.map((equipo) => (
                <tr key={equipo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <Link to={`/equipos/${equipo.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {equipo.nombre}
                      </Link>
                      <p className="text-sm text-gray-500">{equipo.area}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{equipo.marca}</p>
                      <p className="text-sm text-gray-500">{equipo.modelo}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-mono text-sm">
                    {equipo.serie}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {equipo.ubicacion}
                  </td>
                  <td className="px-6 py-4">
                    {getEstadoBadge(equipo.estado)}
                  </td>
                  <td className="px-6 py-4">
                    {getCriticidadBadge(equipo.criticidad)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {equipo.ultimoMantenimiento?.toLocaleDateString('es-CO') || 'N/A'}
                  </td>
                  {canManageEquipos && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/equipos/${equipo.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/equipos/${equipo.id}/editar`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(equipo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando equipos...</p>
          </div>
        )}

        {!loading && filteredEquipos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron equipos</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¿Eliminar Equipo?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este equipo?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
