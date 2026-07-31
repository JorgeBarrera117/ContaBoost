import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserActivity } from '../api/users';
import { ArrowLeft, User, DollarSign, FileText, Calendar } from 'lucide-react';

export function UserActivity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({ 
    queryKey: ['userActivity', id], 
    queryFn: () => getUserActivity(Number(id)) 
  });

  if (isLoading) return <div className="loading-state">Cargando auditoría...</div>;
  if (!data || !data.user) return <div className="empty-state">Usuario no encontrado.</div>;

  const { user, invoices, sessions } = data;

  const totalRecaudado = invoices.reduce((acc: number, inv: any) => acc + Number(inv.total), 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn-icon" onClick={() => navigate('/settings')} title="Volver">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <User color="var(--primary-color)" /> {user.nombre}
          </h1>
          <div style={{ color: 'var(--text-muted)' }}>{user.email} • Auditoría de Movimientos</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
            <FileText size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Facturas Emitidas</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{invoices.length}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Recaudado (Histórico)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>${totalRecaudado.toFixed(2)}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
            <Calendar size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Turnos de Caja (Aperturas)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{sessions.length}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>Últimas Facturas Emitidas</h3>
        
        {invoices.length === 0 ? (
          <div className="empty-state">Este usuario no ha emitido ninguna factura aún.</div>
        ) : (
          <div style={{ padding: '0' }}>
            <div className="table-header" style={{ gridTemplateColumns: '150px 200px 1fr 150px', borderTop: 'none', borderLeft: 'none', borderRight: 'none', background: '#f8fafc' }}>
              <div className="col">Fecha</div>
              <div className="col">N° Factura</div>
              <div className="col">Método de Pago</div>
              <div className="col" style={{ textAlign: 'right' }}>Total</div>
            </div>
            
            <div className="table-body">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="table-row" style={{ gridTemplateColumns: '150px 200px 1fr 150px' }}>
                  <div className="col">{new Date(inv.date).toLocaleString()}</div>
                  <div className="col" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{inv.invoiceNumber}</div>
                  <div className="col">
                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {inv.paymentMethod}
                    </span>
                  </div>
                  <div className="col code" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    ${Number(inv.total).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
