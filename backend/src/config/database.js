import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => console.log('✅ PostgreSQL conectado'));
pool.on('error', (err) => console.error('❌ Erro no pool PostgreSQL', err));

// Auto-migration on startup
async function runMigrations() {
  const client = await pool.connect();
  try {
    // Add quantidade column to venda_produtos if not exists
    await client.query(`
      ALTER TABLE venda_produtos 
      ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0)
    `);
    console.log('✅ Migration: venda_produtos.quantidade verificada/criada');
  } catch (err) {
    console.error('❌ Erro na migration:', err.message);
  } finally {
    client.release();
  }
}

runMigrations();

export default pool;
