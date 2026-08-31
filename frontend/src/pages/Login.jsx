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

    // Prevenção de requisição vazia — não dispara API se campos vazios
    const emailTrim = email.trim();
    const senhaTrim = senha.trim();
    if (!emailTrim || !senhaTrim) {
      setErro('E-mail e senha são obrigatórios');
      return;
    }

    setErro('');
    setLoading(true);
    try {
      await login(emailTrim, senhaTrim);
      nav('/');
    } catch (err) {
      // Captura mensagem que vem do backend (HttpError 400/401) sem crashar React
      const status = err?.response?.status;
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Falha no login';

      // Mensagens amigáveis para 400/401
      let msg = backendMsg;
      if (status === 400) msg = backendMsg === 'email e senha obrigatórios' ? 'Preencha e-mail e senha' : backendMsg;
      if (status === 401) msg = 'Credenciais inválidas — verifique e-mail e senha';

      setErro(msg);
      console.warn('[Login]', status, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="login-panel">
        <form onSubmit={handle} className="login-card" noValidate>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', marginBottom:'20px', textAlign:'center'}}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#5C161B] overflow-hidden border border-[#FACC15]/20" style={{width:'48px', height:'48px', borderRadius:'9999px', background:'#5C161B', border:'1px solid rgba(250,204,21,0.2)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <img src="/logo-mac-transparente.png" alt="MAC" className="w-full h-full object-contain p-1" style={{width:'100%', height:'100%', objectFit:'contain', padding:'4px'}} />
            </div>
            <div><strong>Acesso da Equipe</strong><br/><small style={{color:'var(--text-muted)'}}>Entre com seu e-mail MAC</small></div>
          </div>

          <label style={{marginBottom:'12px'}}>E-mail
            <input placeholder="minimercado@mac.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label style={{marginBottom:'8px'}}>Senha
            <input type="password" placeholder="••••••••" value={senha} onChange={e=>setSenha(e.target.value)} autoComplete="current-password" />
          </label>

          {/* Exibição de Erros UI — vermelho abaixo dos inputs */}
          {erro && (
            <div
              role="alert"
              style={{
                background:'rgba(239,68,68,0.12)',
                border:'1px solid rgba(239,68,68,0.35)',
                color:'#f87171',
                padding:'12px',
                borderRadius:'var(--radius-sm)',
                fontSize:'13px',
                marginBottom:'12px',
                textAlign:'center'
              }}
            >
              {erro}
            </div>
          )}

          <button disabled={loading} className="button button-primary button-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
