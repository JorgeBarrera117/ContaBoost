import { useQuery } from '@tanstack/react-query';
import { getJournalEntries } from '../api/journal';
import { Link } from 'react-router-dom';

export function JournalList() {
  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ['journal'],
    queryFn: getJournalEntries,
  });

  if (isLoading) return <div className="loading-state">Cargando libro diario...</div>;
  if (isError) return <div className="error-state">Error al cargar los asientos contables.</div>;

  return (
    <div className="glass-panel">
      <div className="table-header" style={{ gridTemplateColumns: '150px 1fr 150px 150px' }}>
        <div className="col">Fecha</div>
        <div className="col">Concepto / Descripción</div>
        <div className="col" style={{ textAlign: 'right' }}>Debe</div>
        <div className="col" style={{ textAlign: 'right' }}>Haber</div>
      </div>
      
      {!entries || entries.length === 0 ? (
        <div className="empty-state">No hay asientos contables registrados. <Link to="/journal/new">Crea el primero</Link>.</div>
      ) : (
        <div className="table-body">
          {entries.map((entry) => {
            const totalDebit = entry.lines.reduce((sum, line) => sum + Number(line.debit), 0);
            const totalCredit = entry.lines.reduce((sum, line) => sum + Number(line.credit), 0);

            return (
              <div key={entry.id} className="journal-entry-card" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="table-row" style={{ gridTemplateColumns: '150px 1fr 150px 150px', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="col" style={{ fontWeight: 600 }}>{new Date(entry.date).toLocaleDateString()}</div>
                  <div className="col" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    {entry.description}
                    {entry.reference && <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginLeft: '10px' }}>Ref: {entry.reference}</span>}
                  </div>
                  <div className="col code" style={{ textAlign: 'right', fontWeight: 'bold' }}>$ {totalDebit.toFixed(2)}</div>
                  <div className="col code" style={{ textAlign: 'right', fontWeight: 'bold' }}>$ {totalCredit.toFixed(2)}</div>
                </div>
                {/* Detalles de líneas */}
                <div className="journal-lines" style={{ padding: '0.5rem 0' }}>
                  {entry.lines.map((line, idx) => (
                    <div key={line.id || idx} className="table-row" style={{ gridTemplateColumns: '150px 1fr 150px 150px', padding: '0.5rem 1.5rem', borderBottom: 'none' }}>
                      <div className="col code" style={{ color: 'var(--text-muted)' }}>{line.account?.code}</div>
                      <div className="col" style={{ color: 'var(--text-muted)' }}>{line.account?.name} {line.description ? `- ${line.description}` : ''}</div>
                      <div className="col code" style={{ textAlign: 'right' }}>{Number(line.debit) > 0 ? `$ ${Number(line.debit).toFixed(2)}` : ''}</div>
                      <div className="col code" style={{ textAlign: 'right' }}>{Number(line.credit) > 0 ? `$ ${Number(line.credit).toFixed(2)}` : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
