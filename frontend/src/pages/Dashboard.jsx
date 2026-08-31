import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Dashboard(){
  const [data,setData]=useState(null);
  useEffect(()=>{api.get('/dashboard').then(r=>setData(r.data));},[]);
  if(!data) return <p className="p-8 text-center">Carregando dashboard...</p>;
  return(
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-black text-bordo">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card label="Total vendas" value={data.total_vendas} />
        <Card label="Pago" value={data.qtd_pago} color="text-green-700" />
        <Card label="Devendo" value={data.qtd_devendo} color="text-yellow-700" />
        <Card label="Arrecadado" value={`R$ ${Number(data.valor_total_arrecadado).toFixed(2)}`} />
      </div>
      <div className="bg-white rounded-2xl p-4 shadow border">
        <h2 className="font-bold text-bordo mb-3">Por dia</h2>
        {data.vendas_por_dia.length? data.vendas_por_dia.map(d=>(
          <div key={d.dia} className="flex justify-between border-b py-2 text-sm">
            <span>{d.dia}</span><span>{d.qtd} vendas</span><span className="font-bold">R$ {Number(d.valor).toFixed(2)}</span>
          </div>
        )): <p className="text-gray-400 text-sm">Sem vendas ainda</p>}
        <p className="text-xs text-gray-400 mt-3">Ticket médio: R$ {Number(data.ticket_medio).toFixed(2)}</p>
      </div>
    </div>
  );
}
function Card({label,value,color=""}){
  return <div className="bg-white rounded-xl p-4 shadow border text-center"><p className="text-xs text-gray-500">{label}</p><p className={`text-xl font-black text-bordo ${color}`}>{value}</p></div>
}
