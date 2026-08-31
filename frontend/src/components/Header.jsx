import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LogOut, LayoutDashboard, ShoppingCart, Package, History } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Vendas', icon: ShoppingCart },
  { to: '/historico', label: 'Histórico', icon: History },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo com fundo bordô */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#5C161B] overflow-hidden border border-[#FACC15]/20">
            <img src="/logo-mac-transparente.png" alt="MAC" className="w-full h-full object-contain p-1" />
          </div>
          <div className="leading-tight">
            <p className="font-black text-zinc-50 text-sm tracking-widest">ENCONTRO MAC</p>
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase">Minimercado</p>
          </div>
        </Link>

        {user && (
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${active ? 'bg-zinc-900 text-zinc-50 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900'}`}>
                  <Icon size={16} /> {label}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="ml-2 bg-[#5C161B] hover:bg-[#7a1d24] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
              <LogOut size={16} /> Sair
            </button>
          </nav>
        )}

        {user && (
          <button onClick={handleLogout} className="sm:hidden bg-[#5C161B] text-white p-2.5 rounded-xl">
            <LogOut size={18} />
          </button>
        )}
      </div>

      {user && (
        <div className="sm:hidden border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex justify-around py-2 px-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} className={`flex flex-col items-center gap-1 text-[10px] px-3 py-1.5 rounded-xl ${active ? 'bg-zinc-900 text-zinc-50 border border-zinc-800' : 'text-zinc-500'}`}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
