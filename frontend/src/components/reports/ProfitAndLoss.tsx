import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfitAndLoss } from '../../api/reports';

export function ProfitAndLoss() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['profitAndLoss', startDate, endDate],
    queryFn: () => getProfitAndLoss(startDate, endDate)
  });

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const getIndentLevel = (code: string) => {
    const parts = code.split('.');
    return (parts.length - 1) * 20;
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, marginBottom: '0.5rem' }}>Estado de Resultados (P&L)</h2>
          <p className="subtitle" style={{ margin: 0 }}>Análisis de ingresos, gastos y utilidad neta del período.</p>
        </div>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Desde</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Hasta</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Generar</button>
        </form>
      </div>

      {!startDate || !endDate ? (
        <div className="empty-state">
          Selecciona un rango de fechas (ej. el mes actual) para generar el Estado de Resultados.
        </div>
      ) : isLoading ? (
        <div className="loading-state">Calculando utilidad del ejercicio...</div>
      ) : data?.incomeLines.length === 0 && data?.expenseLines.length === 0 ? (
        <div className="empty-state">No hay registros de ingresos ni gastos en este período.</div>
      ) : (
        <>
          {/* SECCIÓN DE INGRESOS */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#10b981', marginBottom: '1rem', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '0.5rem' }}>INGRESOS OPERATIVOS</h3>
            <div className="table-header" style={{ gridTemplateColumns: '150px 1fr 150px' }}>
              <div className="col">CÓDIGO</div>
              <div className="col">CUENTA</div>
              <div className="col" style={{ textAlign: 'right' }}>SALDO</div>
            </div>
            
            <div className="table-body">
              {data?.incomeLines.map((line: any) => (
                <div key={line.accountId} className="table-row" style={{ gridTemplateColumns: '150px 1fr 150px' }}>
                  <div className="col code" style={{ fontSize: '0.85rem' }}>{line.accountCode}</div>
                  <div className="col" style={{ paddingLeft: `${getIndentLevel(line.accountCode)}px`, fontWeight: getIndentLevel(line.accountCode) === 0 ? 'bold' : 'normal', color: getIndentLevel(line.accountCode) === 0 ? '#fff' : 'inherit' }}>
                    {line.accountName}
                  </div>
                  <div className="col code" style={{ textAlign: 'right' }}>
                    $ {line.balance.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0 0 8px 8px', fontWeight: 'bold' }}>
              <span>Total Ingresos:</span>
              <span className="code">$ {data?.summary?.totalIncome.toFixed(2)}</span>
            </div>
          </div>

          {/* SECCIÓN DE GASTOS */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ef4444', marginBottom: '1rem', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', paddingBottom: '0.5rem' }}>COSTOS Y GASTOS</h3>
            <div className="table-header" style={{ gridTemplateColumns: '150px 1fr 150px' }}>
              <div className="col">CÓDIGO</div>
              <div className="col">CUENTA</div>
              <div className="col" style={{ textAlign: 'right' }}>SALDO</div>
            </div>
            
            <div className="table-body">
              {data?.expenseLines.map((line: any) => (
                <div key={line.accountId} className="table-row" style={{ gridTemplateColumns: '150px 1fr 150px' }}>
                  <div className="col code" style={{ fontSize: '0.85rem' }}>{line.accountCode}</div>
                  <div className="col" style={{ paddingLeft: `${getIndentLevel(line.accountCode)}px`, fontWeight: getIndentLevel(line.accountCode) === 0 ? 'bold' : 'normal', color: getIndentLevel(line.accountCode) === 0 ? '#fff' : 'inherit' }}>
                    {line.accountName}
                  </div>
                  <div className="col code" style={{ textAlign: 'right' }}>
                    $ {line.balance.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0 0 8px 8px', fontWeight: 'bold' }}>
              <span>Total Gastos:</span>
              <span className="code">$ {data?.summary?.totalExpense.toFixed(2)}</span>
            </div>
          </div>

          {/* UTILIDAD NETA */}
          <div style={{ 
            marginTop: '2rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: data?.summary?.netIncome >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: `1px solid ${data?.summary?.netIncome >= 0 ? '#10b981' : '#ef4444'}`,
            fontSize: '1.2rem',
            color: '#fff'
          }}>
            <div>
              <strong style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.2rem' }}>Utilidad Neta del Ejercicio</strong>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Ingresos Operativos menos Costos y Gastos</span>
            </div>
            <div className="code" style={{ fontSize: '2rem', fontWeight: 'bold', color: data?.summary?.netIncome >= 0 ? '#34d399' : '#f87171' }}>
              $ {data?.summary?.netIncome.toFixed(2)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
