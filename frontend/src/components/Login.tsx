import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, usuario, roles, permisos } = response.data;
      
      login(access_token, usuario, roles, permisos);
      navigate('/');
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Credenciales inválidas');
      } else {
        setError('Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--main-bg)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', margin: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ margin: '0 auto 1rem auto' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 1 0-4h16v-4" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Conta<span style={{ color: 'var(--text-muted)' }}>Boost</span></h2>
          <p className="subtitle" style={{ marginTop: '0.5rem' }}>Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="badge danger" style={{ display: 'block', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
