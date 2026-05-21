import { useEffect, useMemo, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { Equipo, Mantenimiento } from '../types';
import { api } from '../services/api';

type ReportRow = Record<string, string | number>;

function formatDate(value?: Date) {
  return value ? value.toLocaleDateString('es-CO') : 'N/A';
}

function formatCurrency(value?: number) {
  return `$${(value || 0).toLocaleString('es-CO')}`;
}

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildTableHtml(title: string, rows: ReportRow[]) {
  const headers = Object.keys(rows[0] || { Mensaje: 'Sin datos' });
  const data = rows.length ? rows : [{ Mensaje: 'Sin datos para el rango seleccionado' }];

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          p { color: #4b5563; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #f3f4f6; text-align: left; }
          th, td { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>Generado desde BiomedicTrack</p>
        <table>
          <thead>
            <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map((row) => `
              <tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState<'equipos' | 'mantenimientos' | 'costos'>('equipos');
  const [fechaInicio, setFechaInicio] = useState('2026-01-01');
  const [fechaFin, setFechaFin] = useState('2026-12-31');
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);

  useEffect(() => {
    Promise.all([api.getEquipos(), api.getMantenimientos()])
      .then(([equiposData, mantenimientosData]) => {
        setEquipos(equiposData);
        setMantenimientos(mantenimientosData);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  const mantenimientosFiltrados = useMemo(() => {
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T23:59:59`);
    return mantenimientos.filter((mantenimiento) => mantenimiento.fecha >= inicio && mantenimiento.fecha <= fin);
  }, [fechaFin, fechaInicio, mantenimientos]);

  const equiposFiltrados = useMemo(() => {
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T23:59:59`);
    return equipos.filter((equipo) => equipo.fechaAdquisicion >= inicio && equipo.fechaAdquisicion <= fin);
  }, [equipos, fechaFin, fechaInicio]);

  const getEquipoNombre = (equipoId: string) => {
    return equipos.find((equipo) => equipo.id === equipoId)?.nombre || 'Equipo no encontrado';
  };

  const buildReportRows = (): ReportRow[] => {
    if (tipoReporte === 'equipos') {
      return equiposFiltrados.map((equipo) => ({
        Equipo: equipo.nombre,
        Marca: equipo.marca,
        Modelo: equipo.modelo,
        Serie: equipo.serie,
        Area: equipo.area,
        Ubicacion: equipo.ubicacion,
        Estado: equipo.estado,
        Criticidad: equipo.criticidad,
        'Fecha adquisicion': formatDate(equipo.fechaAdquisicion),
        'Ultimo mantenimiento': formatDate(equipo.ultimoMantenimiento),
        'Proximo mantenimiento': formatDate(equipo.proximoMantenimiento),
      }));
    }

    if (tipoReporte === 'mantenimientos') {
      return mantenimientosFiltrados.map((mantenimiento) => ({
        Equipo: getEquipoNombre(mantenimiento.equipoId),
        Tipo: mantenimiento.tipo,
        Fecha: formatDate(mantenimiento.fecha),
        Tecnico: mantenimiento.tecnicoResponsable,
        Descripcion: mantenimiento.descripcion,
        Costo: formatCurrency(mantenimiento.costo),
        Duracion: mantenimiento.duracion ? `${mantenimiento.duracion}h` : 'N/A',
        Repuestos: mantenimiento.repuestos?.join(', ') || 'N/A',
      }));
    }

    return costosPorMes.map((item) => ({
      Mes: item.mes,
      Costo: formatCurrency(item.costo),
    }));
  };

  const reportTitle = {
    equipos: 'Reporte de Inventario de Equipos',
    mantenimientos: 'Reporte de Mantenimientos',
    costos: 'Reporte de Analisis de Costos',
  }[tipoReporte];

  const handleExportar = (formato: 'pdf' | 'excel') => {
    const rows = buildReportRows();
    const html = buildTableHtml(`${reportTitle} (${fechaInicio} a ${fechaFin})`, rows);
    const filename = `${tipoReporte}-${fechaInicio}-${fechaFin}`;

    if (formato === 'excel') {
      downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8');
      toast.success('Reporte Excel generado');
      return;
    }

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

  const equiposPorArea = useMemo(() => {
    const grouped = equiposFiltrados.reduce<Record<string, number>>((acc, equipo) => {
      const area = equipo.area || 'Sin area';
      acc[area] = (acc[area] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([area, cantidad]) => ({ area, cantidad }));
  }, [equiposFiltrados]);

  const costosPorMes = useMemo(() => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses.map((mes, index) => ({
      mes,
      costo: mantenimientosFiltrados.filter(m => m.fecha.getMonth() === index).reduce((sum, m) => sum + (m.costo || 0), 0),
    }));
  }, [mantenimientosFiltrados]);

  const mantenimientosPorTipo = useMemo(() => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses.map((mes, index) => ({
      mes,
      preventivo: mantenimientosFiltrados.filter(m => m.fecha.getMonth() === index && m.tipo === 'preventivo').length,
      correctivo: mantenimientosFiltrados.filter(m => m.fecha.getMonth() === index && m.tipo === 'correctivo').length,
    }));
  }, [mantenimientosFiltrados]);

  const costoTotal = costosPorMes.reduce((sum, item) => sum + item.costo, 0);
  const promedioMensual = costoTotal / Math.max(costosPorMes.length, 1);
  const mesMasAlto = costosPorMes.reduce((max, item) => item.costo > max.costo ? item : max, costosPorMes[0]);
  const mesMasBajo = costosPorMes.reduce((min, item) => item.costo < min.costo ? item : min, costosPorMes[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Analisis</h1>
        <p className="text-gray-600 mt-1">
          Genera reportes detallados y visualiza analisis estadisticos
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Configurar Reporte
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="tipo-reporte" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              id="tipo-reporte"
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="equipos">Inventario de Equipos</option>
              <option value="mantenimientos">Mantenimientos</option>
              <option value="costos">Analisis de Costos</option>
            </select>
          </div>

          <div>
            <label htmlFor="fecha-inicio-reporte" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              id="fecha-inicio-reporte"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              aria-label="Fecha inicio del reporte"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="fecha-fin-reporte" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              id="fecha-fin-reporte"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              aria-label="Fecha fin del reporte"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleExportar('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button
            onClick={() => handleExportar('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {tipoReporte === 'equipos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribucion de Equipos por Area
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={equiposPorArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Inventario
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criticidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ultimo Mant.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {equiposFiltrados.slice(0, 5).map((equipo) => (
                    <tr key={equipo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{equipo.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{equipo.area}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          equipo.estado === 'activo' ? 'bg-green-100 text-green-700' :
                          equipo.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {equipo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">{equipo.criticidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {equipo.ultimoMantenimiento?.toLocaleDateString('es-CO') || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tipoReporte === 'mantenimientos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mantenimientos por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mantenimientosPorTipo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="preventivo" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="correctivo" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Total Mantenimientos</p>
              <p className="text-3xl font-bold text-gray-900">{mantenimientosFiltrados.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Preventivos</p>
              <p className="text-3xl font-bold text-blue-600">{mantenimientosFiltrados.filter(m => m.tipo === 'preventivo').length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Correctivos</p>
              <p className="text-3xl font-bold text-red-600">{mantenimientosFiltrados.filter(m => m.tipo === 'correctivo').length}</p>
            </div>
          </div>
        </div>
      )}

      {tipoReporte === 'costos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Evolucion de Costos de Mantenimiento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CO')}`} />
                <Line type="monotone" dataKey="costo" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Costo Total</p>
              <p className="text-2xl font-bold text-gray-900">${(costoTotal / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Promedio Mensual</p>
              <p className="text-2xl font-bold text-blue-600">${(promedioMensual / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Mes Mas Alto</p>
              <p className="text-2xl font-bold text-red-600">{mesMasAlto?.mes ?? 'N/A'}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Mes Mas Bajo</p>
              <p className="text-2xl font-bold text-green-600">{mesMasBajo?.mes ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
