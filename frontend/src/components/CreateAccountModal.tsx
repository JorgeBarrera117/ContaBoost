import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccount, type CreateAccountDto } from '../api/accounts';
import './CreateAccountModal.css';

interface CreateAccountModalProps {
  onClose: () => void;
}

export function CreateAccountModal({ onClose }: CreateAccountModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateAccountDto>({
    code: '',
    name: '',
    type: 'ASSET',
  });

  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel-modal" onClick={e => e.stopPropagation()}>
        <h2>Nueva Cuenta Contable</h2>
        <p className="modal-subtitle">Añade una nueva cuenta al catálogo del sistema.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Código de Cuenta</label>
            <input
              type="text"
              id="code"
              placeholder="Ej. 1100"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              placeholder="Ej. Bancos Nacionales"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Tipo de Cuenta</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="ASSET">Activo (Asset)</option>
              <option value="LIABILITY">Pasivo (Liability)</option>
              <option value="EQUITY">Patrimonio (Equity)</option>
              <option value="REVENUE">Ingreso (Revenue)</option>
              <option value="EXPENSE">Gasto (Expense)</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Cuenta'}
            </button>
          </div>
          
          {mutation.isError && (
            <div className="form-error">Ocurrió un error al guardar. Verifica los datos o tu conexión.</div>
          )}
        </form>
      </div>
    </div>
  );
}
