import { useEffect, useState } from 'react';
import api from '../services/api.js';

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-black text-bordo">Produtos</h1>

      <form onSubmit={submit} className="bg-white rounded-2xl p-4 shadow border grid grid-cols-2 gap-3">
        <input className="border rounded-xl px-3 py-2 col-span-2" placeholder="Nome *" required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} />
        <input className="border rounded-xl px-3 py-2" type="number" step="0.01" placeholder="Preço *" required value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} />
        <input className="border rounded-xl px-3 py-2" type="number" placeholder="Estoque" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})} />
        <input className="border rounded-xl px-3 py-2 col-span-2" placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} />
        <button className="col-span-2 bg-bordo text-white font-bold py-2 rounded-xl">{editing ? 'Atualizar' : 'Cadastrar'} Produto</button>
        {editing && <button type="button" onClick={()=>{setEditing(null);setForm({nome:'',preco:'',estoque:'',descricao:''})}} className="col-span-2 border py-2 rounded-xl">Cancelar edição</button>}
      </form>

      <div className="grid gap-3">
        {produtos.map(p=>(
          <div key={p.id} className="bg-white rounded-xl p-4 flex justify-between items-center shadow border">
            <div>
              <p className="font-bold text-bordo">{p.nome}</p>
              <p className="text-sm text-gray-500">R$ {Number(p.preco).toFixed(2)} • Estoque: {p.estoque}</p>
              {p.descricao && <p className="text-xs text-gray-400">{p.descricao}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={()=>{setEditing(p.id); setForm({nome:p.nome,preco:p.preco,estoque:p.estoque,descricao:p.descricao||''})}} className="bg-dourado text-bordo px-3 py-1 rounded-full text-sm font-bold">Editar</button>
              <button onClick={()=>remove(p.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">Excluir</button>
            </div>
          </div>
        ))}
        {!produtos.length && <p className="text-center text-gray-400 py-8">Nenhum produto cadastrado</p>}
      </div>
    </div>
  );
}
