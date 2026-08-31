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
        const token = (() => { try { return localStorage.getItem('mac_token'); } catch { return null; } })();
        if (!token || typeof token !== 'string' || token.trim() === '') {
          if (!cancelled) setUser(null);
          return;
        }
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data || null);
      } catch (err) {
        try { localStorage.removeItem('mac_token'); } catch {}
        if (!cancelled) setUser(null);
        const is401 = err?.response?.status === 401;
        if (!is401) console.warn('[Auth] init falhou:', err?.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Refatoração com Try/Catch robusto — nunca estoura tela preta
  const login = async (email, senha) => {
    try {
      // defesa extra: se vier vazio do form, já falha aqui sem bater API
      if (!email?.trim() || !senha?.trim()) {
        const e = new Error('E-mail e senha são obrigatórios');
        e.response = { status: 400, data: { error: 'email e senha obrigatórios' } };
        throw e;
      }
      const { data } = await api.post('/auth/login', { email: email.trim(), senha: senha.trim() });
      if (!data?.token) throw new Error('Token não retornado pelo servidor');
      try { localStorage.setItem('mac_token', data.token); } catch {}
      setUser(data.usuario || null);
      return data;
    } catch (err) {
      // garante estado limpo e repassa erro para Login exibir (não crasha)
      try { localStorage.removeItem('mac_token'); } catch {}
      setUser(null);
      // preserva mensagem do backend (HttpError 400/401) para UI
      throw err;
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
