import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, seedWarehouse, deleteProduct } from '../api/products';
import { CreateProductModal } from './CreateProductModal';
import { useAuth } from '../context/AuthContext';

export function ProductList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  
  const { tienePermiso } = useAuth();
  const puedeEditar = tienePermiso('inventario.editar');
  
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const seedMutation = useMutation({
    mutationFn: seedWarehouse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (err: any) => alert(err.response?.data?.message || 'Error al eliminar')
  });

  const openCreate = () => {
    setProductToEdit(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const openEdit = (product: any) => {
    setProductToEdit(product);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const openView = (product: any) => {
    setProductToEdit(product);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="loading-state">Cargando inventario...</div>;

  return (
    <>
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', gap: '1rem' }}>
        {puedeEditar && (
          <>
            <button className="btn-secondary" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? 'Creando...' : 'Inicializar Bodega Matriz'}
            </button>
            <button className="btn-primary" onClick={openCreate}>+ Nuevo Producto</button>
          </>
        )}
      </div>

      <div className="table-header" style={{ gridTemplateColumns: '100px 2fr 100px 100px 100px 100px 140px' }}>
        <div className="col">Código</div>
        <div className="col">Producto</div>
        <div className="col" style={{ textAlign: 'right' }}>Costo</div>
        <div className="col" style={{ textAlign: 'right' }}>P. Venta</div>
        <div className="col" style={{ textAlign: 'center' }}>IVA</div>
        <div className="col" style={{ textAlign: 'center' }}>Stock</div>
        <div className="col" style={{ textAlign: 'center' }}>Acciones</div>
      </div>
      
      {!products || products.length === 0 ? (
        <div className="empty-state">No hay productos en bodega.</div>
      ) : (
        <div className="table-body">
          {products.map((p: any) => (
            <div key={p.id} className="table-row" style={{ gridTemplateColumns: '100px 2fr 100px 100px 100px 100px 140px' }}>
              <div className="col code" style={{ fontSize: '0.8rem' }}>{p.code}</div>
              <div className="col" style={{ fontWeight: 600 }}>{p.name}</div>
              <div className="col code" style={{ textAlign: 'right' }}>$ {Number(p.cost).toFixed(2)}</div>
              <div className="col code" style={{ textAlign: 'right', color: 'var(--primary-color)' }}>$ {Number(p.price).toFixed(2)}</div>
              <div className="col" style={{ textAlign: 'center' }}>
                <span className={`badge ${p.hasIva ? 'badge-error' : 'badge-success'}`}>
                  {p.hasIva ? '15%' : '0%'}
                </span>
              </div>
              <div className="col" style={{ textAlign: 'center', fontWeight: 'bold', color: p.stock <= 5 ? '#ef4444' : '#10b981' }}>
                {p.stock}
              </div>
              <div className="col" style={{ textAlign: 'center', display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                <button onClick={() => openView(p)} title="Ver Detalles" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#34d399'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                {puedeEditar && (
                  <>
                    <button onClick={() => openEdit(p)} title="Editar" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#8b5cf6'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button onClick={() => { if(window.confirm('¿Eliminar producto?')) deleteMutation.mutate(p.id) }} title="Eliminar" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    
    {isModalOpen && <CreateProductModal viewOnly={isViewOnly} productToEdit={productToEdit} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
