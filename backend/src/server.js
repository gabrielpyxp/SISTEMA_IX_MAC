import app from './app.js';
import pool from './config/database.js';

const PORT = process.env.PORT || 3000;

// tenta validar conexão ao iniciar
pool.query('SELECT NOW()').then(() => console.log('📦 DB pronto')).catch(e => console.error('DB erro', e.message));

app.listen(PORT, () => {
  console.log(`🔥 Encontro MAC API rodando em http://localhost:${PORT}`);
});
