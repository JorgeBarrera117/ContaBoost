import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct, getNextSku } from '../api/products';
import './CreateAccountModal.css';

interface Props {
  onClose: () => void;
  productToEdit?: any;
  viewOnly?: boolean;
}

export function CreateProductModal({ onClose, productToEdit, viewOnly }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    cost: '' as string | number,
    price: '' as string | number,
    hasIva: true,
    stock: '' as string | number
  });

  const { data: nextSku } = useQuery({ 
    queryKey: ['nextSku'], 
    queryFn: getNextSku,
    enabled: !productToEdit // Solo buscar si es nuevo
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        code: productToEdit.code,
        name: productToEdit.name,
        description: productToEdit.description || '',
        cost: productToEdit.cost,
        price: productToEdit.price,
        hasIva: productToEdit.hasIva,
        stock: productToEdit.stock
      });
    } else if (nextSku && !formData.code) {
      setFormData(prev => ({ ...prev, code: nextSku }));
    }
  }, [nextSku, productToEdit]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (productToEdit) {
        return updateProduct({ id: productToEdit.id, data });
      }
      return createProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      cost: Number(formData.cost),
      price: Number(formData.price),
      stock: Number(formData.stock)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel-modal" style={{ maxWidth: '550px' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>
          {viewOnly ? 'Detalles del Producto' : (productToEdit ? 'Editar Producto' : 'Nuevo Producto / Servicio')}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.8rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Código SKU</label>
              <input required disabled={viewOnly} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Ej. PROD-01" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nombre del Producto</label>
              <input required disabled={viewOnly} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1.8rem' }}>
            <label>Descripción (Opcional)</label>
            <textarea disabled={viewOnly} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'inherit', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.8rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Costo de Compra</label>
              <input type="number" step="0.01" min="0" required disabled={viewOnly} value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Precio de Venta</label>
              <input type="number" step="0.01" min="0" required disabled={viewOnly} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.8rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>¿Graba IVA?</label>
              <select disabled={viewOnly} value={formData.hasIva ? 'true' : 'false'} onChange={e => setFormData({...formData, hasIva: e.target.value === 'true'})}>
                <option value="true">Sí (15%)</option>
                <option value="false">No (0%)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Stock Inicial</label>
              <input type="number" required min="0" disabled={viewOnly} value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
          </div>

          {mutation.isError && (
            <div className="form-error">
              {(mutation.error as any)?.response?.data?.message || 'Error al guardar el producto. Verifica los datos.'}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>{viewOnly ? 'Cerrar' : 'Cancelar'}</button>
            {!viewOnly && (
              <button type="submit" className="btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Guardar Producto'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
