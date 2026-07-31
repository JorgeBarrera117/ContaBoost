import { useQuery } from '@tanstack/react-query';
import { getPurchases } from '../api/purchases';

export function PurchaseList() {
  const { data: purchases, isLoading } = useQuery({ queryKey: ['purchases'], queryFn: getPurchases });

  if (isLoading) return <div className="loading-state">Cargando historial de compras...</div>;

  return (
    <div className="glass-panel">
      <div className="table-header" style={{ gridTemplateColumns: '150px 200px 2fr 150px 150px 150px' }}>
        <div className="col">FECHA</div>
        <div className="col">NO. FACTURA</div>
        <div className="col">PROVEEDOR</div>
        <div className="col">SUBTOTAL</div>
        <div className="col">IVA</div>
        <div className="col">TOTAL</div>
      </div>
      
      {!purchases || purchases.length === 0 ? (
        <div className="empty-state">No hay compras registradas. Registra el inventario comprando a tus proveedores.</div>
      ) : (
        <div className="table-body">
          {purchases.map((p: any) => (
            <div key={p.id} className="table-row" style={{ gridTemplateColumns: '150px 200px 2fr 150px 150px 150px' }}>
              <div className="col" style={{ fontWeight: 'bold' }}>
                {new Date(p.date).toLocaleDateString()}
              </div>
              <div className="col code" style={{ color: 'var(--primary-light)' }}>
                {p.purchaseNumber}
              </div>
              <div className="col">
                {p.contact?.name || 'Desconocido'}
              </div>
              <div className="col code" style={{ color: 'var(--primary-color)' }}>
                $ {Number(p.subtotal).toFixed(2)}
              </div>
              <div className="col code" style={{ color: 'var(--primary-color)' }}>
                $ {Number(p.ivaAmount).toFixed(2)}
              </div>
              <div className="col code" style={{ color: 'var(--primary-color)' }}>
                $ {Number(p.total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
