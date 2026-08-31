import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Vendas from './pages/Vendas.jsx';
import Produtos from './pages/Produtos.jsx';
import Historico from './pages/Historico.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header/>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<ProtectedRoute><Vendas/></ProtectedRoute>} />
          <Route path="/produtos" element={<ProtectedRoute><Produtos/></ProtectedRoute>} />
          <Route path="/historico" element={<ProtectedRoute><Historico/></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
