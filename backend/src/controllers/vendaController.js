import pool from '../config/database.js';
import { HttpError } from '../utils/httpError.js';

export const listarVendas = async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT v.id, v.nome_equipe, v.nome_comprador, v.status_pagamento, v.valor_total, v.created_at,
           COALESCE(json_agg(json_build_object('id',p.id,'nome',p.nome,'preco',p.preco) ) FILTER (WHERE p.id IS NOT NULL), '[]') as produtos
    FROM vendas v
    LEFT JOIN venda_produtos vp ON vp.venda_id = v.id
    LEFT JOIN produtos p ON p.id = vp.produto_id
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `);
  res.json(rows);
};

export const criarVenda = async (req, res) => {
  const { nome_equipe, nome_comprador, produtos_ids, status_pagamento } = req.body;

  if (!nome_equipe || !nome_comprador || !Array.isArray(produtos_ids) || produtos_ids.length === 0) {
    throw new HttpError(400, 'nome_equipe, nome_comprador e produtos_ids[] são obrigatórios');
  }
  if (status_pagamento && !['Pago', 'Devendo'].includes(status_pagamento)) {
    throw new HttpError(400, 'status_pagamento deve ser Pago ou Devendo');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: produtos } = await client.query(
      `SELECT id, preco FROM produtos WHERE id = ANY($1)`, [produtos_ids]
    );
    if (produtos.length !== produtos_ids.length) throw new HttpError(400, 'Um ou mais produtos não encontrados');

    const valorTotal = produtos.reduce((acc, p) => acc + Number(p.preco), 0);

    const { rows: vendaRows } = await client.query(
      `INSERT INTO vendas (nome_equipe, nome_comprador, status_pagamento, valor_total)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nome_equipe, nome_comprador, status_pagamento || 'Devendo', valorTotal]
    );
    const venda = vendaRows[0];

    for (const pid of produtos_ids) {
      await client.query('INSERT INTO venda_produtos (venda_id, produto_id) VALUES ($1,$2)', [venda.id, pid]);
    }

    await client.query('COMMIT');

    // retorna com produtos
    const { rows } = await pool.query(`
      SELECT v.*, COALESCE(json_agg(p.*) FILTER (WHERE p.id IS NOT NULL),'[]') as produtos
      FROM vendas v
      LEFT JOIN venda_produtos vp ON vp.venda_id=v.id
      LEFT JOIN produtos p ON p.id=vp.produto_id
      WHERE v.id=$1 GROUP BY v.id`, [venda.id]);

    res.status(201).json(rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const atualizarStatusVenda = async (req, res) => {
  const { id } = req.params;
  const { status_pagamento } = req.body;

  if (!['Pago', 'Devendo'].includes(status_pagamento)) {
    throw new HttpError(400, 'status_pagamento deve ser Pago ou Devendo');
  }

  const { rows } = await pool.query(
    'UPDATE vendas SET status_pagamento=$1 WHERE id=$2 RETURNING *',
    [status_pagamento, id]
  );
  if (!rows.length) throw new HttpError(404, 'Venda não encontrada');
  res.json(rows[0]);
};
