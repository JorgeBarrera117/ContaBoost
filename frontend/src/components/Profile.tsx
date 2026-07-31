import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProfile, updatePassword } from '../api/auth';
import { User, Lock, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { logout } = useAuth();
  const { data: userProfile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const passwordMutation = useMutation({
    mutationFn: (pwd: string) => updatePassword(pwd),
    onSuccess: () => {
      setSuccessMsg('Contraseña actualizada correctamente. Por seguridad, deberás iniciar sesión nuevamente.');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 3000);
    },
    onError: () => {
      setPasswordError('Error al actualizar la contraseña.');
    }
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSuccessMsg('');
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    passwordMutation.mutate(passwordForm.newPassword);
  };

  if (isLoading) return <div className="loading-state">Cargando perfil...</div>;

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
        <User size={28} color="var(--primary-color)" /> Mi Perfil
      </h2>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
            {userProfile?.nombre ? userProfile.nombre.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{userProfile?.nombre}</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>{userProfile?.email}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fef08a', color: '#854d0e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              <Shield size={14} /> Rol Principal asignado
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={20} color="var(--primary-color)" /> Seguridad de la Cuenta
        </h3>

        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '400px' }}>
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input 
              type="password" 
              value={passwordForm.newPassword} 
              onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Confirmar Nueva Contraseña</label>
            <input 
              type="password" 
              value={passwordForm.confirmPassword} 
              onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
              placeholder="Repite la contraseña"
            />
          </div>

          {passwordError && <div style={{ color: 'var(--danger-color)', marginTop: '1rem', fontSize: '0.9rem' }}>{passwordError}</div>}
          {successMsg && <div style={{ color: 'var(--success-color)', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{successMsg}</div>}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={passwordMutation.isPending || !passwordForm.newPassword}
          >
            <Save size={18} /> {passwordMutation.isPending ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
