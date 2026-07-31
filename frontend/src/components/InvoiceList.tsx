import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '../api/invoices';

export function InvoiceList() {
  const { data: invoices, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: getInvoices });

  if (isLoading) return <div className="loading-state">Cargando ventas...</div>;

  return (
    <div className="glass-panel">
      <div className="table-header" style={{ gridTemplateColumns: '150px 150px 1fr 150px 150px 150px' }}>
        <div className="col">Fecha</div>
        <div className="col">Folio / Factura</div>
        <div className="col">Cliente</div>
        <div className="col" style={{ textAlign: 'right' }}>Subtotal</div>
        <div className="col" style={{ textAlign: 'right' }}>IVA</div>
        <div className="col" style={{ textAlign: 'right' }}>Total</div>
      </div>
      
      {!invoices || invoices.length === 0 ? (
        <div className="empty-state">No hay ventas registradas aún.</div>
      ) : (
        <div className="table-body">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="table-row" style={{ gridTemplateColumns: '150px 150px 1fr 150px 150px 150px' }}>
              <div className="col">{new Date(inv.date).toLocaleDateString()}</div>
              <div className="col" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{inv.invoiceNumber}</div>
              <div className="col">{inv.contact?.name}</div>
              <div className="col code" style={{ textAlign: 'right' }}>$ {Number(inv.subtotal).toFixed(2)}</div>
              <div className="col code" style={{ textAlign: 'right' }}>$ {Number(inv.ivaAmount).toFixed(2)}</div>
              <div className="col code" style={{ textAlign: 'right', fontWeight: 'bold' }}>$ {Number(inv.total).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
