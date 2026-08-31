import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { ShoppingBag, CheckCircle2, Clock3, Wallet, TrendingUp } from 'lucide-react';

export default function Dashboard(){
  const [data,setData]=useState(null);
  const [vendas,setVendas]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([api.get('/dashboard'), api.get('/vendas')])
      .then(([d,v])=>{ setData(d.data); setVendas(v.data.slice(0,8)); })
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return <div className="page"><p style={{color:'var(--text-dim)'}}>Carregando dashboard...</p></div>;
  if(!data) return <div className="page"><p style={{color:'var(--text-dim)'}}>Sem dados</p></div>;

  return(
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Encontro MAC • 2 dias</span>
          <h1>Dashboard</h1>
          <p>Visão premium — Métricas em tempo real</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card metric-zinc">
          <div className="metric-icon"><ShoppingBag size={20} /></div>
          <div className="metric-copy"><span>Total de Vendas</span><strong>{data.total_vendas}</strong></div>
        </div>
        <div className="metric-card metric-green">
          <div className="metric-icon"><CheckCircle2 size={20} /></div>
          <div className="metric-copy"><span>Pago</span><strong>{data.qtd_pago}</strong></div>
        </div>
        <div className="metric-card metric-gold">
          <div className="metric-icon"><Clock3 size={20} /></div>
          <div className="metric-copy"><span>Devendo</span><strong>{data.qtd_devendo}</strong></div>
        </div>
        <div className="metric-card metric-bordo">
          <div className="metric-icon"><Wallet size={20} /></div>
          <div className="metric-copy"><span>Arrecadado</span><strong style={{color:'var(--success)'}}>R$ {Number(data.valor_total_arrecadado).toFixed(2)}</strong><small style={{color:'var(--text-dim)', fontSize:'11px'}}>Ticket R$ {Number(data.ticket_medio).toFixed(2)}</small></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <div><h3>Vendas por Dia</h3><p>Agregado diário do minimercado</p></div>
          <TrendingUp size={18} style={{color:'var(--accent-gold)'}}/>
        </div>
        <div style={{padding:'8px 20px 20px', display:'flex', flexDirection:'column', gap:'0'}}>
          {data.vendas_por_dia.length? data.vendas_por_dia.map(d=>(
            <div key={d.dia} className="table-row" style={{gridTemplateColumns:'1fr 1fr 1fr', borderBottom: '1px solid var(--border)', padding:'12px 0'}}>
              <span style={{color:'var(--text-muted)'}}>{d.dia}</span><span style={{textAlign:'center'}}>{d.qtd} vendas</span><span style={{textAlign:'right', fontWeight:700, color:'var(--success)'}}>R$ {Number(d.valor).toFixed(2)}</span>
            </div>
          )): <p style={{color:'var(--text-dim)', padding:'16px 0'}}>Sem vendas ainda</p>}
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <div><h3>Vendas Recentes</h3><p>Últimas {vendas.length} transações • GET /api/vendas</p></div>
          <span className="status-pill status-ok">{vendas.length} registros</span>
        </div>
        <div className="table-card">
          <div className="data-table" style={{minWidth:'0'}}>
            <div className="table-row table-head">
              <span>Comprador</span><span>Equipe</span><span style={{textAlign:'right'}}>Valor</span><span style={{textAlign:'center'}}>Status</span>
            </div>
            {vendas.length ? vendas.map(v=>(
              <div key={v.id} className="table-row" style={{borderBottom:'1px solid var(--border)'}}>
                <strong style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v.nome_comprador}</strong>
                <span style={{color:'var(--text-muted)', fontSize:'13px'}}>{v.nome_equipe}</span>
                <span style={{textAlign:'right', fontWeight:700}}>R$ {Number(v.valor_total).toFixed(2)}</span>
                <span style={{textAlign:'center'}}>{v.status_pagamento === 'Pago' ? <span className="status-pill status-ok"><i/>Pago</span> : <span className="status-pill status-pending"><i/>Devendo</span>}</span>
              </div>
            )) : <div style={{padding:'32px', textAlign:'center', color:'var(--text-dim)'}}>Nenhuma venda registrada</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
