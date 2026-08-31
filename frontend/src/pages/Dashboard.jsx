import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { ShoppingBag, CheckCircle2, Clock3, Wallet, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard(){
  const [data,setData]=useState(null);
  const [vendas,setVendas]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([api.get('/dashboard'), api.get('/vendas')])
      .then(([d,v])=>{ setData(d.data); setVendas(v.data.slice(0,6)); })
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return <p className="p-8 text-center text-zinc-400">Carregando dashboard...</p>;
  if(!data) return <p className="p-8 text-center text-zinc-400">Sem dados</p>;

  return(
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-zinc-50">Dashboard</h1>
          <span className="text-xs text-zinc-500 border border-zinc-800 bg-zinc-900 px-3 py-1 rounded-full flex items-center gap-1"><Calendar size={12}/> Encontro MAC - 2 Dias</span>
        </div>

        {/* 4 cards topo - padrão escuro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={ShoppingBag} label="Total de Vendas" value={data.total_vendas} sub={`${data.qtd_pago + data.qtd_devendo} registros`} />
          <MetricCard icon={CheckCircle2} label="Pago" value={data.qtd_pago} accent="text-emerald-400" />
          <MetricCard icon={Clock3} label="Devendo" value={data.qtd_devendo} accent="text-[#FACC15]" />
          <MetricCard icon={Wallet} label="Arrecadado" value={`R$ ${Number(data.valor_total_arrecadado).toFixed(2)}`} accent="text-emerald-400" sub={`Ticket médio R$ ${Number(data.ticket_medio).toFixed(2)}`} />
        </div>

        {/* Vendas por dia */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="font-bold text-zinc-50 mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-[#FACC15]"/> Vendas por Dia</h2>
          {data.vendas_por_dia.length? data.vendas_por_dia.map(d=>(
            <div key={d.dia} className="flex justify-between border-b border-zinc-800 py-2.5 text-sm">
              <span className="text-zinc-400">{d.dia}</span><span className="text-zinc-300">{d.qtd} vendas</span><span className="font-bold text-emerald-400">R$ {Number(d.valor).toFixed(2)}</span>
            </div>
          )): <p className="text-zinc-500 text-sm">Sem vendas ainda</p>}
        </div>

        {/* NOVA SEÇÃO VENDAS RECENTES */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-zinc-50">Vendas Recentes</h2>
            <span className="text-xs text-zinc-500">{vendas.length} últimas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950 text-zinc-500 text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Comprador</th>
                  <th className="text-left px-5 py-3 font-medium">Equipe</th>
                  <th className="text-right px-5 py-3 font-medium">Valor</th>
                  <th className="text-center px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendas.length ? vendas.map(v=>(
                  <tr key={v.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-5 py-3 text-zinc-50 font-medium">{v.nome_comprador}</td>
                    <td className="px-5 py-3 text-zinc-400">{v.nome_equipe}</td>
                    <td className="px-5 py-3 text-right font-bold text-zinc-50">R$ {Number(v.valor_total).toFixed(2)}</td>
                    <td className="px-5 py-3 text-center">
                      {v.status_pagamento === 'Pago'
                        ? <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Pago</span>
                        : <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20">Devendo</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-8 text-zinc-500">Nenhuma venda registrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* mobile fallback lista */}
          <div className="sm:hidden divide-y divide-zinc-800">
            {vendas.map(v=>(
              <div key={v.id} className="px-5 py-3 flex justify-between items-center">
                <div><p className="text-zinc-50 font-medium text-sm">{v.nome_comprador}</p><p className="text-xs text-zinc-500">{v.nome_equipe}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-zinc-50">R$ {Number(v.valor_total).toFixed(2)}</p>{v.status_pagamento==='Pago'?<span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Pago</span>:<span className="text-xs bg-[#FACC15]/10 text-[#FACC15] px-2 py-0.5 rounded-full">Devendo</span>}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, accent="text-zinc-50", sub }){
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-400 uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center"><Icon size={16} className="text-zinc-400"/></div>
      </div>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}
