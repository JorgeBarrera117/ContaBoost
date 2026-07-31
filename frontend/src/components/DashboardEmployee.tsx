import { useQuery } from '@tanstack/react-query';
import { getEmployeeDashboardSummary } from '../api/dashboard';
import { 
  Bell, 
  HelpCircle, 
  Search,
  CheckCircle,
  Banknote,
  CreditCard,
  LineChart
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardEmployee() {
  const { data, isLoading } = useQuery({
    queryKey: ['employeeDashboardSummary'],
    queryFn: getEmployeeDashboardSummary
  });

  if (isLoading) return <div className="loading-state">Cargando panel de caja...</div>;

  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

  return (
    <div className="dashboard-container">
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar productos, ventas o clientes..." disabled style={{ paddingLeft: '2.5rem', background: 'transparent', border: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Bell size={20} color="var(--text-muted)" />
          <HelpCircle size={20} color="var(--text-muted)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Andrés García</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cajero Principal</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              AG
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.2rem' }}>¡Hola de nuevo, Andrés!</h1>
          <p className="subtitle" style={{ margin: 0 }}>Este es el resumen de tu actividad para hoy, {today}.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e2e8f0', color: '#0f172a', border: 'none' }}>
            <Search size={16} /> Consultar Precio
          </button>
          <Link to="/invoices/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <CheckCircle size={18} /> Nueva Venta
          </Link>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Estado de Caja */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>ESTADO DE CAJA</span>
            <span className="badge success" style={{ background: '#dcfce7', color: '#166534', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }}></div> ABIERTA
            </span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            ${data?.cashSession ? data.cashSession.currentBalance.toFixed(2) : '1,240.50'}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Saldo inicial: ${data?.cashSession ? data.cashSession.initialBalance.toFixed(2) : '250.00'}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" style={{ flex: 1, borderColor: '#cbd5e1' }}>Arqueo Parcial</button>
            <button className="btn-secondary" style={{ flex: 1, color: 'var(--danger-color)', borderColor: '#fca5a5' }}>Cerrar Caja</button>
          </div>
        </div>

        {/* Ventas del Día */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Ventas del Día</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
              <Banknote size={16} /> {data?.sales?.count || 0} Transacciones
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Banknote size={16}/> Efectivo</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>${(data?.sales?.cash || 0).toFixed(2)}</div>
              <div style={{ height: '4px', background: 'var(--primary-color)', width: '40px', marginTop: '1rem', borderRadius: '2px' }}></div>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CreditCard size={16}/> Tarjeta/Débito</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>${(data?.sales?.card || 0).toFixed(2)}</div>
              <div style={{ height: '4px', background: '#3b82f6', width: '40px', marginTop: '1rem', borderRadius: '2px' }}></div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><LineChart size={16}/> Promedio / Ticket</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>${(data?.sales?.averageTicket || 0).toFixed(2)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginTop: '1rem' }}>↗ +4.2% vs ayer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Transacciones vs Widgets */}
      <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
        
        {/* Últimas Ventas */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, marginBottom: '0.2rem' }}>Últimas Ventas Realizadas</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mostrando las últimas 5 operaciones de tu turno</div>
            </div>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>Ver Historial Completo</a>
          </div>
          
          <div className="table-header" style={{ gridTemplateColumns: '150px 1fr 100px 150px 100px', borderTop: 'none', background: '#f8fafc' }}>
            <div className="col">FOLIO / HORA</div>
            <div className="col">CLIENTE</div>
            <div className="col" style={{ textAlign: 'center' }}>ARTÍCULOS</div>
            <div className="col" style={{ textAlign: 'right' }}>TOTAL</div>
            <div className="col" style={{ textAlign: 'center' }}>ESTADO</div>
          </div>
          
          <div className="table-body">
            {data?.recentSales?.slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="table-row" style={{ gridTemplateColumns: '150px 1fr 100px 150px 100px' }}>
                <div className="col">
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>#{tx.invoiceNumber.split('-')[2] || tx.invoiceNumber}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div className="col">
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx.contactName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consumidor Final</div>
                </div>
                <div className="col" style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ background: '#e2e8f0', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {tx.itemsCount}x
                  </span>
                </div>
                <div className="col" style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>${tx.amount.toFixed(2)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 600 }}>{tx.paymentMethod}</div>
                </div>
                <div className="col" style={{ textAlign: 'center' }}>
                  <span className="badge success" style={{ background: '#dcfce7', color: '#166534', border: 'none' }}>Pagado</span>
                </div>
              </div>
            ))}
            {data?.recentSales?.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Aún no hay ventas en este turno.
              </div>
            )}
          </div>
        </div>

        {/* Widgets Inferiores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ background: '#0f172a', borderRadius: '12px', padding: '1.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#fff' }}>Soporte en línea</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>¿Necesitas ayuda con una devolución o factura?</p>
            </div>
            <button style={{ background: '#fff', color: '#0f172a', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Chat Directo
            </button>
          </div>

          <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={32} style={{ marginBottom: '0.5rem', color: '#cbd5e1' }} />
            <div style={{ fontSize: '0.95rem' }}>No hay tareas pendientes para este turno</div>
          </div>

        </div>

      </div>
    </div>
  );
}
