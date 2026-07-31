import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../api/invoices';
import { getContacts } from '../api/contacts';
import { getProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, Trash2, ArrowLeft, CreditCard, Banknote, Building, CheckCircle2 } from 'lucide-react';
import './POS.css';

export function POS() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: contacts } = useQuery({ queryKey: ['contacts'], queryFn: getContacts });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const [contactId, setContactId] = useState('');
  const [cart, setCart] = useState<{ productId: string; name: string; quantity: number; unitPrice: number; hasIva: boolean; stock: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Cálculos del carrito
  let subtotal = 0;
  let ivaAmount = 0;

  cart.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
    if (item.hasIva) {
      ivaAmount += lineTotal * 0.15; // IVA Ecuador
    }
  });

  const total = subtotal + ivaAmount;
  const change = typeof cashReceived === 'number' ? cashReceived - total : 0;

  // Acciones del carrito
  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      alert(`El producto ${product.name} no tiene stock disponible.`);
      return;
    }

    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`No hay suficiente stock de ${product.name}. Disponible: ${product.stock}`);
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        unitPrice: Number(product.price), 
        hasIva: product.hasIva,
        stock: product.stock
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) {
          alert(`Stock insuficiente. Disponible: ${item.stock}`);
          return item;
        }
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Mutación de guardado
  const mutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock update
      alert('¡Venta registrada con éxito!');
      navigate('/invoices'); // Regresar a ventas
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al emitir factura');
    }
  });

  const handleProcessPayment = () => {
    if (!contactId) {
      setErrorMsg('Debe seleccionar un cliente.');
      return;
    }
    if (paymentMethod === 'CASH' && typeof cashReceived === 'number' && cashReceived < total) {
      setErrorMsg('El efectivo recibido es menor al total.');
      return;
    }
    
    setErrorMsg('');
    const lines = cart.map(c => ({
      productId: c.productId,
      quantity: c.quantity,
      unitPrice: c.unitPrice
    }));

    mutation.mutate({
      contactId,
      establishmentCode: '001',
      emissionPointCode: '001',
      paymentMethod,
      lines
    });
  };

  return (
    <div className="pos-layout">
      {/* HEADER POS */}
      <header className="pos-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-icon" onClick={() => navigate('/')} title="Volver al Panel">
            <ArrowLeft size={24} />
          </button>
          <h2>Punto de Venta - ContaBoost</h2>
        </div>
        <div className="pos-user-info">
          <span>Cajero: <strong>{user?.nombre}</strong></span>
          <div className="pos-status-badge online">Caja Abierta</div>
        </div>
      </header>

      <div className="pos-body">
        {/* LADO IZQUIERDO: PRODUCTOS */}
        <div className="pos-products-section">
          <div className="pos-search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por código o nombre del producto..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="pos-products-grid">
            {filteredProducts.map((p: any) => (
              <div 
                key={p.id} 
                className={`pos-product-card ${p.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => addToCart(p)}
              >
                <div className="pos-product-price">${Number(p.price).toFixed(2)}</div>
                <div className="pos-product-name">{p.name}</div>
                <div className="pos-product-meta">
                  <span className="code">{p.code}</span>
                  <span className={`stock ${p.stock <= 5 ? 'low' : ''}`}>Stock: {p.stock}</span>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="pos-empty-state">No se encontraron productos.</div>
            )}
          </div>
        </div>

        {/* LADO DERECHO: CARRITO */}
        <div className="pos-cart-section">
          <div className="pos-cart-header">
            <h3><ShoppingCart size={20} /> Pedido Actual</h3>
            
            <select 
              className="pos-client-select" 
              value={contactId} 
              onChange={(e) => setContactId(e.target.value)}
            >
              <option value="">-- Consumidor Final / Cliente --</option>
              {contacts?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.identification} - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="pos-cart-items">
            {cart.length === 0 ? (
              <div className="pos-cart-empty">Agrega productos para cobrar.</div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="pos-cart-item">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${item.unitPrice.toFixed(2)} c/u</div>
                  </div>
                  <div className="item-controls">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.productId, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)}>+</button>
                    </div>
                    <div className="item-total">${(item.quantity * item.unitPrice).toFixed(2)}</div>
                    <button className="btn-delete" onClick={() => removeFromCart(item.productId)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pos-cart-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>IVA (15%)</span>
              <span>${ivaAmount.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total a Pagar</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <button 
              className="btn-pay" 
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Cobrar ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {isPaymentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <h2>Completar Pago</h2>
            <div className="payment-amount-display">
              ${total.toFixed(2)}
            </div>

            {errorMsg && <div className="error-message" style={{marginBottom: '1rem'}}>{errorMsg}</div>}

            <div className="payment-methods">
              <button 
                type="button"
                className={`pm-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('CASH')}
              >
                <Banknote size={24} /> Efectivo
              </button>
              <button 
                type="button"
                className={`pm-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <CreditCard size={24} /> Tarjeta
              </button>
              <button 
                type="button"
                className={`pm-btn ${paymentMethod === 'TRANSFER' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('TRANSFER')}
              >
                <Building size={24} /> Transferencia
              </button>
            </div>

            {paymentMethod === 'CASH' && (
              <div className="cash-calculator">
                <label>Efectivo Recibido:</label>
                <div className="cash-input-wrapper">
                  <span>$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    min={total}
                    value={cashReceived} 
                    onChange={e => setCashReceived(e.target.value === '' ? '' : Number(e.target.value))}
                    autoFocus
                  />
                </div>
                {typeof cashReceived === 'number' && cashReceived >= total && (
                  <div className="change-display">
                    Vuelto / Cambio: <strong>${change.toFixed(2)}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>Volver al Carrito</button>
              <button 
                className="btn-primary" 
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                onClick={handleProcessPayment}
                disabled={mutation.isPending || (paymentMethod === 'CASH' && typeof cashReceived === 'number' && cashReceived < total)}
              >
                {mutation.isPending ? 'Procesando...' : <><CheckCircle2 size={20}/> Confirmar Venta</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
