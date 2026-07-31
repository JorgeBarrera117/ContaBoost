import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/dashboard';
import { 
  Bell, 
  HelpCircle, 
  Search,
  TrendingUp,
  Receipt,
  Landmark,
  AlertTriangle,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user, roles } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary
  });

  // Simulated trend data for the chart
  const trendData = [
    { name: 'LUN', val: 400 },
    { name: 'MAR', val: 300 },
    { name: 'MIE', val: 550 },
    { name: 'JUE', val: 450 },
    { name: 'VIE', val: 700 },
    { name: 'SAB', val: 800 },
    { name: 'DOM', val: 650 },
  ];

  if (isLoading) return <div className="loading-state">Cargando panel de control...</div>;

  return (
    <div className="dashboard-container">
      {/* Header del Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.2rem' }}>Panel de Control</h1>
          <p className="subtitle" style={{ margin: 0 }}>Bienvenido de nuevo. Aquí está el resumen financiero de hoy.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => alert('Filtro de fechas estará disponible pronto.')}>Últimos 30 días</button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', cursor: 'pointer' }} onClick={() => alert('Generando reporte PDF...')}>
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>VENTAS TOTALES</span>
            <Receipt size={20} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            ${(data?.kpis?.totalSales || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} /> +12.5% vs mes anterior
          </div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>GASTOS OPERATIVOS</span>
            <Receipt size={20} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            ${(data?.kpis?.totalExpenses || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} /> +4.2% presupuesto agotado al 62%
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>UTILIDAD NETA</span>
            <Landmark size={20} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            ${(data?.kpis?.netIncome || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} /> +8.1% margen de beneficio 63.6%
          </div>
        </div>
      </div>

      {/* Grid Principal: Transacciones vs Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Últimas Transacciones */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Últimas Transacciones</h3>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>Ver todas</a>
          </div>
          
          <div className="table-header" style={{ gridTemplateColumns: '80px 1fr 120px 120px 120px 100px', borderTop: 'none', background: '#fff' }}>
            <div className="col"></div>
            <div className="col">CLIENTE / PROVEEDOR</div>
            <div className="col">FECHA</div>
            <div className="col">CATEGORÍA</div>
            <div className="col" style={{ textAlign: 'right' }}>MONTO</div>
            <div className="col" style={{ textAlign: 'center' }}>ESTADO</div>
          </div>
          
          <div className="table-body">
            {data?.recentTransactions?.map((tx: any) => (
              <div key={tx.id} className="table-row" style={{ gridTemplateColumns: '80px 1fr 120px 120px 120px 100px' }}>
                <div className="col" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--main-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {tx.contactName.substring(0,2).toUpperCase()}
                  </div>
                </div>
                <div className="col" style={{ fontWeight: 500 }}>{tx.contactName}</div>
                <div className="col" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {new Date(tx.date).toLocaleDateString()}
                </div>
                <div className="col" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{tx.category}</div>
                <div className="col code" style={{ textAlign: 'right', fontWeight: 'bold', color: tx.type === 'IN' ? 'var(--success-color)' : 'var(--text-main)' }}>
                  {tx.type === 'IN' ? '+' : '-'}${tx.amount.toFixed(2)}
                </div>
                <div className="col" style={{ textAlign: 'center' }}>
                  <span className="badge success" style={{ background: '#f1f5f9', color: 'var(--text-muted)', border: 'none' }}>PAGADO</span>
                </div>
              </div>
            ))}
            {data?.recentTransactions?.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No hay transacciones recientes.
              </div>
            )}
          </div>
        </div>

        {/* Widgets Laterales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Stock Bajo */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', margin: 0, marginBottom: '1.5rem' }}>
              <AlertTriangle size={20} /> Stock Bajo
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data?.lowStockItems?.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--main-bg)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ref: {item.code}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.stock} disp.</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MIN: 5</div>
                  </div>
                </div>
              ))}
              {data?.lowStockItems?.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Todo el inventario está en niveles óptimos.</div>
              )}
            </div>
            
            <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', borderColor: '#cbd5e1' }}>Generar Orden de Compra</button>
          </div>

          {/* Tendencia */}
          <div className="card">
            <h3 style={{ margin: 0, marginBottom: '1.5rem' }}>Tendencia</h3>
            <div style={{ height: '150px', width: '100%', marginBottom: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip cursor={{ fill: 'var(--main-bg)' }} />
                  <Bar dataKey="val" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              El volumen de ventas ha incrementado un <strong style={{ color: 'var(--text-main)' }}>18%</strong> en comparación con el fin de semana pasado.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
