import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Historico(){
  const [vendas,setVendas]=useState([]);
  const load=async()=>{const{r} = await api.get('/vendas').then(r=>({r:r.data})); setVendas(r); };
  useEffect(()=>{load();},[]);
  const toggleStatus=async(v)=>{
    const novo = v.status_pagamento==='Pago'?'Devendo':'Pago';
    await api.put(`/vendas/${v.id}/status`,{status_pagamento:novo}); load();
  };
  return(
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-black text-zinc-50">Histórico de Vendas</h1>
        <div className="space-y-3">
          {vendas.map(v=>(
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-zinc-50">{v.nome_comprador} <span className="font-normal text-zinc-500">• {v.nome_equipe}</span></p>
                  <p className="text-xs text-zinc-500">{new Date(v.created_at).toLocaleString('pt-BR')}</p>
                  <p className="text-sm mt-1 text-zinc-300">{v.produtos?.map(p=>p.nome).join(', ')}</p>
                  <p className="font-black text-emerald-400 mt-1">R$ {Number(v.valor_total).toFixed(2)}</p>
                </div>
                <button onClick={()=>toggleStatus(v)} className={`px-3 py-1 rounded-full text-xs font-bold border ${v.status_pagamento==='Pago'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/20'}`}>
                  {v.status_pagamento}
                </button>
              </div>
            </div>
          ))}
          {!vendas.length && <p className="text-center text-zinc-500 py-10">Nenhuma venda ainda</p>}
        </div>
      </div>
    </div>
  );
}
