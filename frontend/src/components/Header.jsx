import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <header className="bg-bordo text-white sticky top-0 z-10 shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight">✝ Encontro MAC</Link>
        {user && (
          <nav className="flex gap-2 text-sm items-center">
            <Link to="/" className="hover:text-dourado hidden sm:inline">Vendas</Link>
            <Link to="/historico" className="hover:text-dourado hidden sm:inline">Histórico</Link>
            <Link to="/produtos" className="hover:text-dourado hidden sm:inline">Produtos</Link>
            <Link to="/dashboard" className="hover:text-dourado hidden sm:inline">Dashboard</Link>
            <button onClick={handleLogout} className="bg-dourado text-bordo px-3 py-1 rounded-full font-bold text-xs">Sair</button>
          </nav>
        )}
      </div>
      {user && (
        <div className="bg-bordoHover flex justify-around sm:hidden text-xs py-2 border-t border-white/10">
          <Link to="/">Vendas</Link>
          <Link to="/historico">Histórico</Link>
          <Link to="/produtos">Produtos</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      )}
    </header>
  );
}
