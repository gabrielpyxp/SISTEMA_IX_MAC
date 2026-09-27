import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Vendas from './pages/Vendas.jsx';
import Produtos from './pages/Produtos.jsx';
import Historico from './pages/Historico.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Devedores from './pages/Devedores.jsx';

function Shell() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();

  // enquanto valida token, mostra loading escuro (evita flash preto)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-zinc-400">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-[#FACC15] rounded-full animate-spin" />
      </div>
    );
  }

  // sem user -> redireciona (sem criar Routes aninhado que quebra SPA)
  if (!user) return <Navigate to="/login" replace />;

  const titles = {
    '/': { title: 'Nova Venda', breadcrumb: 'MAC / Vendas' },
    '/dashboard': { title: 'Dashboard', breadcrumb: 'MAC / Dashboard' },
    '/historico': { title: 'Histórico', breadcrumb: 'MAC / Histórico' },
    '/produtos': { title: 'Produtos', breadcrumb: 'MAC / Produtos' },
    '/devedores': { title: 'Devedores', breadcrumb: 'MAC / Devedores' },
  };
  const cur = titles[pathname] || { title: 'MAC', breadcrumb: 'MAC' };
  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} onLogout={handleLogout} />
      <Topbar onMenu={() => setOpen(v => !v)} title={cur.title} breadcrumb={cur.breadcrumb} />
      <main className="main-content">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/devedores" element={<ProtectedRoute><Devedores /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Shell />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
