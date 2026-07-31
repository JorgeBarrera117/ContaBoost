import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, HelpCircle, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { globalSearch } from '../api/search';

export function TopBar() {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['globalSearch', searchQuery],
    queryFn: () => globalSearch(searchQuery),
    enabled: searchQuery.length >= 2
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ position: 'relative', width: '350px' }}>
        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Buscar contactos, productos o facturas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.6rem 0.6rem 2.5rem', width: '100%', outline: 'none', color: 'var(--text-main)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }} 
        />
        
        {/* Dropdown de Resultados */}
        {searchQuery.length >= 2 && (
          <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', zIndex: 1000, maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
            {isSearching ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Buscando...</div>
            ) : searchResults?.length > 0 ? (
              searchResults.map((res: any, idx: number) => (
                <div 
                  key={idx} 
                  style={{ padding: '0.8rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onClick={() => {
                    setSearchQuery('');
                    navigate(res.url);
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--main-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{res.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.subtitle} <span style={{ float: 'right', background: 'var(--primary-color)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{res.type}</span></div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron resultados para "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Notificaciones */}
        <div style={{ position: 'relative' }}>
          <Bell 
            size={20} 
            color="var(--text-muted)" 
            style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
            onClick={() => setShowNotifications(!showNotifications)}
            onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
          />
          {/* Badge simulado */}
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--danger-color)', borderRadius: '50%' }}></span>
          
          {showNotifications && (
            <div className="glass-panel" style={{ position: 'absolute', top: '30px', right: '-50px', width: '250px', zIndex: 100, padding: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Notificaciones</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <strong>Sistema:</strong> Actualización de roles completada con éxito.
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>Inventario:</strong> No hay productos con stock bajo.
              </div>
            </div>
          )}
        </div>

        {/* Ayuda */}
        <HelpCircle 
          size={20} 
          color="var(--text-muted)" 
          style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
          onClick={() => alert('Centro de Soporte Técnico ContaBoost\n\nTeléfono: +593 99 123 4567\nEmail: soporte@contaboost.com\n\nPronto tendremos un manual interactivo aquí.')} 
          onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        />
        
        {/* Perfil */}
        <div style={{ position: 'relative' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem', cursor: 'pointer' }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.nombre || 'Usuario'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{roles.join(', ') || 'Rol'}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.nombre ? user.nombre.substring(0, 2).toUpperCase() : 'U'}
            </div>
          </div>

          {showProfileMenu && (
            <div className="glass-panel" style={{ position: 'absolute', top: '50px', right: '0', width: '180px', zIndex: 100, padding: '0.5rem' }}>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
                style={{ width: '100%', background: 'none', border: 'none', padding: '0.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)' }}
              >
                <User size={16} /> Mi Perfil
              </button>
              <button 
                onClick={handleLogout}
                style={{ width: '100%', background: 'none', border: 'none', padding: '0.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--danger-color)', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem' }}
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
