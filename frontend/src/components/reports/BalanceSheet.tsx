import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBalanceSheet } from '../../api/reports';

export function BalanceSheet() {
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['balanceSheet', endDate],
    queryFn: () => getBalanceSheet(endDate)
  });

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const getIndentLevel = (code: string) => {
    const parts = code.split('.');
    return (parts.length - 1) * 20;
  };

  const renderSection = (title: string, lines: any[], total: number, colorHex: string, bgHex: string) => (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: colorHex, marginBottom: '1rem', borderBottom: `1px solid ${bgHex}`, paddingBottom: '0.5rem' }}>{title}</h3>
      <div className="table-header" style={{ gridTemplateColumns: '150px 1fr 150px' }}>
        <div className="col">CÓDIGO</div>
        <div className="col">CUENTA</div>
        <div className="col" style={{ textAlign: 'right' }}>SALDO</div>
      </div>
      
      <div className="table-body">
        {lines.map((line: any) => (
          <div key={line.accountId} className="table-row" style={{ gridTemplateColumns: '150px 1fr 150px' }}>
            <div className="col code" style={{ fontSize: '0.85rem' }}>{line.accountCode}</div>
            <div className="col" style={{ paddingLeft: `${getIndentLevel(line.accountCode)}px`, fontWeight: getIndentLevel(line.accountCode) === 0 ? 'bold' : 'normal', color: line.accountId === 'net-income-auto' ? 'var(--primary-color)' : 'var(--text-main)' }}>
              {line.accountName}
            </div>
            <div className="col code" style={{ textAlign: 'right', fontWeight: line.accountId === 'net-income-auto' ? 'bold' : 'normal' }}>
              $ {line.balance.toFixed(2)}
            </div>
          </div>
        ))}
        {lines.length === 0 && (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sin movimientos.</div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: bgHex, borderRadius: '0 0 8px 8px', fontWeight: 'bold' }}>
        <span>Total {title}:</span>
        <span className="code">$ {total.toFixed(2)}</span>
      </div>
    </div>
  );

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-main)', margin: 0, marginBottom: '0.5rem' }}>Balance General</h2>
          <p className="subtitle" style={{ margin: 0 }}>Estado de Situación Financiera (Activo = Pasivo + Patrimonio).</p>
        </div>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Cortado a la Fecha:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '0.75rem 1rem' }}>Generar</button>
        </form>
      </div>

      {!endDate ? (
        <div className="empty-state">
          Selecciona una fecha de corte para generar el Balance General.
        </div>
      ) : isLoading ? (
        <div className="loading-state">Calculando saldos y cuadrando la ecuación contable...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Columna Izquierda: Activos */}
            <div>
              {renderSection('ACTIVOS', data?.assetLines || [], data?.summary?.totalAssets || 0, '#3b82f6', 'rgba(59, 130, 246, 0.1)')}
            </div>

            {/* Columna Derecha: Pasivos y Patrimonio */}
            <div>
              {renderSection('PASIVOS', data?.liabilityLines || [], data?.summary?.totalLiabilities || 0, '#ef4444', 'rgba(239, 68, 68, 0.1)')}
              {renderSection('PATRIMONIO', data?.equityLines || [], data?.summary?.totalEquity || 0, '#8b5cf6', 'rgba(139, 92, 246, 0.1)')}
            </div>
          </div>

          {/* ECUACIÓN CONTABLE (COMPROBACIÓN) */}
          <div style={{ 
            marginTop: '2rem', 
            display: 'flex', 
            justifyContent: 'center',
            gap: '3rem',
            alignItems: 'center',
            background: data?.summary?.isBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            padding: '2rem', 
            borderRadius: '12px', 
            border: `2px solid ${data?.summary?.isBalanced ? '#10b981' : '#ef4444'}`,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>TOTAL ACTIVOS</div>
              <div className="code" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                $ {(data?.summary?.totalAssets || 0).toFixed(2)}
              </div>
            </div>
            
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>=</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>PASIVO + PATRIMONIO</div>
              <div className="code" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                $ {(data?.summary?.totalLiabilitiesAndEquity || 0).toFixed(2)}
              </div>
            </div>
          </div>
          
          {!data?.summary?.isBalanced && (
            <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--danger-color)', fontWeight: 'bold' }}>
              ⚠️ ALERTA: El balance no cuadra. Revisa los asientos del Diario.
            </div>
          )}
          {data?.summary?.isBalanced && (
            <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--success-color)', fontWeight: 'bold' }}>
              ✅ Ecuación Contable Cuadrada Perfectamente
            </div>
          )}
        </>
      )}
    </div>
  );
}
