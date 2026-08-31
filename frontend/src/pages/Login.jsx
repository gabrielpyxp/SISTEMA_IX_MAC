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
    <div className="auth-page">
      <div className="auth-glow" style={{top:'-100px', right:'-100px'}}/>
      <div className="auth-brand">
        <div style={{display:'flex', alignItems:'center', gap:'12px', fontWeight:800, fontSize:'28px'}}>
          <div style={{width:'48px', height:'48px', borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', padding:'6px', border:'1px solid var(--border)'}}>
            <img src="/logo-mac.png" alt="MAC" style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:'50%'}}/>
          </div>
          ENCONTRO <span style={{color:'var(--accent)'}}>MAC</span>
        </div>
        <div className="auth-copy">
          <span className="eyebrow">Movimento de Amizade com Cristo</span>
          <h1>Minimercado <span style={{color:'var(--accent)'}}>premium</span></h1>
          <p>Sistema dark bordô + dourado. Rápido no celular, pronto para 2 dias de evento.</p>
        </div>
      </div>
      <div className="login-panel">
        <form onSubmit={handle} className="login-card">
          <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
            <div style={{width:'44px', height:'44px', borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', padding:'5px'}}><img src="/logo-mac.png" alt="" style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:'50%'}}/></div>
            <div><strong>Acesso da Equipe</strong><br/><small style={{color:'var(--text-muted)'}}>Entre com seu e-mail MAC</small></div>
          </div>
          {erro && <div style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', padding:'12px', borderRadius:'var(--radius-sm)', fontSize:'13px', marginBottom:'12px'}}>{erro}</div>}
          <label style={{marginBottom:'12px'}}>E-mail<input placeholder="minimercado@mac.com" value={email} onChange={e=>setEmail(e.target.value)} /></label>
          <label style={{marginBottom:'16px'}}>Senha<input type="password" placeholder="••••••••" value={senha} onChange={e=>setSenha(e.target.value)} /></label>
          <button disabled={loading} className="button button-primary button-full">{loading ? 'Entrando...' : 'Entrar'}</button>
          <p style={{textAlign:'center', color:'var(--text-dim)', fontSize:'11px', marginTop:'12px'}}>Dica: minimercado@mac.com / mac123</p>
        </form>
      </div>
    </div>
  );
}
