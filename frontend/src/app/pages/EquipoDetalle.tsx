import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Download,
  QrCode as QrCodeIcon,
  Edit,
  Activity,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Bitacora, Equipo, Mantenimiento } from '../types';
import { api } from '../services/api';

function getFriendlyQrCode(id: string) {
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `QR-${String((hash % 999) + 1).padStart(3, '0')}`;
}

export default function EquipoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [showQR, setShowQR] = useState(false);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([api.getEquipo(id), api.getMantenimientos(), api.getBitacoras()])
      .then(([equipoData, mantenimientosData, bitacorasData]) => {
        setEquipo(equipoData);
        setMantenimientos(mantenimientosData.filter(m => m.equipoId === id));
        setBitacoras(bitacorasData.filter(b => b.equipoId === id));
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Cargando equipo...</div>;
  }

  if (!equipo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Equipo no encontrado</p>
        <Link to="/equipos" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Volver a equipos
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Información General' },
    { id: 'especificaciones', label: 'Especificaciones Técnicas' },
    { id: 'mantenimientos', label: 'Historial de Mantenimiento' },
    { id: 'bitacora', label: 'Bitácora' },
  ];

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR-${equipo.serie}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
    toast.success('QR descargado exitosamente');
  };

  const friendlyQrCode = getFriendlyQrCode(equipo.id);
  const qrValue = `${window.location.origin}/equipos/${equipo.id}?qr=${friendlyQrCode}`;

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
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{equipo.nombre}</h1>
            <p className="text-gray-600 mt-1">Serie: {equipo.serie}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowQR(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <QrCodeIcon className="w-4 h-4" />
              Ver QR
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              equipo.estado === 'activo' ? 'bg-green-100' :
              equipo.estado === 'mantenimiento' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Activity className={`w-5 h-5 ${
                equipo.estado === 'activo' ? 'text-green-600' :
                equipo.estado === 'mantenimiento' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-semibold text-gray-900 capitalize">{equipo.estado}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ubicación</p>
              <p className="font-semibold text-gray-900">{equipo.ubicacion}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              equipo.criticidad === 'alta' ? 'bg-red-100' :
              equipo.criticidad === 'media' ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              <Package className={`w-5 h-5 ${
                equipo.criticidad === 'alta' ? 'text-red-600' :
                equipo.criticidad === 'media' ? 'text-yellow-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Criticidad</p>
              <p className="font-semibold text-gray-900 capitalize">{equipo.criticidad}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Próximo Mant.</p>
              <p className="font-semibold text-gray-900">
                {equipo.proximoMantenimiento?.toLocaleDateString('es-CO') || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Información Básica</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nombre del Equipo</p>
                      <p className="font-medium text-gray-900">{equipo.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Marca</p>
                      <p className="font-medium text-gray-900">{equipo.marca}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Modelo</p>
                      <p className="font-medium text-gray-900">{equipo.modelo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Número de Serie</p>
                      <p className="font-medium text-gray-900 font-mono">{equipo.serie}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Fabricante</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Fabricante</p>
                      <p className="font-medium text-gray-900">{equipo.fabricante}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">País de Origen</p>
                      <p className="font-medium text-gray-900">{equipo.paisOrigen}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Año de Fabricación</p>
                      <p className="font-medium text-gray-900">{equipo.añoFabricacion}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Adquisición</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Adquisición</p>
                      <p className="font-medium text-gray-900">
                        {equipo.fechaAdquisicion.toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Costo de Adquisición</p>
                      <p className="font-medium text-gray-900">
                        ${equipo.costoAdquisicion.toLocaleString('es-CO')} COP
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Proveedor</p>
                      <p className="font-medium text-gray-900">{equipo.proveedor}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Ubicación y Responsable</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Ubicación</p>
                      <p className="font-medium text-gray-900">{equipo.ubicacion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Área</p>
                      <p className="font-medium text-gray-900">{equipo.area}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Responsable</p>
                      <p className="font-medium text-gray-900">{equipo.responsable}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Accesorios</h3>
                <div className="flex flex-wrap gap-2">
                  {equipo.accesorios.map((accesorio, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {accesorio}
                    </span>
                  ))}
                </div>
              </div>

              {equipo.observaciones && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Observaciones</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{equipo.observaciones}</p>
                </div>
              )}
            </div>
          )}

          {/* Especificaciones Tab */}
          {activeTab === 'especificaciones' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 mb-4">Especificaciones Técnicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {equipo.especificaciones.voltaje && (
                  <div>
                    <p className="text-sm text-gray-600">Voltaje</p>
                    <p className="font-medium text-gray-900">{equipo.especificaciones.voltaje}</p>
                  </div>
                )}
                {equipo.especificaciones.frecuencia && (
                  <div>
                    <p className="text-sm text-gray-600">Frecuencia</p>
                    <p className="font-medium text-gray-900">{equipo.especificaciones.frecuencia}</p>
                  </div>
                )}
                {equipo.especificaciones.potencia && (
                  <div>
                    <p className="text-sm text-gray-600">Potencia</p>
                    <p className="font-medium text-gray-900">{equipo.especificaciones.potencia}</p>
                  </div>
                )}
                {equipo.especificaciones.dimensiones && (
                  <div>
                    <p className="text-sm text-gray-600">Dimensiones</p>
                    <p className="font-medium text-gray-900">{equipo.especificaciones.dimensiones}</p>
                  </div>
                )}
                {equipo.especificaciones.peso && (
                  <div>
                    <p className="text-sm text-gray-600">Peso</p>
                    <p className="font-medium text-gray-900">{equipo.especificaciones.peso}</p>
                  </div>
                )}
              </div>
              {equipo.especificaciones.otros && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Otras Especificaciones</p>
                  <p className="text-gray-900">{equipo.especificaciones.otros}</p>
                </div>
              )}
            </div>
          )}

          {/* Mantenimientos Tab */}
          {activeTab === 'mantenimientos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Historial de Mantenimiento</h3>
              </div>
              
              <div className="space-y-4">
                {mantenimientos.map((mant) => (
                  <div
                    key={mant.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          mant.tipo === 'preventivo'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {mant.tipo.charAt(0).toUpperCase() + mant.tipo.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {mant.fecha.toLocaleDateString('es-CO')}
                        </span>
                      </div>
                      {mant.costo && (
                        <span className="text-sm font-medium text-gray-900">
                          ${mant.costo.toLocaleString('es-CO')}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{mant.descripcion}</h4>
                    {mant.observaciones && (
                      <p className="text-sm text-gray-600 mb-3">{mant.observaciones}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Técnico: {mant.tecnicoResponsable}</span>
                      {mant.duracion && <span>Duración: {mant.duracion}h</span>}
                    </div>
                    
                    {mant.repuestos && mant.repuestos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Repuestos utilizados:</p>
                        <div className="flex flex-wrap gap-2">
                          {mant.repuestos.map((rep, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {rep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {mantenimientos.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay mantenimientos registrados
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bitácora Tab */}
          {activeTab === 'bitacora' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Bitácora de Actividades</h3>
              
              <div className="space-y-4">
                {bitacoras.map((bit) => (
                  <div
                    key={bit.id}
                    className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{bit.accion}</p>
                        <p className="text-sm text-gray-600">{bit.usuario}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {bit.fecha.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{bit.detalles}</p>
                    {bit.firmaDigital && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                        <span className="font-mono bg-white px-2 py-1 rounded">
                          🔒 Firma: {bit.firmaDigital}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {bitacoras.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay registros en la bitácora
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Código QR del Equipo</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                id="qr-code"
                value={qrValue}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center mb-3">
              <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {friendlyQrCode}
              </span>
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Escanea este código para acceder a la hoja de vida del equipo
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={downloadQR}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
