import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmployeeDashboardSummary } from '../api/dashboard';
import { 
  Banknote,
  CreditCard,
  Lock,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function ReportsEmployee() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employeeDashboardSummary'],
    queryFn: getEmployeeDashboardSummary
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  if (isLoading) return <div className="loading-state">Generando reporte de turno...</div>;

  const totalSales = data?.sales?.total || 0;
  const totalCash = data?.sales?.cash || 0;
  const totalCard = data?.sales?.card || 0;
  const initialBalance = data?.cashSession?.initialBalance || 0;
  const expectedCash = initialBalance + totalCash;
  const averageTicket = data?.sales?.averageTicket || 0;
  const itemsPerSale = data?.sales?.itemsPerSale || 0;
  
  const transactions = data?.recentSales || [];
  const paginatedTx = transactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Colores para la gráfica (el pico más alto más oscuro)
  const maxSale = Math.max(...(data?.salesByHour?.map((d: any) => d.amount) || [0]));

  return (
    <div className="dashboard-container" style={{ padding: '0 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '2rem' }}>Reporte de Turno</h1>
          <p className="subtitle" style={{ margin: 0 }}>Revisa tu actividad y balances del día actual.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', borderColor: '#cbd5e1' }}>
            <Download size={18} /> Descargar PDF
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} /> Cerrar Caja
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Ventas Totales */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
            VENTAS TOTALES DEL TURNO
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              $ {(totalSales).toFixed(2)}
            </div>
            <Banknote size={60} color="#e2e8f0" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              ↗ +12.5%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>vs. promedio turno anterior</span>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="card">
          <h3 style={{ margin: 0, marginBottom: '1.5rem' }}>Métodos de Pago</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <CreditCard size={18} /> Tarjeta
              </div>
              <div style={{ fontWeight: 'bold' }}>${totalCard.toFixed(2)}</div>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
              <div style={{ width: `${totalSales ? (totalCard/totalSales)*100 : 0}%`, height: '100%', background: '#334155', borderRadius: '4px' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <Banknote size={18} /> Efectivo
              </div>
              <div style={{ fontWeight: 'bold' }}>${totalCash.toFixed(2)}</div>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
              <div style={{ width: `${totalSales ? (totalCash/totalSales)*100 : 0}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>

        {/* Cierre Actual */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: 0, marginBottom: '1rem' }}>Cierre Actual</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Fondo Inicial: ${(initialBalance).toFixed(2)}</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            $ {(expectedCash).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Efectivo esperado en caja</div>
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            BALANCED
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '0.2rem' }}>Transacciones del Día</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Últimas {transactions.length} transacciones procesadas en este punto de venta.</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ padding: '0.5rem' }}><Filter size={18} /></button>
            <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={() => refetch()}><RefreshCw size={18} /></button>
          </div>
        </div>
        
        <div className="table-header" style={{ gridTemplateColumns: '150px 100px 1fr 150px 150px 120px', borderTop: 'none', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          <div className="col">ID TRANSACCIÓN</div>
          <div className="col">HORA</div>
          <div className="col">CONCEPTO</div>
          <div className="col">MÉTODO</div>
          <div className="col" style={{ textAlign: 'right' }}>MONTO</div>
          <div className="col" style={{ textAlign: 'center' }}>ESTADO</div>
        </div>
        
        <div className="table-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {paginatedTx.map((tx: any) => (
            <div key={tx.id} className="table-row" style={{ gridTemplateColumns: '150px 100px 1fr 150px 150px 120px', alignItems: 'center', padding: '1rem' }}>
              <div className="col">
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{tx.invoiceNumber.split('-')[2] || tx.invoiceNumber}</div>
              </div>
              <div className="col">
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <div className="col">
                <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>Venta a {tx.contactName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.itemsCount} artículo(s)</div>
              </div>
              <div className="col" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {tx.paymentMethod === 'CARD' ? <CreditCard size={16} color="var(--text-muted)" /> : <Banknote size={16} color="var(--text-muted)" />}
                <span style={{ fontSize: '0.9rem' }}>{tx.paymentMethod === 'CARD' ? 'Tarjeta' : 'Efectivo'}</span>
              </div>
              <div className="col" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                ${tx.amount.toFixed(2)}
              </div>
              <div className="col" style={{ textAlign: 'center' }}>
                <span className="badge success" style={{ background: '#dcfce7', color: '#166534', border: 'none' }}>Completado</span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hay transacciones registradas en este turno.
            </div>
          )}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mostrando {paginatedTx.length} de {transactions.length} registros
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} disabled={page * itemsPerPage >= transactions.length} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Chart and Efficiency */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Gráfico */}
        <div className="card">
          <h3 style={{ margin: 0, marginBottom: '2rem' }}>Tendencia de Ventas (Turno Hoy)</h3>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.salesByHour || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {data?.salesByHour?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.amount === maxSale && maxSale > 0 ? '#0f172a' : '#dbeafe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency */}
        <div className="card" style={{ background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#fff' }}>Resumen de Eficiencia</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>Desempeño del punto de venta en tiempo real.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>TICKET PROMEDIO</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${(averageTicket).toFixed(2)}</div>
              </div>
              <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>ITEMS / VENTA</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{(itemsPerSale).toFixed(1)}</div>
              </div>
            </div>
          </div>
          
          <button style={{ width: '100%', padding: '1rem', background: '#6ee7b7', color: '#064e3b', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.2s' }}>
            Solicitar Revisión de Supervisor
          </button>
        </div>

      </div>
    </div>
  );
}
