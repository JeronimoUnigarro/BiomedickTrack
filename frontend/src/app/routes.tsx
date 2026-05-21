import { createBrowserRouter, Navigate } from 'react-router';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarContraseña from './pages/RecuperarContraseña';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Equipos from './pages/Equipos';
import EquipoDetalle from './pages/EquipoDetalle';
import NuevoEquipo from './pages/NuevoEquipo';
import Mantenimientos from './pages/Mantenimientos';
import Alertas from './pages/Alertas';
import Criticidad from './pages/Criticidad';
import UsuariosPage from './pages/Usuarios';
import Bitacora from './pages/Bitacora';
import Reportes from './pages/Reportes';
import EscanearQR from './pages/EscanearQR';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('biomedic_user');
  const token = localStorage.getItem('biomedic_token');
  
  if (!user || !token) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/registro',
    element: <Registro />,
  },
  {
    path: '/recuperar-contraseña',
    element: <RecuperarContraseña />,
  },
  {
    path: '/recuperar-contrasena',
    element: <RecuperarContraseña />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'equipos',
        element: <Equipos />,
      },
      {
        path: 'scanner',
        element: <EscanearQR />,
      },
      {
        path: 'equipos/nuevo',
        element: <NuevoEquipo />,
      },
      {
        path: 'equipos/:id',
        element: <EquipoDetalle />,
      },
      {
        path: 'equipos/:id/editar',
        element: <NuevoEquipo />,
      },
      {
        path: 'mantenimientos',
        element: <Mantenimientos />,
      },
      {
        path: 'usuarios',
        element: <UsuariosPage />,
      },
      {
        path: 'alertas',
        element: <Alertas />,
      },
      {
        path: 'criticidad',
        element: <Criticidad />,
      },
      {
        path: 'bitacora',
        element: <Bitacora />,
      },
      {
        path: 'reportes',
        element: <Reportes />,
      },
    ],
  },
]);
