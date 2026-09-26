import pool from '../config/database.js';
import { HttpError } from '../utils/httpError.js';

export const listarProdutos = async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM produtos ORDER BY nome ASC');
  res.json(rows);
};

export const criarProduto = async (req, res) => {
  const { nome, preco, estoque, descricao } = req.body;
  if (!nome || preco == null) throw new HttpError(400, 'nome e preco são obrigatórios');

  const { rows } = await pool.query(
    'INSERT INTO produtos (nome, preco, estoque, descricao) VALUES ($1,$2,$3,$4) RETURNING *',
    [nome, Number(preco), estoque ?? 0, descricao || null]
  );
  res.status(201).json(rows[0]);
};

export const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const { nome, preco, estoque, descricao } = req.body;

  const exists = await pool.query('SELECT id FROM produtos WHERE id=$1', [id]);
  if (!exists.rows.length) throw new HttpError(404, 'Produto não encontrado');

  const { rows } = await pool.query(
    `UPDATE produtos SET nome=COALESCE($1,nome), preco=COALESCE($2,preco),
     estoque=COALESCE($3,estoque), descricao=COALESCE($4,descricao)
     WHERE id=$5 RETURNING *`,
    [nome, preco != null ? Number(preco) : null, estoque, descricao, id]
  );
  res.json(rows[0]);
};

export const removerProduto = async (req, res) => {
  const { id } = req.params;
  
  const { rows: vendasComProduto } = await pool.query(
    'SELECT 1 FROM venda_produtos WHERE produto_id=$1 LIMIT 1', [id]
  );
  if (vendasComProduto.length > 0) {
    throw new HttpError(400, 'Não é possível excluir produto que possui vendas registradas');
  }

  const { rowCount } = await pool.query('DELETE FROM produtos WHERE id=$1', [id]);
  if (!rowCount) throw new HttpError(404, 'Produto não encontrado');
  res.status(204).send();
};
