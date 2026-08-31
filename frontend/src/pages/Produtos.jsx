import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { Package, Pencil, Trash2 } from 'lucide-react';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ nome:'', preco:'', estoque:'', descricao:'' });
  const [editing, setEditing] = useState(null);

  const load = async () => { const {data}=await api.get('/produtos'); setProdutos(data); };
  useEffect(()=>{ load(); },[]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, preco: Number(form.preco), estoque: Number(form.estoque||0) };
    if (editing) await api.put(`/produtos/${editing}`, payload);
    else await api.post('/produtos', payload);
    setForm({ nome:'', preco:'', estoque:'', descricao:'' }); setEditing(null); load();
  };
  const remove = async (id) => { if(confirm('Remover?')){ await api.delete(`/produtos/${id}`); load(); } };

  const inputCls = "bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:ring-2 focus:ring-[#FACC15] focus:border-[#FACC15] focus:outline-none transition";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-zinc-50 flex items-center gap-2"><Package className="text-[#FACC15]"/> Produtos</h1>

        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 grid grid-cols-2 gap-3">
          <input className={`${inputCls} col-span-2`} placeholder="Nome *" required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} />
          <input className={inputCls} type="number" step="0.01" placeholder="Preço *" required value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} />
          <input className={inputCls} type="number" placeholder="Estoque" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})} />
          <input className={`${inputCls} col-span-2`} placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} />
          <button className="col-span-2 w-full bg-[#5C161B] hover:bg-[#7a1d24] text-white font-bold py-3 rounded-xl transition">{editing ? 'Atualizar' : 'Cadastrar'} Produto</button>
          {editing && <button type="button" onClick={()=>{setEditing(null);setForm({nome:'',preco:'',estoque:'',descricao:''})}} className="col-span-2 w-full bg-zinc-800 border border-zinc-700 text-zinc-300 py-3 rounded-xl">Cancelar edição</button>}
        </form>

        <div className="grid gap-3">
          {produtos.map(p=>(
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-zinc-50">{p.nome}</p>
                <p className="text-sm text-zinc-400">R$ {Number(p.preco).toFixed(2)} • Estoque: {p.estoque}</p>
                {p.descricao && <p className="text-xs text-zinc-500">{p.descricao}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{setEditing(p.id); setForm({nome:p.nome,preco:p.preco,estoque:p.estoque,descricao:p.descricao||''})}} className="bg-[#FACC15] text-zinc-950 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"><Pencil size={14}/> Editar</button>
                <button onClick={()=>remove(p.id)} className="bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 px-3 py-2 rounded-xl text-sm flex items-center gap-1"><Trash2 size={14}/> Excluir</button>
              </div>
            </div>
          ))}
          {!produtos.length && <p className="text-center text-zinc-500 py-8">Nenhum produto cadastrado</p>}
        </div>
      </div>
    </div>
  );
}
