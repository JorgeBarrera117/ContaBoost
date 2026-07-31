import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permisoRequerido?: string | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permisoRequerido }) => {
  const { token, tienePermiso } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (permisoRequerido && !tienePermiso(permisoRequerido)) {
    // Podría renderizar un componente de 403 Forbidden
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes los permisos necesarios para ver esta página.</p>
          <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
