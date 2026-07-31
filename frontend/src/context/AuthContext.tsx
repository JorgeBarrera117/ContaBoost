import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: number;
  nombre: string;
  email: string;
  negocio_id: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  roles: string[];
  permisos: string[];
  login: (token: string, user: User, roles: string[], permisos: string[]) => void;
  logout: () => void;
  tienePermiso: (permiso: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permisos, setPermisos] = useState<string[]>([]);

  useEffect(() => {
    // Al cargar, revisar si hay sesión guardada
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRoles = localStorage.getItem('roles');
    const storedPermisos = localStorage.getItem('permisos');

    if (storedToken && storedUser && storedRoles && storedPermisos) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRoles(JSON.parse(storedRoles));
      setPermisos(JSON.parse(storedPermisos));
    }
  }, []);

  const login = (newToken: string, newUser: User, newRoles: string[], newPermisos: string[]) => {
    setToken(newToken);
    setUser(newUser);
    setRoles(newRoles);
    setPermisos(newPermisos);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('roles', JSON.stringify(newRoles));
    localStorage.setItem('permisos', JSON.stringify(newPermisos));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRoles([]);
    setPermisos([]);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    localStorage.removeItem('permisos');
  };

  const tienePermiso = (permiso: string | string[]) => {
    if (Array.isArray(permiso)) {
      return permiso.some(p => permisos.includes(p));
    }
    return permisos.includes(permiso);
  };

  return (
    <AuthContext.Provider value={{ token, user, roles, permisos, login, logout, tienePermiso }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
