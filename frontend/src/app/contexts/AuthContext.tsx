import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  verifyTwoFactor: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('biomedic_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await api.login(email, password);
      return true;
    } catch {
      return false;
    }
  };

  const verifyTwoFactor = async (email: string, code: string): Promise<boolean> => {
    try {
      const session = await api.verifyTwoFactor(email, code);
      setUser(session.user);
      localStorage.setItem('biomedic_token', session.token);
      localStorage.setItem('biomedic_user', JSON.stringify(session.user));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('biomedic_token');
    localStorage.removeItem('biomedic_user');
  };

  const register = async (
    userData: Omit<User, 'id' | 'createdAt'> & { password?: string }
  ): Promise<boolean> => {
    try {
      await api.registerGerencia({
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        telefono: userData.telefono,
        password: userData.password ?? 'Temporal123',
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        verifyTwoFactor,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
