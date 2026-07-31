import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContact, updateContact } from '../api/contacts';
import './CreateAccountModal.css';

interface Props {
  onClose: () => void;
  contactToEdit?: any;
}

export function CreateContactModal({ onClose, contactToEdit }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    identification: '',
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        identification: contactToEdit.identification,
        name: contactToEdit.name,
        address: contactToEdit.address || '',
        phone: contactToEdit.phone || '',
        email: contactToEdit.email || ''
      });
    }
  }, [contactToEdit]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (contactToEdit) {
        return updateContact({ id: contactToEdit.id, data });
      }
      return createContact(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel-modal" style={{ maxWidth: '550px' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>
          {contactToEdit ? 'Editar Contacto' : 'Nuevo Cliente / Proveedor'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.8rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>RUC / Cédula</label>
              <input required value={formData.identification} onChange={e => setFormData({...formData, identification: e.target.value})} placeholder="Ej. 1700000000001" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Razón Social / Nombres</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1.8rem' }}>
            <label>Dirección Física</label>
            <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ej. Av. Amazonas N21-147" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.8rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Teléfono</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Ej. 0999999999" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Correo Electrónico</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Ej. correo@empresa.com" />
            </div>
          </div>

          {mutation.isError && (
            <div className="form-error">
              {(mutation.error as any)?.response?.data?.message || 'Error al guardar el contacto.'}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Contacto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
