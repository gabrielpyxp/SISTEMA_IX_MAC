import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { Trash2, Download, Users } from 'lucide-react';

export default function Historico(){
  const [vendas,setVendas]=useState([]);
  const [showDevedores, setShowDevedores] = useState(false);
  const [devedores, setDevedores] = useState([]);
  
  const load=async()=>{ const {data}=await api.get('/vendas'); setVendas(data); };
  useEffect(()=>{load();},[]);
  
  const toggleStatus=async(v)=>{
    const novo = v.status_pagamento==='Pago'?'Devendo':'Pago';
    await api.put(`/vendas/${v.id}/status`,{status_pagamento:novo}); load();
  };
  
  const excluirVenda = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return;
    try {
      await api.delete(`/vendas/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir venda');
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
      alert('✅ Excel baixado com sucesso!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao exportar Excel');
    }
  };
  
  const carregarDevedores = async () => {
    try {
      const { data } = await api.get('/vendas/devedores');
      setDevedores(data);
      setShowDevedores(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao carregar devedores');
    }
  };

  return(
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>Vendas</h1>
          <p>Toque no badge para alternar Pago/Devendo</p>
        </div>
        <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
          <button onClick={exportarExcel} className="button button-gold" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <Download size={16} /> Exportar Excel
          </button>
          <button onClick={carregarDevedores} className="button button-secondary" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
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
      
      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        {vendas.map(v=>(
          <div key={v.id} className="card" style={{padding:'16px', display:'flex', justifyContent:'space-between', gap:'12px'}}>
            <div style={{minWidth:0, flex:1}}>
              <strong>{v.nome_comprador} <span style={{color:'var(--text-muted)', fontWeight:400}}>• {v.nome_equipe}</span></strong>
              <div style={{color:'var(--text-dim)', fontSize:'12px'}}>{new Date(v.created_at).toLocaleString('pt-BR')}</div>
              <div style={{color:'var(--text-muted)', fontSize:'13px', marginTop:'4px'}}>
                {v.produtos?.map(p=>`${p.nome} (${p.quantidade || 1}x)`).join(', ')}
              </div>
              <div style={{fontWeight:800, color:'var(--success)', marginTop:'4px'}}>R$ {Number(v.valor_total).toFixed(2)}</div>
            </div>
            <div style={{display:'flex', gap:'8px', flexShrink:0}}>
              <button onClick={()=>toggleStatus(v)} className={`status-pill ${v.status_pagamento==='Pago'?'status-ok':'status-pending'}`} style={{height:'fit-content'}}><i/>{v.status_pagamento}</button>
              <button onClick={()=>excluirVenda(v.id)} className="button button-secondary" style={{padding:'8px 14px'}}><Trash2 size={14}/> Excluir</button>
            </div>
          </div>
        ))}
        {!vendas.length && <div className="card" style={{padding:'48px', textAlign:'center', color:'var(--text-dim)'}}>Nenhuma venda ainda</div>}
      </div>
    </div>
  );
}
