import { useEffect, useState } from 'react';
import { Users, Plus, Mail, Phone, Shield, Calendar, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { User } from '../types';
import { api } from '../services/api';

export default function UsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: 'Temporal123',
    role: 'ingeniero' as User['role'],
  });

  useEffect(() => {
    if (user?.role === 'gerencia') {
      api.getUsuarios()
        .then(setUsuarios)
        .catch((error) => toast.error(error.message));
    }
  }, [user?.role]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const nuevoUsuario = await api.createUsuario(formData);
      setUsuarios([nuevoUsuario, ...usuarios]);
      setShowNewUserModal(false);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: 'Temporal123',
        role: 'ingeniero',
      });
      toast.success('Usuario creado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el usuario');
    }
  };

  const openEditModal = (usuario: User) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono ?? '',
      password: '',
      role: usuario.role,
    });
    setShowNewUserModal(true);
  };

  const closeModal = () => {
    setShowNewUserModal(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: 'Temporal123',
      role: 'ingeniero',
    });
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) {
      await handleCreateUser(e);
      return;
    }

    try {
      const updated = await api.updateUsuario(editingUser.id, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        role: formData.role,
        password: formData.password || undefined,
      });
      setUsuarios(usuarios.map((usuario) => usuario.id === updated.id ? updated : usuario));
      closeModal();
      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el usuario');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.deleteUsuario(userToDelete.id);
      setUsuarios(usuarios.filter((usuario) => usuario.id !== userToDelete.id));
      setUserToDelete(null);
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el usuario');
    }
  };

  // Solo Gerencia puede acceder
  if (user?.role !== 'gerencia') {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">Solo el personal de Gerencia puede acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema biomédico
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowNewUserModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Usuarios</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{usuarios.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Gerencia</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {usuarios.filter(u => u.role === 'gerencia').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Ingenieros</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {usuarios.filter(u => u.role === 'ingeniero').length}
          </p>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                usuario.role === 'gerencia'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {usuario.role === 'gerencia' ? 'Gerencia' : 'Ingeniero'}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {usuario.nombre} {usuario.apellido}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{usuario.email}</span>
              </div>
              {usuario.telefono && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{usuario.telefono}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Desde {usuario.createdAt.toLocaleDateString('es-CO')}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => openEditModal(usuario)}
                className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </button>
              <button
                onClick={() => setUserToDelete(usuario)}
                disabled={usuario.id === user?.id}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title={usuario.id === user?.id ? 'No puedes eliminar tu propio perfil' : 'Eliminar perfil'}
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Perfil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingUser ? 'Editar Perfil' : 'Nuevo Usuario'}
            </h3>
            
            <form
              onSubmit={handleSubmitUser}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ingeniero">Ingeniero Biomédico</option>
                  <option value="gerencia">Gerencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña temporal
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingUser}
                  minLength={6}
                  placeholder={editingUser ? 'Dejar vacia para conservar' : undefined}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Eliminar Perfil</h3>
            <p className="text-gray-600 mb-6">
              Esta accion eliminara de la base de datos a{' '}
              <strong>{userToDelete.nombre} {userToDelete.apellido}</strong>. No se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
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
