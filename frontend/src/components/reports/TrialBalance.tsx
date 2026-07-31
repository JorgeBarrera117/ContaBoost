import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrialBalance } from '../../api/reports';

const accountTypeNames: Record<string, string> = {
  ASSET: 'ACTIVO',
  LIABILITY: 'PASIVO',
  EQUITY: 'PATRIMONIO',
  REVENUE: 'INGRESOS',
  EXPENSE: 'GASTOS'
};

export function TrialBalance() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trialBalance', startDate, endDate],
    queryFn: () => getTrialBalance(startDate, endDate)
  });

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const getIndentLevel = (code: string) => {
    // 1 -> 0
    // 1.1 -> 1
    // 1.1.1 -> 2
    // 1.1.1.01 -> 3
    const parts = code.split('.');
    return (parts.length - 1) * 20; // 20px per level
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, marginBottom: '0.5rem' }}>Balance de Comprobación</h2>
          <p className="subtitle" style={{ margin: 0 }}>Verificación de sumas y saldos del libro mayor.</p>
        </div>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Desde</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Hasta</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Filtrar</button>
        </form>
      </div>

      {isLoading ? (
        <div className="loading-state">Calculando saldos...</div>
      ) : data?.lines?.length === 0 ? (
        <div className="empty-state">No hay movimientos contables en este período. Registra compras, ventas o asientos manuales.</div>
      ) : (
        <>
          {!data?.summary?.isBalanced && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <strong>¡Alerta Crítica! El balance no cuadra.</strong>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                  Hay una discrepancia en el Libro Diario. Revisa los asientos manuales. Diferencia: $ {Math.abs(data.summary.totalDebit - data.summary.totalCredit).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="table-header" style={{ gridTemplateColumns: '150px 2fr 100px 150px 150px 150px' }}>
            <div className="col">CÓDIGO</div>
            <div className="col">CUENTA</div>
            <div className="col">TIPO</div>
            <div className="col" style={{ textAlign: 'right' }}>TOTAL DEBE</div>
            <div className="col" style={{ textAlign: 'right' }}>TOTAL HABER</div>
            <div className="col" style={{ textAlign: 'right' }}>SALDO FINAL</div>
          </div>
          
          <div className="table-body">
            {data?.lines.map((line: any) => (
              <div key={line.accountId} className="table-row" style={{ gridTemplateColumns: '150px 2fr 100px 150px 150px 150px' }}>
                <div className="col code" style={{ fontSize: '0.85rem' }}>{line.accountCode}</div>
                <div className="col" style={{ paddingLeft: `${getIndentLevel(line.accountCode)}px`, fontWeight: getIndentLevel(line.accountCode) === 0 ? 'bold' : 'normal', color: getIndentLevel(line.accountCode) === 0 ? '#fff' : 'inherit' }}>
                  {line.accountName}
                </div>
                <div className="col">
                  <span className={`badge ${line.accountType.toLowerCase()}`}>{accountTypeNames[line.accountType]}</span>
                </div>
                <div className="col code" style={{ textAlign: 'right', color: line.debit > 0 ? '#10b981' : 'inherit' }}>
                  $ {line.debit.toFixed(2)}
                </div>
                <div className="col code" style={{ textAlign: 'right', color: line.credit > 0 ? '#ef4444' : 'inherit' }}>
                  $ {line.credit.toFixed(2)}
                </div>
                <div className="col code" style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-light)' }}>
                  $ {line.balance.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '150px 2fr 100px 150px 150px 150px', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', borderTop: '2px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <div style={{ gridColumn: '1 / 4', textAlign: 'right', color: '#fff' }}>TOTALES DEL BALANCE:</div>
            <div className="code" style={{ textAlign: 'right', color: data?.summary?.isBalanced ? '#10b981' : '#ef4444' }}>
              $ {data?.summary?.totalDebit.toFixed(2)}
            </div>
            <div className="code" style={{ textAlign: 'right', color: data?.summary?.isBalanced ? '#10b981' : '#ef4444' }}>
              $ {data?.summary?.totalCredit.toFixed(2)}
            </div>
            <div></div>
          </div>
        </>
      )}
    </div>
  );
}
