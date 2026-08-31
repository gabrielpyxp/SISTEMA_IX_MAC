import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, History, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const items = [
  { to: '/', label: 'Nova Venda', icon: ShoppingCart, caption: 'PDV' },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, caption: 'Métricas' },
  { to: '/historico', label: 'Histórico', icon: History, caption: 'Vendas' },
  { to: '/produtos', label: 'Produtos', icon: Package, caption: 'Estoque' },
];

export default function Sidebar({ open, onClose, onLogout }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-head">
          <div className="sidebar-brand">
            <div className="sidebar-logo-wrap">
              <img src="/logo-mac.png" alt="MAC" />
            </div>
            <div>
              <strong className="text-zinc-50">ENCONTRO MAC</strong><br />
              <small>MINIMERCADO</small>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}><X size={20} /></button>
        </div>

        <nav className="nav-list">
          <div className="nav-caption">Menu</div>
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} onClick={onClose} className={`nav-item ${active ? 'nav-active' : ''}`}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="card" style={{ padding: '12px', background: 'linear-gradient(135deg, #2a0a0d 0%, #1a0a0a 100%)', borderColor: 'var(--accent)' }}>
            <small style={{ color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Logado como</small>
            <strong style={{ fontSize: '13px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nome || user?.email}</strong>
            <small style={{ color: 'var(--text-dim)', fontSize: '11px' }}>{user?.email}</small>
          </div>
          <button className="logout-button" onClick={onLogout}><LogOut size={18} /> Sair</button>
        </div>
      </aside>
      {open && <div className="mobile-backdrop" onClick={onClose} />}
    </>
  );
}
