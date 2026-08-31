import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { ShoppingCart, Check } from 'lucide-react';

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
      const saved = JSON.parse(localStorage.getItem('mac_venda_form') || 'null');
      const keepEquipe = saved?.nome_equipe || form.nome_equipe;
      setMsg('✅ Venda registrada!'); setCarrinho([]);
      setForm({ nome_equipe: keepEquipe, nome_comprador:'', status_pagamento: form.status_pagamento });
      setTimeout(()=>setMsg(''),3000);
    } catch(err){ setMsg(err.response?.data?.error || 'Erro ao vender'); }
  };

  const inputCls = "w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] focus:outline-none transition";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <h1 className="text-2xl font-black text-zinc-50 flex items-center gap-2"><ShoppingCart className="text-[#FACC15]"/> Nova Venda</h1>

        <form onSubmit={vender} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Nome da equipe *" required value={form.nome_equipe} onChange={e=>setForm({...form,nome_equipe:e.target.value})} />
            <input className={inputCls} placeholder="Nome do comprador *" required value={form.nome_comprador} onChange={e=>setForm({...form,nome_comprador:e.target.value})} />
          </div>
          <select className={inputCls} value={form.status_pagamento} onChange={e=>setForm({...form,status_pagamento:e.target.value})}>
            <option value="Pago">Pago</option>
            <option value="Devendo">Devendo</option>
          </select>

          <button type="button" onClick={salvarEquipe} className="w-full border border-[#FACC15]/30 text-[#FACC15] bg-[#FACC15]/5 font-bold py-2.5 rounded-xl hover:bg-[#FACC15]/10 flex items-center justify-center gap-2 transition">
            {salvo ? <><Check size={16}/> Salvo!</> : '💾 Salvar equipe para próximas vendas'}
          </button>
          <p className="text-xs text-zinc-500 text-center -mt-2">Salva equipe/status no celular, só digita o comprador na próxima</p>

          <p className="font-bold text-sm text-zinc-50">Selecione produtos (toque para adicionar):</p>
          {/* Grid responsivo dark premium */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-h-80 overflow-auto pr-1">
            {produtos.map(p=> {
              const sel = carrinho.find(x=>x.id===p.id);
              return (
                <button type="button" key={p.id} onClick={()=>toggle(p)} className={`text-left p-4 rounded-xl border flex flex-col gap-1 transition ${sel ? 'bg-[#5C161B] text-white border-[#5C161B] shadow' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800 text-zinc-50'}`}>
                  <span className="font-semibold text-sm leading-tight">{p.nome}</span>
                  <span className={`text-sm font-black ${sel?'text-[#FACC15]':'text-emerald-400'}`}>R$ {Number(p.preco).toFixed(2)}</span>
                  {sel && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full w-fit">Selecionado</span>}
                </button>
              );
            })}
            {!produtos.length && <p className="text-zinc-500 text-sm col-span-2 lg:col-span-4 text-center py-8">Cadastre produtos primeiro</p>}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-zinc-800 pt-4">
            <span className="font-bold text-zinc-50">Total: <span className="text-emerald-400">R$ {total.toFixed(2)}</span> <span className="text-zinc-500 font-normal">({carrinho.length} itens)</span></span>
            <button className="w-full sm:w-auto bg-[#5C161B] hover:bg-[#7a1d24] text-white px-8 py-3 rounded-xl font-bold transition">Registrar Venda</button>
          </div>
          {msg && <p className="text-center text-sm font-semibold text-emerald-400">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
