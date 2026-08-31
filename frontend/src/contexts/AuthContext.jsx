import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const token = (() => {
          try { return localStorage.getItem('mac_token'); } catch { return null; }
        })();
        if (!token || typeof token !== 'string' || token.trim() === '') {
          if (!cancelled) setUser(null);
          return;
        }
        // token existe -> valida no backend (não faz parse local pra não quebrar com token corrompido)
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data || null);
      } catch (err) {
        // 401, rede ou token inválido -> limpa silenciosamente, sem crash
        try { localStorage.removeItem('mac_token'); } catch {}
        if (!cancelled) setUser(null);
        // não relança -> evita ErrorBoundary
        const is401 = err?.response?.status === 401;
        if (!is401) console.warn('[Auth] init falhou:', err?.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const login = async (email, senha) => {
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      if (!data?.token) throw new Error('Token não retornado pelo servidor');
      try { localStorage.setItem('mac_token', data.token); } catch {}
      setUser(data.usuario || null);
      return data;
    } catch (err) {
      // garante que estado não fica sujo
      try { localStorage.removeItem('mac_token'); } catch {}
      setUser(null);
      throw err; // Login.jsx vai exibir a mensagem
    }
  };

  const logout = () => {
    try { localStorage.removeItem('mac_token'); } catch {}
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve estar dentro de AuthProvider');
  return ctx;
};
