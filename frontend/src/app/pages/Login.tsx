import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogIn, Mail, Lock, AlertCircle, QrCode, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyTwoFactor } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setAwaitingCode(true);
        toast.success('Codigo de verificacion enviado a tu correo');
      } else {
        setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
      }
    } catch {
      setError('Error al iniciar sesion. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await verifyTwoFactor(email, code);
      if (success) {
        toast.success('Bienvenido a BiomedicTrack');
        navigate('/dashboard');
      } else {
        setError('Codigo incorrecto o expirado.');
      }
    } catch {
      setError('Error al verificar el codigo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <QrCode className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BiomedicTrack</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestion de Equipos Biomedicos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {awaitingCode ? 'Verificacion 2FA' : 'Iniciar Sesion'}
            </h2>
            <p className="text-gray-600 mt-1">
              {awaitingCode ? `Ingresa el codigo enviado a ${email}` : 'Accede a tu cuenta'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!awaitingCode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electronico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="********"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-gray-600">Recordarme</span>
                </label>
                <Link to="/recuperar-contraseña" className="text-blue-600 hover:text-blue-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando codigo...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesion
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Codigo de 6 digitos
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-[0.4em]"
                    placeholder="000000"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Verificar codigo
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAwaitingCode(false);
                  setCode('');
                  setError('');
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Cambiar correo o contraseña
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              ¿Eres administrador?{' '}
              <Link to="/registro" className="text-blue-600 hover:text-blue-700 font-medium">
                Registra tu cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
