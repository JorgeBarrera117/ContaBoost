import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUserStatus } from '../api/users';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Power, UserPlus, Eye } from 'lucide-react';

export function UserManagement() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol: 'Vendedor' }); // Vendedor or Administrador
  
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setFormData({ nombre: '', email: '', password: '', rol: 'Vendedor' });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number, activo: boolean }) => updateUserStatus(id, activo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ 
      nombre: formData.nombre,
      email: formData.email,
      password_hash: formData.password,
      rol_id: formData.rol === 'Administrador' ? 1 : 2,
      negocio_id: 1 
    }); 
  };

  if (isLoading) return <div className="loading-state">Cargando personal...</div>;

  return (
    <>
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={24} color="var(--primary-color)" /> Gestión de Personal</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Administra accesos y revisa los movimientos de tus vendedores.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} /> Nuevo Empleado
        </button>
      </div>

      <div className="table-header" style={{ gridTemplateColumns: '50px 2fr 2fr 1fr 1fr 150px' }}>
        <div className="col">ID</div>
        <div className="col">Nombre</div>
        <div className="col">Email</div>
        <div className="col">Rol</div>
        <div className="col">Estado</div>
        <div className="col" style={{ textAlign: 'center' }}>Acciones</div>
      </div>
      
      {!users || users.length === 0 ? (
        <div className="empty-state">No hay usuarios registrados.</div>
      ) : (
        <div className="table-body">
          {users.map((u: any) => (
            <div key={u.id} className={`table-row ${!u.activo ? 'inactive-row' : ''}`} style={{ gridTemplateColumns: '50px 2fr 2fr 1fr 1fr 150px' }}>
              <div className="col code">{u.id}</div>
              <div className="col" style={{ fontWeight: 600 }}>{u.nombre}</div>
              <div className="col" style={{ color: 'var(--text-muted)' }}>{u.email}</div>
              <div className="col">
                <span style={{ 
                  background: u.rol === 'Administrador' ? '#fef08a' : '#e0e7ff', 
                  color: u.rol === 'Administrador' ? '#854d0e' : '#3730a3',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
                }}>
                  {u.rol}
                </span>
              </div>
              <div className="col">
                {u.activo ? (
                  <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14}/> Activo</span>
                ) : (
                  <span style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px' }}><Power size={14}/> Inactivo</span>
                )}
              </div>
              <div className="col" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button 
                  className="btn-icon" 
                  title="Ver Movimientos y Auditoría"
                  onClick={() => navigate(`/settings/users/${u.id}`)}
                >
                  <Eye size={18} color="var(--primary-color)" />
                </button>
                <button 
                  className="btn-icon" 
                  title={u.activo ? 'Desactivar Usuario' : 'Reactivar Usuario'}
                  onClick={() => toggleStatusMutation.mutate({ id: u.id, activo: !u.activo })}
                >
                  <Power size={18} color={u.activo ? "var(--danger-color)" : "var(--success-color)"} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .inactive-row { opacity: 0.6; background-color: #f8fafc; }
      `}} />
    </div>

    {isModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <h3 style={{ marginTop: 0 }}>Crear Nuevo Empleado</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Correo Electrónico (Para Login)</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Contraseña Temporal</label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Rol Inicial</label>
              <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                <option value="Vendedor">Vendedor</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear Empleado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
