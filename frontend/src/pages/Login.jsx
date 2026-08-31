import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('admin@mac.com');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErro(''); setLoading(true);
    try { await login(email, senha); nav('/'); }
    catch (err) { setErro(err.response?.data?.error || 'Falha no login'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <form onSubmit={handle} className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-6 space-y-4 border">
        <h1 className="text-2xl font-black text-bordo text-center">Acesso da Equipe</h1>
        <p className="text-center text-sm text-gray-500">Encontro MAC • Minimercado</p>
        {erro && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">{erro}</div>}
        <input className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo" type="password" placeholder="Senha" value={senha} onChange={e=>setSenha(e.target.value)} />
        <button disabled={loading} className="w-full bg-bordo hover:bg-bordoHover text-white font-bold py-3 rounded-xl disabled:opacity-50">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="text-xs text-gray-400 text-center">Sem conta? Peça ao admin para criar em /api/auth/register</p>
      </form>
    </div>
  );
}
