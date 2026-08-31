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
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-black text-bordo">Histórico de Vendas</h1>
      <div className="space-y-3">
        {vendas.map(v=>(
          <div key={v.id} className="bg-white rounded-xl p-4 shadow border">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-bordo">{v.nome_comprador} <span className="font-normal text-gray-500">• {v.nome_equipe}</span></p>
                <p className="text-xs text-gray-400">{new Date(v.created_at).toLocaleString('pt-BR')}</p>
                <p className="text-sm mt-1">{v.produtos?.map(p=>p.nome).join(', ')}</p>
                <p className="font-black text-bordo mt-1">R$ {Number(v.valor_total).toFixed(2)}</p>
              </div>
              <button onClick={()=>toggleStatus(v)} className={`px-3 py-1 rounded-full text-xs font-black border ${v.status_pagamento==='Pago'?'bg-green-100 text-green-700 border-green-200':'bg-dourado text-bordo border-yellow-300'}`}>
                {v.status_pagamento}
              </button>
            </div>
          </div>
        ))}
        {!vendas.length && <p className="text-center text-gray-400 py-10">Nenhuma venda ainda</p>}
      </div>
    </div>
  );
}
