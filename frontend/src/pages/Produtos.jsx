import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { Pencil, Trash2 } from 'lucide-react';

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
    <div className="page">
      <div className="page-heading">
        <div><span className="eyebrow">Minimercado</span><h1>Produtos</h1><p>Gerencie estoque — foco dourado nos inputs</p></div>
      </div>

      <form onSubmit={submit} className="card" style={{padding:'20px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <label style={{gridColumn:'1/-1'}}>Nome *<input placeholder="Ex: Água 500ml" required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} /></label>
          <label>Preço *<input type="number" step="0.01" placeholder="3.00" required value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} /></label>
          <label>Estoque<input type="number" placeholder="100" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})} /></label>
          <label style={{gridColumn:'1/-1'}}>Descrição<input placeholder="Opcional" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} /></label>
        </div>
        <div style={{display:'flex', gap:'12px', marginTop:'16px'}}>
          <button className="button button-primary" style={{flex:1}}>{editing ? 'Atualizar' : 'Cadastrar'} Produto</button>
          {editing && <button type="button" onClick={()=>{setEditing(null);setForm({nome:'',preco:'',estoque:'',descricao:''})}} className="button button-secondary">Cancelar</button>}
        </div>
      </form>

      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        {produtos.map(p=>(
          <div key={p.id} className="card" style={{padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px'}}>
            <div style={{minWidth:0}}>
              <strong style={{fontSize:'15px'}}>{p.nome}</strong>
              <div style={{color:'var(--text-muted)', fontSize:'13px'}}>R$ {Number(p.preco).toFixed(2)} • Estoque: {p.estoque}</div>
              {p.descricao && <small style={{color:'var(--text-dim)'}}>{p.descricao}</small>}
            </div>
            <div style={{display:'flex', gap:'8px', flexShrink:0}}>
              <button onClick={()=>{setEditing(p.id); setForm({nome:p.nome,preco:p.preco,estoque:p.estoque,descricao:p.descricao||''})}} className="button button-gold" style={{padding:'8px 14px'}}><Pencil size={14}/> Editar</button>
              <button onClick={()=>remove(p.id)} className="button button-secondary" style={{padding:'8px 14px'}}><Trash2 size={14}/> Excluir</button>
            </div>
          </div>
        ))}
        {!produtos.length && <div className="card" style={{padding:'32px', textAlign:'center', color:'var(--text-dim)'}}>Nenhum produto cadastrado</div>}
      </div>
    </div>
  );
}
