import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('mac_token');
      if (token && typeof token === 'string' && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      const status = err?.response?.status;
      // só redireciona em 401 real, evita loop se já está no login
      if (status === 401) {
        try { localStorage.removeItem('mac_token'); } catch {}
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        if (path !== '/login' && path !== '/') {
          // usa replace para não empilhar histórico
          window.location.replace('/login');
        }
      }
    } catch {}
    return Promise.reject(err);
  }
);

export default api;
