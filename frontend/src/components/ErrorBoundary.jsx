import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info); }
  handleReset = () => {
    try { localStorage.removeItem('mac_token'); } catch {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/login';
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-6 text-zinc-100">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <h2 className="text-lg font-bold mb-2">Algo deu errado</h2>
            <p className="text-sm text-zinc-400 mb-4">O app encontrou um erro e foi protegido para não ficar em tela preta. Toque em voltar ao login.</p>
            <pre className="text-xs text-left bg-black border border-zinc-800 rounded-lg p-3 overflow-auto max-h-32 mb-4">{String(this.state.error?.message || this.state.error)}</pre>
            <button onClick={this.handleReset} className="w-full bg-[#5C161B] hover:bg-[#7a1d24] text-white font-bold py-3 rounded-xl">Voltar ao login</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
