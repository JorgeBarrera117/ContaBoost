import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, deleteContact } from '../api/contacts';
import { CreateContactModal } from './CreateContactModal';
import { useAuth } from '../context/AuthContext';

export function ContactList() {
  const { tienePermiso } = useAuth();
  const puedeGestionar = tienePermiso('contactos.gestionar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { data: contacts, isLoading } = useQuery({ queryKey: ['contacts'], queryFn: getContacts });

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
    onError: (err: any) => alert(err.response?.data?.message || 'Error al eliminar')
  });

  const openCreate = () => {
    setContactToEdit(null);
    setIsModalOpen(true);
  };

  const openEdit = (contact: any) => {
    setContactToEdit(contact);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="loading-state">Cargando contactos...</div>;

  return (
    <>
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, alignSelf: 'center' }}>Directorio de Contactos</h2>
        {puedeGestionar && (
          <button className="btn-primary" onClick={openCreate}>+ Nuevo Contacto</button>
        )}
      </div>

      <div className="table-header" style={{ gridTemplateColumns: '150px 2fr 2fr 150px 100px' }}>
        <div className="col">RUC / Cédula</div>
        <div className="col">Razón Social</div>
        <div className="col">Dirección</div>
        <div className="col">Teléfono</div>
        <div className="col" style={{ textAlign: 'center' }}>Acciones</div>
      </div>
      
      {!contacts || contacts.length === 0 ? (
        <div className="empty-state">No hay clientes ni proveedores registrados.</div>
      ) : (
        <div className="table-body">
          {contacts.map((c: any) => (
            <div key={c.id} className="table-row" style={{ gridTemplateColumns: '150px 2fr 2fr 150px 100px' }}>
              <div className="col code" style={{ fontSize: '0.8rem' }}>{c.identification}</div>
              <div className="col" style={{ fontWeight: 600 }}>{c.name}</div>
              <div className="col" style={{ color: 'var(--text-muted)' }}>{c.address || '-'}</div>
              <div className="col code">{c.phone || '-'}</div>
              <div className="col" style={{ textAlign: 'center', display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                {puedeGestionar ? (
                  <>
                    <button onClick={() => openEdit(c)} title="Editar" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#8b5cf6'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button onClick={() => { if(window.confirm('¿Eliminar contacto?')) deleteMutation.mutate(c.id) }} title="Eliminar" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Solo Lectura</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    
    {isModalOpen && <CreateContactModal contactToEdit={contactToEdit} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
