-- Migration: Add quantidade column to venda_produtos
-- Execute this in Neon SQL Editor

ALTER TABLE venda_produtos 
ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0);

-- Update existing records to have quantidade = 1 (already default)
-- No need to update as DEFAULT 1 handles it

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_venda_produtos_quantidade ON venda_produtos(quantidade);