import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Package,
  Wrench,
  Users,
  Bell,
  AlertTriangle,
  FileText,
  QrCode,
  LogOut,
  Activity,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Equipos', path: '/equipos' },
    { icon: QrCode, label: 'Escanear QR', path: '/scanner' },
    { icon: Wrench, label: 'Mantenimientos', path: '/mantenimientos' },
    { icon: Bell, label: 'Alertas', path: '/alertas' },
    { icon: AlertTriangle, label: 'Criticidad', path: '/criticidad' },
    { icon: Activity, label: 'Bitácora', path: '/bitacora' },
    { icon: FileText, label: 'Reportes', path: '/reportes' },
  ];

  // Solo Gerencia puede ver gestión de usuarios
  if (user?.role === 'gerencia') {
    menuItems.splice(3, 0, { icon: Users, label: 'Usuarios', path: '/usuarios' });
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-0 md:w-20'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <div className="hidden md:block">
                <h1 className="font-semibold text-gray-900">BiomedicTrack</h1>
                <p className="text-xs text-gray-500">Sistema Hospitalario</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                    {isOpen && (
                      <span className="hidden md:block font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.nombre.charAt(0)}{user?.apellido.charAt(0)}
            </div>
            {isOpen && (
              <div className="flex-1 hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          {isOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:block">Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
