import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenu, title, breadcrumb }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const ref = useRef(null);
  const { logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <div className="breadcrumb">{breadcrumb}</div>
        <h2>{title}</h2>
      </div>

      <div className="topbar-actions" style={{ gap: '12px' }}>
        {/* Ícone Notificação */}
        <button className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors">
          <Bell size={20} className="text-zinc-400" />
          <span className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0 border border-zinc-900"></span>
        </button>

        {/* Botão Perfil */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setIsDropdownOpen(v => !v)}
            className="flex items-center gap-3 hover:bg-zinc-800 p-2 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#5C161B] overflow-hidden border border-zinc-700 flex items-center justify-center p-1">
              <img src="/logo-mac-transparente.png" alt="MAC" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-white font-semibold text-sm">Minimercado MAC</span>
              <span className="text-zinc-400 text-xs">Equipe</span>
            </div>
            <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4">
                <p className="text-white font-bold text-sm">Minimercado MAC</p>
                <p className="text-zinc-400 text-sm">minimercado@mac.com</p>
              </div>
              <div className="border-t border-zinc-800"></div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-zinc-800 transition-colors text-left">
                <LogOut size={16} /> Sair da conta
              </button>
            </div>
          )}
        </div>

        <button className="menu-button icon-button" onClick={onMenu}><Menu size={20} /></button>
      </div>
    </header>
  );
}
