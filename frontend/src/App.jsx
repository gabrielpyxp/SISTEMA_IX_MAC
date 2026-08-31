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

function Shell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();

  if (!user) return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

  const titles = {
    '/': { title: 'Nova Venda', breadcrumb: 'MAC / Vendas', subtitle: '' },
    '/dashboard': { title: 'Dashboard', breadcrumb: 'MAC / Dashboard', subtitle: '' },
    '/historico': { title: 'Histórico', breadcrumb: 'MAC / Histórico', subtitle: '' },
    '/produtos': { title: 'Produtos', breadcrumb: 'MAC / Produtos', subtitle: '' },
  };
  const cur = titles[pathname] || { title: 'MAC', breadcrumb: 'MAC' };

  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} onLogout={handleLogout} />
      <Topbar onMenu={() => setOpen(v => !v)} title={cur.title} subtitle={cur.subtitle} breadcrumb={cur.breadcrumb} />
      <main className="main-content">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
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
