import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createJournalEntry, type CreateJournalLineDto } from '../api/journal';
import { getAccounts } from '../api/accounts';
import './CreateAccountModal.css'; // Reutilizamos estilos base de form

export function CreateJournalEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts });

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  
  // Iniciamos con 2 líneas por defecto (partida doble requiere mín 2)
  const [lines, setLines] = useState<CreateJournalLineDto[]>([
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' }
  ]);

  const mutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      navigate('/journal');
    },
  });

  const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const addLine = () => {
    setLines([...lines, { accountId: '', debit: 0, credit: 0, description: '' }]);
  };

  const updateLine = (index: number, field: keyof CreateJournalLineDto, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    // Evitar que una línea tenga debe y haber simultáneo por error de usuario
    if (field === 'debit' && Number(value) > 0) newLines[index].credit = 0;
    if (field === 'credit' && Number(value) > 0) newLines[index].debit = 0;
    setLines(newLines);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    // Filtrar líneas vacías
    const validLines = lines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0));
    mutation.mutate({ date, description, reference, lines: validLines });
  };

  return (
    <div className="card" style={{ padding: '2rem', margin: '2rem auto', maxWidth: '900px' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Nuevo Asiento Contable</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Fecha</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Referencia (Opcional)</label>
            <input placeholder="Ej. Cheque #1234" value={reference} onChange={e => setReference(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Glosa / Descripción General</label>
          <input required placeholder="Descripción del asiento..." value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Líneas de Detalle</h3>
          <div className="table-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 50px', background: '#f8fafc', color: 'var(--text-muted)' }}>
            <div className="col">Cuenta Contable</div>
            <div className="col">Detalle de Línea (Opc.)</div>
            <div className="col" style={{ textAlign: 'right' }}>Debe</div>
            <div className="col" style={{ textAlign: 'right' }}>Haber</div>
            <div className="col"></div>
          </div>

          {lines.map((line, idx) => (
            <div key={idx} className="table-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 50px', padding: '0.5rem 1.5rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select required value={line.accountId} onChange={e => updateLine(idx, 'accountId', e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }}>
                  <option value="">-- Seleccionar Cuenta --</option>
                  {accounts?.map((acc: any) => (
                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="text" placeholder="Detalle (opcional)" value={line.description || ''} onChange={e => updateLine(idx, 'description', e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '90%' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="number" step="0.01" min="0" value={line.debit || ''} onChange={e => updateLine(idx, 'debit', Number(e.target.value))} style={{ padding: '0.5rem', textAlign: 'right', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="number" step="0.01" min="0" value={line.credit || ''} onChange={e => updateLine(idx, 'credit', Number(e.target.value))} style={{ padding: '0.5rem', textAlign: 'right', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button type="button" onClick={() => removeLine(idx)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>X</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addLine} style={{ marginTop: '1rem', background: '#f1f5f9', color: 'var(--text-main)' }}>
            + Añadir Fila
          </button>
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', maxWidth: '350px', marginLeft: 'auto', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            <span>Total Debe:</span>
            <span className="code" style={{ color: 'var(--text-main)', fontWeight: 600 }}>$ {totalDebit.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span>Total Haber:</span>
            <span className="code" style={{ color: 'var(--text-main)', fontWeight: 600 }}>$ {totalCredit.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1rem', color: isBalanced ? 'var(--success-color)' : 'var(--danger-color)' }}>
            <span>Diferencia:</span>
            <span className="code">$ {Math.abs(totalDebit - totalCredit).toFixed(2)}</span>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/journal')} style={{ padding: '0.75rem 1.5rem' }}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending || !isBalanced} style={{ padding: '0.75rem 1.5rem', opacity: isBalanced ? 1 : 0.5 }}>
            {mutation.isPending ? 'Guardando...' : 'Registrar Asiento'}
          </button>
        </div>
      </form>
    </div>
  );
}
