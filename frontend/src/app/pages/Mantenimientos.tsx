import { useEffect, useState } from 'react';
import { Wrench, Calendar, DollarSign, Clock, Plus, Filter, Edit, Trash2 } from 'lucide-react';
import { Equipo, Mantenimiento } from '../types';
import { api } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function Mantenimientos() {
  const { user } = useAuth();
  const canManageMantenimientos = user?.role === 'ingeniero';
  const [filter, setFilter] = useState<'todos' | 'preventivo' | 'correctivo'>('todos');
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMantenimiento, setEditingMantenimiento] = useState<Mantenimiento | null>(null);
  const [mantenimientoToDelete, setMantenimientoToDelete] = useState<Mantenimiento | null>(null);
  const [formData, setFormData] = useState({
    equipoId: '',
    tipo: 'preventivo' as 'preventivo' | 'correctivo',
    fecha: new Date().toISOString().slice(0, 10),
    tecnicoResponsable: '',
    descripcion: '',
    observaciones: '',
    costo: '',
    duracion: '',
    repuestos: '',
  });

  useEffect(() => {
    Promise.all([api.getMantenimientos(), api.getEquipos()])
      .then(([mantenimientosData, equiposData]) => {
        setMantenimientos(mantenimientosData);
        setEquipos(equiposData);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  const filteredMantenimientos = mantenimientos.filter(m =>
    filter === 'todos' || m.tipo === filter
  );

  const getEquipoNombre = (equipoId: string) => {
    return equipos.find(e => e.id === equipoId)?.nombre || 'Equipo no encontrado';
  };

  const resetForm = () => {
    setFormData({
      equipoId: '',
      tipo: 'preventivo',
      fecha: new Date().toISOString().slice(0, 10),
      tecnicoResponsable: '',
      descripcion: '',
      observaciones: '',
      costo: '',
      duracion: '',
      repuestos: '',
    });
    setEditingMantenimiento(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (mantenimiento: Mantenimiento) => {
    setEditingMantenimiento(mantenimiento);
    setFormData({
      equipoId: mantenimiento.equipoId,
      tipo: mantenimiento.tipo,
      fecha: mantenimiento.fecha.toISOString().slice(0, 10),
      tecnicoResponsable: mantenimiento.tecnicoResponsable,
      descripcion: mantenimiento.descripcion,
      observaciones: mantenimiento.observaciones ?? '',
      costo: mantenimiento.costo ? String(mantenimiento.costo) : '',
      duracion: mantenimiento.duracion ? String(mantenimiento.duracion) : '',
      repuestos: mantenimiento.repuestos?.join(', ') ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        costo: formData.costo ? Number(formData.costo) : undefined,
        duracion: formData.duracion ? Number(formData.duracion) : undefined,
        repuestos: formData.repuestos,
      };

      if (editingMantenimiento) {
        const updated = await api.updateMantenimiento(editingMantenimiento.id, payload);
        setMantenimientos(mantenimientos.map((mant) => mant.id === updated.id ? updated : mant));
        toast.success('Mantenimiento actualizado exitosamente');
      } else {
        const mantenimiento = await api.createMantenimiento(payload);
        setMantenimientos([mantenimiento, ...mantenimientos]);
        toast.success('Mantenimiento registrado exitosamente');
      }

      closeModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el mantenimiento');
    }
  };

  const handleDelete = async () => {
    if (!mantenimientoToDelete) return;

    try {
      await api.deleteMantenimiento(mantenimientoToDelete.id);
      setMantenimientos(mantenimientos.filter((mant) => mant.id !== mantenimientoToDelete.id));
      setMantenimientoToDelete(null);
      toast.success('Mantenimiento eliminado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el mantenimiento');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Mantenimientos</h1>
          <p className="text-gray-600 mt-1">
            Registro y seguimiento de mantenimientos preventivos y correctivos
          </p>
        </div>
        {canManageMantenimientos && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            Registrar Mantenimiento
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Mantenimientos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{mantenimientos.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Preventivos</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {mantenimientos.filter(m => m.tipo === 'preventivo').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Correctivos</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {mantenimientos.filter(m => m.tipo === 'correctivo').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Este Mes</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {mantenimientos.filter(m => m.fecha.getMonth() === new Date().getMonth()).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'todos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Todos
          </button>
          <button
            onClick={() => setFilter('preventivo')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'preventivo'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Preventivo
          </button>
          <button
            onClick={() => setFilter('correctivo')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'correctivo'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Correctivo
          </button>
        </div>
      </div>

      {/* Mantenimientos List */}
      <div className="space-y-4">
        {filteredMantenimientos.map((mant) => (
          <div
            key={mant.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  mant.tipo === 'preventivo' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <Wrench className={`w-6 h-6 ${
                    mant.tipo === 'preventivo' ? 'text-blue-600' : 'text-red-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {getEquipoNombre(mant.equipoId)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      mant.tipo === 'preventivo'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {mant.tipo.charAt(0).toUpperCase() + mant.tipo.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{mant.descripcion}</p>
                  {mant.observaciones && (
                    <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded">
                      {mant.observaciones}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                {mant.costo && (
                  <div className="flex items-center gap-2 text-gray-900">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">${mant.costo.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {canManageMantenimientos && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(mant)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar mantenimiento"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMantenimientoToDelete(mant)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar mantenimiento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{mant.fecha.toLocaleDateString('es-CO')}</span>
              </div>
              {mant.duracion && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{mant.duracion}h</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span>Técnico: {mant.tecnicoResponsable}</span>
              </div>
            </div>

            {mant.repuestos && mant.repuestos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Repuestos utilizados:</p>
                <div className="flex flex-wrap gap-2">
                  {mant.repuestos.map((rep, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {rep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingMantenimiento ? 'Editar Mantenimiento' : 'Registrar Mantenimiento'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipo</label>
                <select
                  value={formData.equipoId}
                  onChange={(e) => setFormData({ ...formData, equipoId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona un equipo</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'preventivo' | 'correctivo' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tecnico Responsable</label>
                <input
                  type="text"
                  value={formData.tecnicoResponsable}
                  onChange={(e) => setFormData({ ...formData, tecnicoResponsable: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripcion</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Costo</label>
                  <input
                    type="number"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duracion (h)</label>
                  <input
                    type="number"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repuestos</label>
                  <input
                    type="text"
                    value={formData.repuestos}
                    onChange={(e) => setFormData({ ...formData, repuestos: e.target.value })}
                    placeholder="Filtro, sensor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingMantenimiento ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mantenimientoToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Eliminar Mantenimiento</h3>
            <p className="text-gray-600 mb-6">
              Esta accion eliminara el mantenimiento de <strong>{getEquipoNombre(mantenimientoToDelete.equipoId)}</strong>.
              No se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setMantenimientoToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
