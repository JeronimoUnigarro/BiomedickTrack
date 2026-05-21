import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { EstadoEquipo, CriticidadEquipo } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function NuevoEquipo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    modelo: '',
    serie: '',
    fabricante: '',
    paisOrigen: '',
    añoFabricacion: new Date().getFullYear(),
    fechaAdquisicion: '',
    costoAdquisicion: '',
    proveedor: '',
    ubicacion: '',
    area: '',
    responsable: '',
    estado: 'activo' as EstadoEquipo,
    criticidad: 'media' as CriticidadEquipo,
    voltaje: '',
    frecuencia: '',
    potencia: '',
    dimensiones: '',
    peso: '',
    otros: '',
    observaciones: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    api.getEquipo(id)
      .then((equipo) => {
        setFormData({
          nombre: equipo.nombre,
          marca: equipo.marca,
          modelo: equipo.modelo,
          serie: equipo.serie,
          fabricante: equipo.fabricante,
          paisOrigen: equipo.paisOrigen,
          añoFabricacion: equipo.añoFabricacion,
          fechaAdquisicion: equipo.fechaAdquisicion.toISOString().slice(0, 10),
          costoAdquisicion: String(equipo.costoAdquisicion),
          proveedor: equipo.proveedor,
          ubicacion: equipo.ubicacion,
          area: equipo.area,
          responsable: equipo.responsable,
          estado: equipo.estado,
          criticidad: equipo.criticidad,
          voltaje: equipo.especificaciones.voltaje ?? '',
          frecuencia: equipo.especificaciones.frecuencia ?? '',
          potencia: equipo.especificaciones.potencia ?? '',
          dimensiones: equipo.especificaciones.dimensiones ?? '',
          peso: equipo.especificaciones.peso ?? '',
          otros: equipo.especificaciones.otros ?? '',
          observaciones: equipo.observaciones ?? '',
        });
      })
      .catch((error) => toast.error(error.message));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (id) {
        await api.updateEquipo(id, formData);
        toast.success('Equipo actualizado exitosamente');
      } else {
        await api.createEquipo(formData);
        toast.success('Equipo registrado exitosamente');
      }
      navigate('/equipos');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el equipo');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (user?.role !== 'ingeniero') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600 mb-4">Gerencia solo puede consultar equipos. El CRUD corresponde al ingeniero biomédico.</p>
        <Link to="/equipos" className="text-blue-600 hover:text-blue-700">
          Volver a equipos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/equipos"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a equipos
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
        </h1>
        <p className="text-gray-600 mt-1">
          Completa la información del equipo biomédico
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Equipo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Serie *
              </label>
              <input
                type="text"
                name="serie"
                value={formData.serie}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Fabricante */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Fabricante</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fabricante *
              </label>
              <input
                type="text"
                name="fabricante"
                value={formData.fabricante}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País de Origen *
              </label>
              <input
                type="text"
                name="paisOrigen"
                value={formData.paisOrigen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año de Fabricación *
              </label>
              <input
                type="number"
                name="añoFabricacion"
                value={formData.añoFabricacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1990"
                max={new Date().getFullYear()}
                required
              />
            </div>
          </div>
        </div>

        {/* Adquisición */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Adquisición</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Adquisición *
              </label>
              <input
                type="date"
                name="fechaAdquisicion"
                value={formData.fechaAdquisicion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de Adquisición (COP) *
              </label>
              <input
                type="number"
                name="costoAdquisicion"
                value={formData.costoAdquisicion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación y Responsable</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej: UCI - Piso 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área *
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Ej: Unidad de Cuidados Intensivos"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable *
              </label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                placeholder="Ej: Dr. Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Estado y Criticidad */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado y Clasificación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="activo">Activo</option>
                <option value="mantenimiento">En Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Criticidad *
              </label>
              <select
                name="criticidad"
                value={formData.criticidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Especificaciones Técnicas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones Técnicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voltaje
              </label>
              <input
                type="text"
                name="voltaje"
                value={formData.voltaje}
                onChange={handleChange}
                placeholder="Ej: 110-240V AC"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia
              </label>
              <input
                type="text"
                name="frecuencia"
                value={formData.frecuencia}
                onChange={handleChange}
                placeholder="Ej: 50/60 Hz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potencia
              </label>
              <input
                type="text"
                name="potencia"
                value={formData.potencia}
                onChange={handleChange}
                placeholder="Ej: 150W"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiones
              </label>
              <input
                type="text"
                name="dimensiones"
                value={formData.dimensiones}
                onChange={handleChange}
                placeholder="Ej: 35 x 28 x 38 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso
              </label>
              <input
                type="text"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                placeholder="Ej: 12.5 kg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otras Especificaciones
              </label>
              <textarea
                name="otros"
                value={formData.otros}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa especificaciones adicionales..."
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingresa observaciones adicionales sobre el equipo..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link
            to="/equipos"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Equipo' : 'Registrar Equipo'}
          </button>
        </div>
      </form>
    </div>
  );
}
