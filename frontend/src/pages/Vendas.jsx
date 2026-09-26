import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { Minus, Plus, Download, Users } from 'lucide-react';

export default function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [form, setForm] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('mac_venda_form')||'null'); return s||{nome_equipe:'',nome_comprador:'',status_pagamento:'Pago'}; } catch { return {nome_equipe:'',nome_comprador:'',status_pagamento:'Pago'}; }
  });
  const [msg,setMsg]=useState('');
  const [salvo,setSalvo]=useState(false);
  const [showDevedores, setShowDevedores] = useState(false);
  const [devedores, setDevedores] = useState([]);
  
  useEffect(()=>{ api.get('/produtos').then(r=>setProdutos(r.data)); },[]);
  
  const salvarEquipe=()=>{ localStorage.setItem('mac_venda_form', JSON.stringify(form)); setSalvo(true); setTimeout(()=>setSalvo(false),2000); };
  
  const toggle = (p) => {
    setCarrinho(prev => {
      const exists = prev.find(x => x.id === p.id);
      if (exists) {
        return prev.filter(x => x.id !== p.id);
      }
      return [...prev, { ...p, quantidade: 1 }];
    });
  };
  
  const updateQuantidade = (id, delta) => {
    setCarrinho(prev => prev.map(item => {
      if (item.id === id) {
        const novaQtd = Math.max(1, item.quantidade + delta);
        if (novaQtd > item.estoque) return item;
        return { ...item, quantidade: novaQtd };
      }
      return item;
    }));
  };
  
  const removeItem = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };
  
  const total = carrinho.reduce((a, b) => a + Number(b.preco) * b.quantidade, 0);
  const totalItens = carrinho.reduce((a, b) => a + b.quantidade, 0);
  
  const vender = async (e) => {
    e.preventDefault();
    if (!carrinho.length) return setMsg('Selecione ao menos 1 produto');
    try {
      const produtos = carrinho.map(c => ({ id: c.id, quantidade: c.quantidade }));
      await api.post('/vendas', { ...form, produtos });
      const s = JSON.parse(localStorage.getItem('mac_venda_form')||'null');
      setMsg('✅ Venda registrada!');
      setCarrinho([]);
      setForm({ nome_equipe: s?.nome_equipe || form.nome_equipe, nome_comprador: '', status_pagamento: form.status_pagamento });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erro ao vender');
    }
  };
  
  const exportarExcel = async () => {
    try {
      const response = await api.get('/vendas/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mac_vendas_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMsg('✅ Excel baixado!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erro ao exportar Excel');
    }
  };
  
  const carregarDevedores = async () => {
    try {
      const { data } = await api.get('/vendas/devedores');
      setDevedores(data);
      setShowDevedores(true);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erro ao carregar devedores');
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Nova <span>Venda</span></h1>
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button type="button" onClick={exportarExcel} className="button button-gold" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <Download size={16} /> Exportar Excel
          </button>
          <button type="button" onClick={carregarDevedores} className="button button-secondary" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <Users size={16} /> Ver Devedores
          </button>
        </div>
      </div>

      {/* Modal Devedores */}
      {showDevedores && (
        <div className="modal-overlay" onClick={() => setShowDevedores(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{width: '90%', maxWidth: '700px', maxHeight: '80vh', overflow: 'auto', padding: '24px'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h2 style={{margin: 0}}>📋 Devedores Agrupados</h2>
              <button onClick={() => setShowDevedores(false)} className="button button-secondary">Fechar</button>
            </div>
            {devedores.length === 0 ? (
              <p style={{textAlign: 'center', color: 'var(--text-dim)', padding: '32px'}}>Nenhum devedor no momento</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {devedores.map(d => (
                  <div key={d.comprador} className="card" style={{padding: '16px', borderLeft: '4px solid var(--danger)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                      <strong style={{fontSize: '16px'}}>{d.comprador}</strong>
                      <span style={{fontWeight: 800, color: 'var(--danger)', fontSize: '18px'}}>
                        R$ {Number(d.total_devendo).toFixed(2)}
                      </span>
                    </div>
                    <div style={{color: 'var(--text-dim)', fontSize: '13px', marginBottom: '8px'}}>
                      {d.qtd_vendas} venda(s) pendente(s)
                    </div>
                    <details style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                      <summary style={{cursor: 'pointer', marginBottom: '4px'}}>Ver detalhes</summary>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px'}}>
                        {d.vendas.map(v => (
                          <div key={v.id} style={{padding: '8px', background: 'var(--bg-elevated)', borderRadius: '4px'}}>
                            <div>Venda #{v.id} - {new Date(v.data).toLocaleString('pt-BR')}</div>
                            <div>R$ {Number(v.valor).toFixed(2)}</div>
                            <div>{v.produtos?.map(p => `${p.nome} (${p.quantidade}x)`).join(', ')}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="catalog-grid">
            {produtos.map(p=>{
              const itemCarrinho = carrinho.find(x=>x.id===p.id);
              const sel = !!itemCarrinho;
              const qtd = itemCarrinho?.quantidade || 0;
              return (
                <div key={p.id} className={`product-select-card ${sel?'active':''}`} style={{display: 'flex', flexDirection: 'column'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <strong style={{fontSize:'14px'}}>{p.nome}</strong>
                    <span style={{fontWeight:800, color: sel?'var(--yellow)':'var(--success)'}}>R$ {Number(p.preco).toFixed(2)}</span>
                  </div>
                  <small style={{fontSize:'12px', color: 'var(--text-dim)'}}>Estoque: {p.estoque}</small>
                  {sel ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)'}}>
                      <button type="button" onClick={() => updateQuantidade(p.id, -1)} className="button button-secondary" style={{padding: '4px 10px', minWidth: '36px'}} disabled={qtd <= 1}><Minus size={14} /></button>
                      <span style={{fontWeight: 700, fontSize: '16px', minWidth: '30px', textAlign: 'center'}}>{qtd}</span>
                      <button type="button" onClick={() => updateQuantidade(p.id, 1)} className="button button-secondary" style={{padding: '4px 10px', minWidth: '36px'}} disabled={qtd >= p.estoque}><Plus size={14} /></button>
                      <button type="button" onClick={() => removeItem(p.id)} className="button button-secondary" style={{marginLeft: 'auto', padding: '4px 10px', fontSize: '11px'}}>Remover</button>
                    </div>
                  ) : (
                    <button type="button" onClick={()=>toggle(p)} className="button button-primary" style={{marginTop: '8px', width: '100%'}}>
                      Adicionar ao carrinho
                    </button>
                  )}
                </div>
              );
            })}
            {!produtos.length && <div style={{gridColumn:'1/-1', textAlign:'center', padding:'32px', color:'var(--text-dim)'}}>Cadastre produtos primeiro</div>}
          </div>
        </div>

        {carrinho.length > 0 && (
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', flexWrap:'wrap', gap:'12px'}}>
            <span style={{fontWeight:700}}>
              Total: <b style={{color:'var(--success)', fontSize:'18px'}}>R$ {total.toFixed(2)}</b> 
              <small style={{color:'var(--text-dim)'}}>({totalItens} itens)</small>
            </span>
            <button className="button button-primary" style={{fontSize: '16px', padding: '12px 24px'}}>Registrar Venda</button>
          </div>
        )}
        {msg && <p style={{textAlign:'center', color:'var(--success)', fontWeight:600}}>{msg}</p>}
      </form>
    </div>
  );
}
