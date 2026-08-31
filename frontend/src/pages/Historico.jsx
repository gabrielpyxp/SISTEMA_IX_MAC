import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Historico(){
  const [vendas,setVendas]=useState([]);
  const load=async()=>{ const {data}=await api.get('/vendas'); setVendas(data); };
  useEffect(()=>{load();},[]);
  const toggleStatus=async(v)=>{
    const novo = v.status_pagamento==='Pago'?'Devendo':'Pago';
    await api.put(`/vendas/${v.id}/status`,{status_pagamento:novo}); load();
  };
  return(
    <div className="page">
      <div className="page-heading">
        <div><span className="eyebrow">Histórico</span><h1>Vendas</h1><p>Toque no badge para alternar Pago/Devendo</p></div>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        {vendas.map(v=>(
          <div key={v.id} className="card" style={{padding:'16px', display:'flex', justifyContent:'space-between', gap:'12px'}}>
            <div style={{minWidth:0, flex:1}}>
              <strong>{v.nome_comprador} <span style={{color:'var(--text-muted)', fontWeight:400}}>• {v.nome_equipe}</span></strong>
              <div style={{color:'var(--text-dim)', fontSize:'12px'}}>{new Date(v.created_at).toLocaleString('pt-BR')}</div>
              <div style={{color:'var(--text-muted)', fontSize:'13px', marginTop:'4px'}}>{v.produtos?.map(p=>p.nome).join(', ')}</div>
              <div style={{fontWeight:800, color:'var(--success)', marginTop:'4px'}}>R$ {Number(v.valor_total).toFixed(2)}</div>
            </div>
            <button onClick={()=>toggleStatus(v)} className={`status-pill ${v.status_pagamento==='Pago'?'status-ok':'status-pending'}`} style={{height:'fit-content'}}><i/>{v.status_pagamento}</button>
          </div>
        ))}
        {!vendas.length && <div className="card" style={{padding:'48px', textAlign:'center', color:'var(--text-dim)'}}>Nenhuma venda ainda</div>}
      </div>
    </div>
  );
}
