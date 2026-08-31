import pool from '../config/database.js';

export const getDashboard = async (_req, res) => {
  const totalVendas = await pool.query('SELECT COUNT(*)::int as total FROM vendas');
  const countStatus = await pool.query(`
    SELECT status_pagamento, COUNT(*)::int as qtd FROM vendas GROUP BY status_pagamento
  `);
  const valorTotal = await pool.query('SELECT COALESCE(SUM(valor_total),0) as total FROM vendas');
  const porDia = await pool.query(`
    SELECT TO_CHAR(created_at::date,'YYYY-MM-DD') as dia,
           COUNT(*)::int as qtd,
           COALESCE(SUM(valor_total),0) as valor
    FROM vendas GROUP BY dia ORDER BY dia ASC
  `);
  const ticketMedio = await pool.query('SELECT COALESCE(AVG(valor_total),0) as media FROM vendas');

  const statusMap = { Pago: 0, Devendo: 0 };
  countStatus.rows.forEach(r => { statusMap[r.status_pagamento] = r.qtd; });

  res.json({
    total_vendas: totalVendas.rows[0].total,
    qtd_pago: statusMap.Pago,
    qtd_devendo: statusMap.Devendo,
    valor_total_arrecadado: Number(valorTotal.rows[0].total),
    ticket_medio: Number(ticketMedio.rows[0].media),
    vendas_por_dia: porDia.rows
  });
};
