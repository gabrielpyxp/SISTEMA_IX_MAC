import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mac_venda_form') || 'null');
      return saved || { nome_equipe:'', nome_comprador:'', status_pagamento:'Pago' };
    } catch { return { nome_equipe:'', nome_comprador:'', status_pagamento:'Pago' }; }
  });
  const [msg, setMsg] = useState('');
  const [salvo, setSalvo] = useState(false);

  useEffect(()=>{ api.get('/produtos').then(r=>setProdutos(r.data)); },[]);

  const salvarEquipe = () => {
    localStorage.setItem('mac_venda_form', JSON.stringify(form));
    setSalvo(true); setTimeout(()=>setSalvo(false), 2000);
  };

  const toggle = (p) => {
    setCarrinho(prev => prev.find(x=>x.id===p.id) ? prev.filter(x=>x.id!==p.id) : [...prev,p]);
  };
  const total = carrinho.reduce((a,b)=>a+Number(b.preco),0);

  const vender = async (e) => {
    e.preventDefault();
    if(!carrinho.length) return setMsg('Selecione ao menos 1 produto');
    try{
      await api.post('/vendas', { ...form, produtos_ids: carrinho.map(c=>c.id) });
      // mantém equipe salva, limpa só comprador e carrinho
      const saved = JSON.parse(localStorage.getItem('mac_venda_form') || 'null');
      const keepEquipe = saved?.nome_equipe || form.nome_equipe;
      setMsg('✅ Venda registrada!'); setCarrinho([]);
      setForm({ nome_equipe: keepEquipe, nome_comprador:'', status_pagamento: form.status_pagamento });
      setTimeout(()=>setMsg(''),3000);
    } catch(err){ setMsg(err.response?.data?.error || 'Erro ao vender'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-black text-bordo">Nova Venda</h1>

      <form onSubmit={vender} className="bg-white rounded-2xl p-4 shadow border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded-xl px-3 py-2" placeholder="Nome da equipe *" required value={form.nome_equipe} onChange={e=>setForm({...form,nome_equipe:e.target.value})} />
          <input className="border rounded-xl px-3 py-2" placeholder="Nome do comprador *" required value={form.nome_comprador} onChange={e=>setForm({...form,nome_comprador:e.target.value})} />
        </div>
        <button type="button" onClick={salvarEquipe} className="w-full border-2 border-dourado text-bordo font-bold py-2 rounded-xl hover:bg-yellow-50 flex items-center justify-center gap-2">
          {salvo ? '✅ Salvo!' : '💾 Salvar equipe para próximas vendas'}
        </button>
        <p className="text-xs text-gray-400 text-center -mt-1">Salva equipe/status no celular, só digita o comprador na próxima</p>
        <select className="w-full border rounded-xl px-3 py-2" value={form.status_pagamento} onChange={e=>setForm({...form,status_pagamento:e.target.value})}>
          <option value="Pago">Pago</option>
          <option value="Devendo">Devendo</option>
        </select>

        <p className="font-bold text-sm text-bordo">Selecione produtos (toque para adicionar):</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto">
          {produtos.map(p=> {
            const sel = carrinho.find(x=>x.id===p.id);
            return (
              <button type="button" key={p.id} onClick={()=>toggle(p)} className={`text-left p-3 rounded-xl border flex justify-between items-center ${sel ? 'bg-bordo text-white border-bordo' : 'bg-gray-50'}`}>
                <span className="font-semibold text-sm">{p.nome}</span>
                <span className={`text-sm font-black ${sel?'text-dourado':'text-bordo'}`}>R$ {Number(p.preco).toFixed(2)}</span>
              </button>
            );
          })}
          {!produtos.length && <p className="text-gray-400 text-sm col-span-2 text-center py-4">Cadastre produtos primeiro</p>}
        </div>

        <div className="flex justify-between items-center border-t pt-3">
          <span className="font-bold">Total: <span className="text-bordo">R$ {total.toFixed(2)}</span> ({carrinho.length} itens)</span>
          <button className="bg-bordo hover:bg-bordoHover text-white px-6 py-2 rounded-xl font-bold">Registrar Venda</button>
        </div>
        {msg && <p className="text-center text-sm font-semibold text-bordo">{msg}</p>}
      </form>
    </div>
  );
}
