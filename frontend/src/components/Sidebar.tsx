import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Package, 
  ShoppingCart, 
  Receipt, 
  BookOpen, 
  BarChart3, 
  Settings,
  LogOut,
  PlusCircle
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tienePermiso, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Panel Control', path: '/', icon: LayoutDashboard, permission: 'dashboard.ver' },
    { name: 'Cuentas', path: '/accounts', icon: Wallet, permission: 'cuentas.gestionar' },
    { name: 'Contactos', path: '/contacts', icon: Users, permission: 'contactos.ver' },
    { name: 'Inventario', path: '/products', icon: Package, permission: 'inventario.ver' },
    { name: 'Compras', path: '/purchases', icon: ShoppingCart, permission: 'compras.ver' },
    { name: 'Ventas', path: '/invoices', icon: Receipt, permission: ['ventas.ver_todas', 'ventas.ver_propias'] },
    { name: 'Libro Diario', path: '/journal', icon: BookOpen, permission: 'libro_diario.ver' },
    { name: 'Reportes', path: '/reports', icon: BarChart3, permission: 'reportes.ver' },
    { name: 'Configuración', path: '/settings', icon: Settings, permission: 'configuracion.editar' },
  ];

  const visibleNavItems = navItems.filter(item => tienePermiso(item.permission));

  // Helper function to check active state
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <Wallet size={28} color="#10b981" />
        </div>
        <div className="logo-text">
          <h2>Conta<span>Boost</span></h2>
          <p>Gestión Integral</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {tienePermiso('ventas.crear') && (
          <Link to="/pos" className="btn-primary new-transaction-btn" style={{ textDecoration: 'none' }}>
            <PlusCircle size={20} />
            Nueva Venta
          </Link>
        )}
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
