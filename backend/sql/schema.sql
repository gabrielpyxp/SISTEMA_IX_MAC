-- ==========================================
-- Encontro MAC - Minimercado Igreja
-- Banco: PostgreSQL (Neon)
-- Execute este script no SQL Editor do Neon
-- ==========================================

-- Limpeza (opcional, descomente se precisar resetar)
-- DROP TABLE IF EXISTS venda_produtos CASCADE;
-- DROP TABLE IF EXISTS vendas CASCADE;
-- DROP TABLE IF EXISTS produtos CASCADE;
-- DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. USUARIOS (equipe do evento, login simples)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  estoque INTEGER DEFAULT 0 CHECK (estoque >= 0),
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. VENDAS
CREATE TABLE IF NOT EXISTS vendas (
  id SERIAL PRIMARY KEY,
  nome_equipe VARCHAR(100) NOT NULL,
  nome_comprador VARCHAR(100) NOT NULL,
  status_pagamento VARCHAR(20) NOT NULL DEFAULT 'Devendo' CHECK (status_pagamento IN ('Pago','Devendo')),
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. VENDA_PRODUTOS (N:N)
CREATE TABLE IF NOT EXISTS venda_produtos (
  id SERIAL PRIMARY KEY,
  venda_id INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_vendas_created ON vendas(created_at);
CREATE INDEX IF NOT EXISTS idx_venda_produtos_venda ON venda_produtos(venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_produtos_produto ON venda_produtos(produto_id);

-- Trigger para updated_at em produtos
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_produtos_updated ON produtos;
CREATE TRIGGER trg_produtos_updated BEFORE UPDATE ON produtos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seeds iniciais --------------------------------
INSERT INTO usuarios (nome, email, senha_hash)
VALUES ('Equipe MAC', 'equipe@encontromac.com', '$2a$10$DUMMYHASH.USE_BCRYPT_TO_GENERATE')
ON CONFLICT (email) DO NOTHING;

-- Para gerar hash real, use no backend: bcrypt.hash('mac123', 10)
-- Exemplo já hasheado para senha 'mac123':
-- $2a$10$abcdefghijklmnopqrstuuABCDEFGHIJ1234567890 -> substitua

INSERT INTO produtos (nome, preco, estoque, descricao) VALUES
('Água 500ml', 3.00, 100, 'Água mineral'),
('Refrigerante Lata', 5.00, 80, 'Coca / Guaraná'),
('Salgado', 6.00, 60, 'Coxinha / Pastel'),
('Doce', 4.00, 50, 'Brigadeiro / Cajuzinho'),
('Kit Lanche', 12.00, 40, 'Salgado + Refri')
ON CONFLICT DO NOTHING;
