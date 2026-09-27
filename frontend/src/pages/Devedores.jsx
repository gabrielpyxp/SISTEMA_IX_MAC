import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { CheckCircle2, Loader2, Search, X, Users, Wallet, DollarSign } from 'lucide-react';

export default function Devedores() {
  const [devedores, setDevedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchComprador, setSearchComprador] = useState('');
  const [searchEquipe, setSearchEquipe] = useState('');
  const [loadingActions, setLoadingActions] = useState({});
  const [stats, setStats] = useState({ totalDevedores: 0, totalDivida: 0, totalVendas: 0 });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vendas/devedores');
      setDevedores(data);
      const totalDivida = data.reduce((sum, d) => sum + d.total_devendo, 0);
      const totalVendas = data.reduce((sum, d) => sum + d.qtd_vendas, 0);
      setStats({ totalDevedores: data.length, totalDivida, totalVendas });
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao carregar devedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
      // Pequeno delay para garantir que o commit no banco terminou
      setTimeout(() => load(), 300);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao marcar como pagas';
      // Se não encontrou dívidas, é porque já pagou tudo - não é erro
      if (msg.includes('Nenhuma dívida encontrada') || msg.includes('404')) {
        alert('ℹ️ Essa pessoa/equipe já não tem mais dívidas pendentes.');
        load(); // Atualiza a lista para remover da tela
      } else {
        alert(msg);
      }
    } finally {
      setLoadingActions(prev => ({ ...prev, [loadKey]: false }));
    }
  };

  const devedoresFiltrados = devedores.filter(d => {
    const matchComprador = !searchComprador || d.comprador.toLowerCase().includes(searchComprador.toLowerCase());
    const matchEquipe = !searchEquipe || (d.equipe && d.equipe.toLowerCase().includes(searchEquipe.toLowerCase()));
    return matchComprador && matchEquipe;
  });

  const equipesUnicas = [...new Set(devedores.map(d => d.equipe).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="page">
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div className="animate-spin" style={{ color: 'var(--yellow)', marginBottom: '12px', display: 'inline-block' }}>
            <Loader2 size={32} style={{ color: 'var(--yellow)' }} />
          </div>
          <p style={{ color: 'var(--text-dim)' }}>Carregando devedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Financeiro</span>
          <h1>Devedores Agrupados</h1>
          <p>Visualize e gerencie dívidas agrupadas por comprador e equipe</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--yellow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(250,204,21,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} style={{ color: 'var(--yellow)' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Devedores</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>{stats.totalDevedores}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} style={{ color: 'var(--danger)' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Devendo</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--danger)' }}>R$ {Number(stats.totalDivida).toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={24} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendas Pendentes</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)' }}>{stats.totalVendas}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Search Comprador */}
            <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
              <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="🔍 Comprador (ex: Gabriel, Maria)..."
                value={searchComprador}
                onChange={e => setSearchComprador(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '15px'
                }}
              />
              {searchComprador && (
                <button
                  onClick={() => setSearchComprador('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Search Equipe */}
            <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
              <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="🔍 Equipe (ex: Mini Mercado, Sala, Liturgia)..."
                value={searchEquipe}
                onChange={e => setSearchEquipe(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '15px'
                }}
              />
              {searchEquipe && (
                <button
                  onClick={() => setSearchEquipe('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Result count + Quick filter buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {(searchComprador || searchEquipe) && (
              <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                {devedoresFiltrados.length} de {devedores.length} devedores
              </span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {equipesUnicas.slice(0, 8).map(equipe => (
                <button
                  key={equipe}
                  onClick={() => setSearchEquipe(equipe)}
                  className={`button ${searchEquipe.toLowerCase() === equipe.toLowerCase() ? 'button-primary' : 'button-secondary'}`}
                  style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
                >
                  {equipe}
                </button>
              ))}
              {equipesUnicas.length > 8 && (
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: 'var(--text-dim)', fontSize: '12px' }}>
                  +{equipesUnicas.length - 8} mais
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {devedores.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)' }}>
          <Users size={48} style={{ color: 'var(--text-dim)', marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--text)' }}>Nenhum devedor no momento</h3>
          <p>Todas as vendas estão pagas! 🎉</p>
        </div>
      ) : devedoresFiltrados.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)' }}>
          <Search size={48} style={{ color: 'var(--text-dim)', marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--text)' }}>Nenhum devedor encontrado</h3>
          <p>Tente outro nome ou equipe, ou limpe a pesquisa</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
            <button onClick={() => { setSearchComprador(''); setSearchEquipe(''); }} className="button button-secondary">
              Limpar tudo
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {devedoresFiltrados.map(d => (
            <div key={`${d.comprador}-${d.equipe || 'sem-equipe'}`} className="card" style={{ padding: '20px', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '18px' }}>{d.comprador}</strong>
                    {d.equipe && (
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--yellow)', background: 'rgba(250,204,21,0.1)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(250,204,21,0.3)' }}>
                        👥 {d.equipe}
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                    {d.qtd_vendas} venda(s) pendente(s)
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Total Devendo
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '24px' }}>
                      R$ {Number(d.total_devendo).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => marcarTodasPagas(d)}
                    disabled={loadingActions[`marcar-${d.comprador}-${d.equipe || ''}`]}
                    className="button button-success"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}
                  >
                    {loadingActions[`marcar-${d.comprador}-${d.equipe || ''}`] ? <Loader2 size={18} /> : <CheckCircle2 size={18} />}
                    Marcar Tudo Pago
                  </button>
                </div>
              </div>

              <details style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <summary style={{ cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <span>Ver detalhes das {d.qtd_vendas} venda(s)</span>
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingLeft: '8px', borderLeft: '2px solid var(--border)' }}>
                  {d.vendas.map(v => (
                    <div key={v.id} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>Venda #{v.id}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{new Date(v.data).toLocaleString('pt-BR')}</span>
                          {v.equipe && (
                            <span style={{ fontSize: '11px', color: 'var(--yellow)', background: 'rgba(250,204,21,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                              {v.equipe}
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '15px' }}>
                          R$ {Number(v.valor).toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {v.produtos?.map(p => `${p.nome} (${p.quantidade}x R$ ${Number(p.preco).toFixed(2)})`).join('  •  ')}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}