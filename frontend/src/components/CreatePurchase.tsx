import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPurchase } from '../api/purchases';
import { getContacts } from '../api/contacts';
import { getProducts } from '../api/products';
import './CreateAccountModal.css';

export function CreatePurchase() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: contacts } = useQuery({ queryKey: ['contacts'], queryFn: getContacts });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const [contactId, setContactId] = useState('');
  const [purchaseNumber, setPurchaseNumber] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 1, unitCost: 0 }]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleProductChange = (index: number, productId: string) => {
    const newLines = [...lines];
    const product = products?.find((p: any) => p.id === productId);
    newLines[index].productId = productId;
    newLines[index].unitCost = product ? Number(product.cost) : 0;
    setLines(newLines);
  };

  const updateLine = (index: number, field: string, value: number) => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    setLines(newLines);
  };

  let subtotal = 0;
  let ivaAmount = 0;

  lines.forEach(line => {
    const product = products?.find((p: any) => p.id === line.productId);
    const lineTotal = line.quantity * line.unitCost;
    subtotal += lineTotal;
    if (product?.hasIva) {
      ivaAmount += lineTotal * 0.15;
    }
  });

  const total = subtotal + ivaAmount;

  const mutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Actualiza stock y costos
      navigate('/purchases');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al registrar la compra');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId || !purchaseNumber || lines.some(l => !l.productId || l.quantity <= 0)) {
      setErrorMsg('Complete todos los campos requeridos.');
      return;
    }
    setErrorMsg('');
    mutation.mutate({
      contactId,
      purchaseNumber,
      lines
    });
  };

  return (
    <div className="card" style={{ padding: '2rem', margin: '2rem auto', maxWidth: '900px' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Ingresar Factura de Compra</h2>
      
      {errorMsg && <div className="error-message" style={{ marginBottom: '1rem' }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Proveedor</label>
            <select required value={contactId} onChange={e => setContactId(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <option value="">-- Seleccionar Proveedor --</option>
              {contacts?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.identification} - {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Nro. de Factura (Físico o Electrónico)</label>
            <input required placeholder="001-001-000000001" value={purchaseNumber} onChange={e => setPurchaseNumber(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>Digita el número impreso en el comprobante de tu proveedor.</small>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Productos Comprados</h3>
          <div className="table-header" style={{ gridTemplateColumns: '2fr 100px 150px 150px 50px', background: '#f8fafc', color: 'var(--text-muted)' }}>
            <div className="col">Producto</div>
            <div className="col">Cantidad</div>
            <div className="col">Costo Unitario</div>
            <div className="col">Costo Total</div>
            <div className="col"></div>
          </div>
          
          {lines.map((line, idx) => (
            <div key={idx} className="table-row" style={{ gridTemplateColumns: '2fr 100px 150px 150px 50px', alignItems: 'center' }}>
              <select required value={line.productId} onChange={e => handleProductChange(idx, e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <option value="">-- Producto --</option>
                {products?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input type="number" min="1" required value={line.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              <input type="number" step="0.01" min="0" required value={line.unitCost} onChange={e => updateLine(idx, 'unitCost', Number(e.target.value))} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              <div className="code" style={{ padding: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>$ {(line.quantity * line.unitCost).toFixed(2)}</div>
              <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>X</button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => setLines([...lines, { productId: '', quantity: 1, unitCost: 0 }])} style={{ marginTop: '1rem', background: '#f1f5f9', color: 'var(--text-main)' }}>
            + Añadir Producto
          </button>
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', maxWidth: '350px', marginLeft: 'auto', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Subtotal:</span>
            <span className="code" style={{ color: 'var(--text-main)', fontWeight: 600 }}>$ {subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span>IVA (Crédito Tributario):</span>
            <span className="code" style={{ color: 'var(--text-main)', fontWeight: 600 }}>$ {ivaAmount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1rem', color: 'var(--text-main)' }}>
            <span>Total a Pagar:</span>
            <span className="code" style={{ color: 'var(--primary-color)' }}>$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/purchases')} style={{ padding: '0.75rem 1.5rem' }}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending} style={{ padding: '0.75rem 1.5rem' }}>
            {mutation.isPending ? 'Guardando...' : 'Registrar Compra y Auto-Contabilizar'}
          </button>
        </div>
      </form>
    </div>
  );
}
