import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { seedEcuadorAccounts } from './api/accounts';
import { AccountList } from './components/AccountList';
import { CreateAccountModal } from './components/CreateAccountModal';
import { JournalList } from './components/JournalList';
import { CreateJournalEntry } from './components/CreateJournalEntry';
import { InvoiceList } from './components/InvoiceList';
import { CreateInvoice } from './components/CreateInvoice';
import { PurchaseList } from './components/PurchaseList';
import { CreatePurchase } from './components/CreatePurchase';
import { ProductList } from './components/ProductList';
import { ContactList } from './components/ContactList';
import { TrialBalance } from './components/reports/TrialBalance';
import { ProfitAndLoss } from './components/reports/ProfitAndLoss';
import { BalanceSheet } from './components/reports/BalanceSheet';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DashboardEmployee } from './components/DashboardEmployee';
import { ReportsEmployee } from './components/ReportsEmployee';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { TopBar } from './components/TopBar';

import { POS } from './components/POS';
import { UserManagement } from './components/UserManagement';
import { UserActivity } from './components/UserActivity';
import { Profile } from './components/Profile';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();
  const { tienePermiso } = useAuth();

  const seedMutation = useMutation({
    mutationFn: seedEcuadorAccounts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const isLoginPage = location.pathname === '/login';
  const isPosPage = location.pathname === '/pos';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  if (isPosPage) {
    return (
      <ProtectedRoute permisoRequerido="ventas.crear">
        <Routes>
          <Route path="/pos" element={<POS />} />
        </Routes>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <div className="app-container">
            <TopBar />
            <Routes>
              <Route path="/" element={
                <ProtectedRoute permisoRequerido="dashboard.ver">
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/accounts" element={
                <ProtectedRoute permisoRequerido="cuentas.gestionar">
                  <>
                    <header className="app-header">
                      <div className="header-content">
                        <div>
                          <h1>Catálogo de Cuentas</h1>
                          <p className="subtitle">Gestiona la estructura financiera de tu empresa.</p>
                        </div>
                        <div className="header-actions">
                          {tienePermiso('cuentas.gestionar') && (
                            <>
                              <button 
                                className="btn-secondary" 
                                onClick={() => seedMutation.mutate()}
                                disabled={seedMutation.isPending}
                              >
                                {seedMutation.isPending ? 'Cargando...' : 'Cargar Plan Ecuador 2026'}
                              </button>
                              <button className="btn-primary add-button" onClick={() => setIsModalOpen(true)}>
                                + Nueva Cuenta
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </header>
                    <main className="main-content">
                      <AccountList />
                    </main>
                    {isModalOpen && <CreateAccountModal onClose={() => setIsModalOpen(false)} />}
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/journal" element={
                <ProtectedRoute permisoRequerido="libro_diario.ver">
                  <>
                    <header className="app-header">
                      <div className="header-content">
                        <div>
                          <h1>Libro Diario</h1>
                          <p className="subtitle">Registro oficial de asientos contables por partida doble.</p>
                        </div>
                        <div className="header-actions">
                          {tienePermiso('libro_diario.ver') && (
                            <Link to="/journal/new" className="btn-primary add-button" style={{textDecoration: 'none'}}>
                              + Nuevo Asiento
                            </Link>
                          )}
                        </div>
                      </div>
                    </header>
                    <main className="main-content">
                      <JournalList />
                    </main>
                  </>
                </ProtectedRoute>
              } />

              <Route path="/invoices/*" element={
                <ProtectedRoute permisoRequerido={['ventas.ver_todas', 'ventas.ver_propias']}>
                  <>
                    <header className="app-header">
                      <div className="header-content">
                        <div>
                          <h1>Ventas Registradas</h1>
                          <p className="subtitle">Historial de tickets y facturas emitidas</p>
                        </div>
                        <div className="header-actions">
                          {tienePermiso('ventas.crear') && (
                            <Link to="/invoices/new" className="btn-primary add-button" style={{textDecoration: 'none'}}>
                              + Nueva Venta
                            </Link>
                          )}
                        </div>
                      </div>
                    </header>
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<InvoiceList />} />
                        <Route path="/new" element={
                          <ProtectedRoute permisoRequerido="ventas.crear">
                            <CreateInvoice />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </main>
                  </>
                </ProtectedRoute>
              } />

              <Route path="/products" element={
                <ProtectedRoute permisoRequerido="inventario.ver">
                  <>
                    <header className="app-header">
                      <div className="header-content">
                        <div>
                          <h1>Inventario y Bodegas</h1>
                          <p className="subtitle">Gestión de productos, kardex y valoración.</p>
                        </div>
                      </div>
                    </header>
                    <main className="main-content">
                      <ProductList />
                    </main>
                  </>
                </ProtectedRoute>
              } />

              <Route path="/contacts" element={
                <ProtectedRoute permisoRequerido="contactos.ver">
                  <>
                    <header className="app-header">
                      <div className="header-content">
                        <div>
                          <h1>Clientes y Proveedores</h1>
                          <p className="subtitle">Gestión del CRM para facturación y compras.</p>
                        </div>
                      </div>
                    </header>
                    <main className="main-content">
                      <ContactList />
                    </main>
                  </>
                </ProtectedRoute>
              } />

              <Route path="/purchases" element={
                <ProtectedRoute permisoRequerido="compras.ver">
                  <>
                    <header className="app-header">
                      <div className="header-content">
                        <div>
                          <h1>Compras e Ingresos</h1>
                          <p className="subtitle">Registro de facturas de proveedores y aumento de stock.</p>
                        </div>
                        <div className="header-actions">
                          {tienePermiso('compras.crear') && (
                            <Link to="/purchases/new" className="btn-primary add-button" style={{textDecoration: 'none'}}>
                              + Registrar Compra
                            </Link>
                          )}
                        </div>
                      </div>
                    </header>
                    <main className="main-content">
                      <PurchaseList />
                    </main>
                  </>
                </ProtectedRoute>
              } />

              <Route path="/reports/*" element={
                <ProtectedRoute permisoRequerido="reportes.ver">
                  <>
                    <header className="app-header">
                      <div className="header-content">
                        <div>
                          <h1>Reportes Financieros</h1>
                          <p className="subtitle">Balances y estados generados en tiempo real.</p>
                        </div>
                        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
                          <Link to="/reports/trial-balance" className="btn-secondary" style={{textDecoration: 'none', padding: '0.5rem 1rem'}}>
                            Balance de Comprobación
                          </Link>
                          <Link to="/reports/profit-loss" className="btn-secondary" style={{textDecoration: 'none', padding: '0.5rem 1rem'}}>
                            Estado de Resultados
                          </Link>
                          <Link to="/reports/balance-sheet" className="btn-secondary" style={{textDecoration: 'none', padding: '0.5rem 1rem'}}>
                            Balance General
                          </Link>
                        </div>
                      </div>
                    </header>
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<TrialBalance />} />
                        <Route path="/trial-balance" element={<TrialBalance />} />
                        <Route path="/profit-loss" element={<ProfitAndLoss />} />
                        <Route path="/balance-sheet" element={<BalanceSheet />} />
                      </Routes>
                    </main>
                  </>
                </ProtectedRoute>
              } />

              <Route path="/journal/new" element={
                <ProtectedRoute permisoRequerido="libro_diario.ver">
                  <CreateJournalEntry />
                </ProtectedRoute>
              } />
              <Route path="/invoices/new" element={
                <ProtectedRoute permisoRequerido="ventas.crear">
                  <CreateInvoice />
                </ProtectedRoute>
              } />
              <Route path="/purchases/new" element={
                <ProtectedRoute permisoRequerido="compras.crear">
                  <CreatePurchase />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute permisoRequerido="configuracion.editar">
                  <div className="glass-panel" style={{ padding: '2rem', margin: '2rem' }}>
                    <h2>Configuración del Sistema</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Módulo en construcción.</p>
                    {tienePermiso('usuarios.gestionar') && (
                      <Link to="/settings/users" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
                        Gestionar Personal
                      </Link>
                    )}
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/settings/users" element={
                <ProtectedRoute permisoRequerido="usuarios.gestionar">
                  <UserManagement />
                </ProtectedRoute>
              } />

              <Route path="/settings/users/:id" element={
                <ProtectedRoute permisoRequerido="usuarios.gestionar">
                  <UserActivity />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default App;
