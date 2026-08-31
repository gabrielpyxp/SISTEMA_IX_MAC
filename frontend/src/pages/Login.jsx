import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('minimercado@mac.com');
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
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 bg-zinc-950">
      <form onSubmit={handle} className="bg-zinc-900 w-full max-w-sm rounded-2xl p-6 space-y-4 border border-zinc-800">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full w-16 h-16 bg-[#5C161B] flex items-center justify-center p-1 border border-zinc-800">
            <img src="/logo-mac.png" alt="MAC" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-2xl font-black text-zinc-50 text-center">Acesso da Equipe</h1>
          <p className="text-center text-sm text-zinc-500">Encontro MAC • Minimercado</p>
        </div>
        {erro && <div className="bg-red-950/50 text-red-400 text-sm p-3 rounded-xl border border-red-900">{erro}</div>}
        <input className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:ring-2 focus:ring-[#FACC15] focus:outline-none" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:ring-2 focus:ring-[#FACC15] focus:outline-none" type="password" placeholder="Senha" value={senha} onChange={e=>setSenha(e.target.value)} />
        <button disabled={loading} className="w-full bg-[#5C161B] hover:bg-[#7a1d24] text-white font-bold py-3 rounded-xl disabled:opacity-50 transition">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="text-xs text-zinc-500 text-center">minimercado@mac.com / mac123</p>
      </form>
    </div>
  );
}
