import { Bell, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Alerta } from '../types';
import { api } from '../services/api';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const alertasNoLeidas = alertas.filter(a => !a.leida);

  useEffect(() => {
    api.getAlertas().then(setAlertas).catch(() => setAlertas([]));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Sistema de Gestión Biomédica
          </h2>
          <p className="text-sm text-gray-500">Hospital E.S.E Juan Pablo II</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notificaciones${alertasNoLeidas.length > 0 ? `, ${alertasNoLeidas.length} sin leer` : ''}`}
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {alertasNoLeidas.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                  <p className="text-sm text-gray-500">
                    {alertasNoLeidas.length} sin leer
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alertas.slice(0, 5).map((alerta) => (
                    <div
                      key={alerta.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !alerta.leida ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            alerta.prioridad === 'alta'
                              ? 'bg-red-500'
                              : alerta.prioridad === 'media'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {alerta.equipoNombre}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{alerta.mensaje}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {alerta.fecha.toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/alertas');
                    }}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver todas las alertas
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
