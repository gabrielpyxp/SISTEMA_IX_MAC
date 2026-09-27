import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { Trash2, Download, Users, Edit2, CheckCircle2, Loader2, Search, X } from 'lucide-react';

export default function Historico() {
  const [vendas, setVendas] = useState([]);
  const [showDevedores, setShowDevedores] = useState(false);
  const [devedores, setDevedores] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [loadingActions, setLoadingActions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [devedoresSearch, setDevedoresSearch] = useState('');

  const load = async () => {
    const { data } = await api.get('/vendas');
    setVendas(data);
  };
  useEffect(() => { load(); }, []);

  const toggleStatus = async (v) => {
    const novo = v.status_pagamento === 'Pago' ? 'Devendo' : 'Pago';
    await api.put(`/vendas/${v.id}/status`, { status_pagamento: novo });
    load();
  };

  const excluirVenda = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return;
    try {
      await api.delete(`/vendas/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir venda');
    }
  };

  const exportarExcel = async () => {
    try {
      const response = await api.get('/vendas/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mac_vendas_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert('✅ Excel baixado com sucesso!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao exportar Excel');
    }
  };

  const carregarDevedores = async () => {
    try {
      const { data } = await api.get('/vendas/devedores');
      setDevedores(data);
      setShowDevedores(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao carregar devedores');
    }
  };

  const iniciarEdicao = (venda) => {
    setEditingId(venda.id);
    setEditNome(venda.nome_comprador);
  };

  const salvarEdicao = async (id) => {
    if (!editNome.trim()) return alert('Nome é obrigatório');
    setLoadingActions(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/vendas/${id}/comprador`, { nome_comprador: editNome.trim() });
      setEditingId(null);
      setEditNome('');
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar nome');
    } finally {
      setLoadingActions(prev => ({ ...prev, [id]: false }));
    }
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setEditNome('');
  };

  const marcarTodasPagas = async (devedor) => {
    const equipeStr = devedor.equipe && devedor.equipe.trim() ? devedor.equipe.trim() : '';
    const confirmMsg = `Marcar TODAS as ${devedor.qtd_vendas} dívida(s) de "${devedor.comprador}"${equipeStr ? ` (${equipeStr})` : ''} (R$ ${Number(devedor.total_devendo).toFixed(2)}) como PAGA?`;
    if (!confirm(confirmMsg)) return;

    const loadKey = `marcar-${devedor.comprador}-${equipeStr}`;
    setLoadingActions(prev => ({ ...prev, [loadKey]: true }));
    try {
      const payload = {
        nome_comprador: devedor.comprador.trim(),
        ...(equipeStr && { nome_equipe: equipeStr })
      };
      await api.post('/vendas/devedores/marcar-pagas', payload);
      alert(`✅ ${devedor.qtd_vendas} venda(s) marcada(s) como Paga!`);
      setShowDevedores(false);
      // Pequeno delay para garantir que o commit no banco terminou
      setTimeout(() => load(), 300);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao marcar como pagas';
      // Se não encontrou dívidas, é porque já pagou tudo - não é erro
      if (msg.includes('Nenhuma dívida encontrada') || msg.includes('404')) {
        alert('ℹ️ Essa pessoa/equipe já não tem mais dívidas pendentes.');
        setShowDevedores(false);
        load(); // Atualiza a lista para remover da tela
      } else {
        alert(msg);
      }
    } finally {
      setLoadingActions(prev => ({ ...prev, [loadKey]: false }));
    }
  };

  const vendasFiltradas = vendas.filter(v =>
    v.nome_comprador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.nome_equipe.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDevedoresModal = () => {
    const devedoresFiltrados = devedores.filter(d =>
      d.equipe && d.equipe.toLowerCase().includes(devedoresSearch.toLowerCase())
    );

    if (devedores.length === 0) {
      return (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '32px' }}>
          Nenhum devedor no momento
        </p>
      );
    }

    if (devedoresFiltrados.length === 0) {
      return (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '32px' }}>
          Nenhum devedor encontrado para equipe "{devedoresSearch}"
        </p>
      );
    }

    return (
      <>
        {devedoresSearch && (
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>
            {devedoresFiltrados.length} de {devedores.length} devedores encontrados
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {devedoresFiltrados.map(d => (
            <div key={d.comprador} className="card" style={{ padding: '16px', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>{d.comprador}</strong>
                  {d.equipe && (
                    <span style={{ marginLeft: '8px', fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>
                      Equipe: {d.equipe}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '18px' }}>
                    R$ {Number(d.total_devendo).toFixed(2)}
                  </span>
                  <button
                    onClick={() => marcarTodasPagas(d)}
                    disabled={loadingActions[`marcar-${d.comprador}-${d.equipe || ''}`]}
                    className="button button-success"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                  >
                    {loadingActions[`marcar-${d.comprador}-${d.equipe || ''}`] ? <Loader2 size={16} /> : <CheckCircle2 size={16} />}
                    Marcar Tudo Pago
                  </button>
                </div>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '8px' }}>
                {d.qtd_vendas} venda(s) pendente(s) • Equipe: {d.equipe || 'N/A'}
              </div>
              <details style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '4px' }}>Ver detalhes das vendas</summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
                  {d.vendas.map(v => (
                    <div key={v.id} style={{ padding: '8px', background: 'var(--bg-elevated)', borderRadius: '4px' }}>
                      <div>Venda #{v.id} - {new Date(v.data).toLocaleString('pt-BR')}</div>
                      <div>R$ {Number(v.valor).toFixed(2)}</div>
                      <div>{v.produtos?.map(p => `${p.nome} (${p.quantidade}x)`).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>Vendas</h1>
          <p>Toque no badge para alternar Pago/Devendo | Clique no ✏️ para editar nome do comprador</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button onClick={exportarExcel} className="button button-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Exportar Excel
          </button>
          <button onClick={carregarDevedores} className="button button-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} /> Ver Devedores
          </button>
        </div>

        <div style={{ marginTop: '12px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="🔍 Pesquisar comprador ou equipe..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          {searchTerm && <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{vendasFiltradas.length} de {vendas.length} vendas encontradas</p>}
        </div>
      </div>

      {showDevedores && (
        <div className="modal-overlay" onClick={() => setShowDevedores(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>📋 Devedores Agrupados</h2>
                <button onClick={() => setShowDevedores(false)} className="button button-secondary">Fechar</button>
              </div>
              <div style={{ position: 'relative', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="🔍 Pesquisar por equipe (ex: Sala, Liturgia)..."
                  value={devedoresSearch}
                  onChange={e => setDevedoresSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '14px'
                  }}
                />
                {devedoresSearch && (
                  <button
                    onClick={() => setDevedoresSearch('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {renderDevedoresModal()}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {vendasFiltradas.map(v => (
          <div key={v.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              {editingId === v.id ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={editNome}
                    onChange={e => setEditNome(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && salvarEdicao(v.id)}
                    style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                    autoFocus
                  />
                  <button onClick={() => salvarEdicao(v.id)} disabled={loadingActions[v.id]} className="button button-primary" style={{ padding: '8px 16px' }}>
                    {loadingActions[v.id] ? <Loader2 size={16} /> : 'Salvar'}
                  </button>
                  <button onClick={cancelarEdicao} className="button button-secondary" style={{ padding: '8px 16px' }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <strong>{v.nome_comprador} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>• {v.nome_equipe}</span></strong>
                  <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{new Date(v.created_at).toLocaleString('pt-BR')}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    {v.produtos?.map(p => `${p.nome} (${p.quantidade || 1}x)`).join(', ')}
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>R$ {Number(v.valor_total).toFixed(2)}</div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => toggleStatus(v)} className={`status-pill ${v.status_pagamento === 'Pago' ? 'status-ok' : 'status-pending'}`} style={{ height: 'fit-content' }}><i/>{v.status_pagamento}</button>
              <button onClick={() => iniciarEdicao(v)} className="button button-gold" style={{ padding: '8px 10px' }} title="Editar nome do comprador"><Edit2 size={14} /></button>
              <button onClick={() => excluirVenda(v.id)} className="button button-secondary" style={{ padding: '8px 14px' }}><Trash2 size={14} /> Excluir</button>
            </div>
          </div>
        ))}
        {vendasFiltradas.length === 0 && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)' }}>
            {searchTerm ? `Nenhuma venda encontrada para "${searchTerm}"` : 'Nenhuma venda ainda'}
          </div>
        )}
      </div>
    </div>
  );
}