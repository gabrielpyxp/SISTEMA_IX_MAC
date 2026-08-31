import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [form, setForm] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('mac_venda_form')||'null'); return s||{nome_equipe:'',nome_comprador:'',status_pagamento:'Pago'}; } catch { return {nome_equipe:'',nome_comprador:'',status_pagamento:'Pago'}; }
  });
  const [msg,setMsg]=useState('');
  const [salvo,setSalvo]=useState(false);
  useEffect(()=>{ api.get('/produtos').then(r=>setProdutos(r.data)); },[]);
  const salvarEquipe=()=>{ localStorage.setItem('mac_venda_form', JSON.stringify(form)); setSalvo(true); setTimeout(()=>setSalvo(false),2000); };
  const toggle=(p)=> setCarrinho(prev=> prev.find(x=>x.id===p.id) ? prev.filter(x=>x.id!==p.id) : [...prev,p]);
  const total=carrinho.reduce((a,b)=>a+Number(b.preco),0);
  const vender=async(e)=>{
    e.preventDefault();
    if(!carrinho.length) return setMsg('Selecione ao menos 1 produto');
    try{ await api.post('/vendas',{...form, produtos_ids:carrinho.map(c=>c.id)}); const s=JSON.parse(localStorage.getItem('mac_venda_form')||'null'); setMsg('✅ Venda registrada!'); setCarrinho([]); setForm({nome_equipe:s?.nome_equipe||form.nome_equipe, nome_comprador:'', status_pagamento:form.status_pagamento}); setTimeout(()=>setMsg(''),3000);}catch(err){ setMsg(err.response?.data?.error||'Erro ao vender'); }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div><span className="eyebrow">PDV • Mobile First</span><h1>Nova <span>Venda</span></h1><p>Selecione produtos com toque — bordô + dourado</p></div>
      </div>

      <form onSubmit={vender} className="card" style={{padding:'20px', display:'flex', flexDirection:'column', gap:'16px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <label>Equipe <input placeholder="Nome da equipe *" required value={form.nome_equipe} onChange={e=>setForm({...form,nome_equipe:e.target.value})} /></label>
          <label>Comprador <input placeholder="Nome do comprador *" required value={form.nome_comprador} onChange={e=>setForm({...form,nome_comprador:e.target.value})} /></label>
        </div>
        <label>Status
          <select value={form.status_pagamento} onChange={e=>setForm({...form,status_pagamento:e.target.value})}>
            <option value="Pago">Pago</option>
            <option value="Devendo">Devendo</option>
          </select>
        </label>
        <button type="button" onClick={salvarEquipe} className={`button ${salvo?'button-primary':''}`} style={{border: salvo?'none':'1px solid rgba(250,204,21,0.3)', background: salvo?'var(--success)': 'rgba(250,204,21,0.06)', color: salvo?'white':'var(--yellow)'}}>
          {salvo ? '✅ Salvo!' : '💾 Salvar equipe para próximas vendas'}
        </button>

        <div>
          <span className="eyebrow" style={{marginBottom:'10px', display:'block'}}>Produtos • toque para adicionar</span>
          <div className="catalog-grid">
            {produtos.map(p=>{
              const sel=!!carrinho.find(x=>x.id===p.id);
              return (
                <button type="button" key={p.id} onClick={()=>toggle(p)} className={`product-select-card ${sel?'active':''}`}>
                  <strong style={{fontSize:'14px'}}>{p.nome}</strong>
                  <small style={{fontSize:'12px', color: sel? 'rgba(255,255,255,0.7)':'var(--text-dim)'}}>Estoque {p.estoque}</small>
                  <span style={{fontWeight:800, color: sel?'var(--yellow)':'var(--success)'}}>R$ {Number(p.preco).toFixed(2)}</span>
                  {sel && <span style={{fontSize:'11px', background:'rgba(255,255,255,0.15)', padding:'2px 8px', borderRadius:'999px', width:'fit-content'}}>Selecionado</span>}
                </button>
              );
            })}
            {!produtos.length && <div style={{gridColumn:'1/-1', textAlign:'center', padding:'32px', color:'var(--text-dim)'}}>Cadastre produtos primeiro</div>}
          </div>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', flexWrap:'wrap', gap:'12px'}}>
          <span style={{fontWeight:700}}>Total: <b style={{color:'var(--success)', fontSize:'18px'}}>R$ {total.toFixed(2)}</b> <small style={{color:'var(--text-dim)'}}>({carrinho.length} itens)</small></span>
          <button className="button button-primary">Registrar Venda</button>
        </div>
        {msg && <p style={{textAlign:'center', color:'var(--success)', fontWeight:600}}>{msg}</p>}
      </form>
    </div>
  );
}
