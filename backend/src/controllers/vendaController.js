import pool from '../config/database.js';
import { HttpError } from '../utils/httpError.js';
import ExcelJS from 'exceljs';

export const listarVendas = async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT v.id, v.nome_equipe, v.nome_comprador, v.status_pagamento, v.valor_total, v.created_at,
           COALESCE(json_agg(
             json_build_object(
               'id', p.id,
               'nome', p.nome,
               'preco', p.preco,
               'quantidade', vp.quantidade
             )
           ) FILTER (WHERE p.id IS NOT NULL), '[]') as produtos
    FROM vendas v
    LEFT JOIN venda_produtos vp ON vp.venda_id = v.id
    LEFT JOIN produtos p ON p.id = vp.produto_id
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `);
  res.json(rows);
};

export const criarVenda = async (req, res) => {
  const { nome_equipe, nome_comprador, produtos, status_pagamento } = req.body;

  if (!nome_equipe || !nome_comprador || !Array.isArray(produtos) || produtos.length === 0) {
    throw new HttpError(400, 'nome_equipe, nome_comprador e produtos[] são obrigatórios');
  }
  if (status_pagamento && !['Pago', 'Devendo'].includes(status_pagamento)) {
    throw new HttpError(400, 'status_pagamento deve ser Pago ou Devendo');
  }

  // Validar cada produto tem id e quantidade
  for (const prod of produtos) {
    if (!prod.id || !prod.quantidade || prod.quantidade < 1) {
      throw new HttpError(400, 'Cada produto deve ter id e quantidade (mínimo 1)');
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const produtosIds = produtos.map(p => p.id);
    const { rows: produtosDb } = await client.query(
      `SELECT id, preco, estoque FROM produtos WHERE id = ANY($1)`, [produtosIds]
    );
    if (produtosDb.length !== produtosIds.length) throw new HttpError(400, 'Um ou mais produtos não encontrados');

    // Verificar estoque
    for (const prod of produtos) {
      const prodDb = produtosDb.find(p => p.id === prod.id);
      if (prodDb.estoque < prod.quantidade) {
        throw new HttpError(400, `Estoque insuficiente para ${prodDb.nome}. Disponível: ${prodDb.estoque}`);
      }
    }

    const valorTotal = produtos.reduce((acc, prod) => {
      const prodDb = produtosDb.find(p => p.id === prod.id);
      return acc + (Number(prodDb.preco) * prod.quantidade);
    }, 0);

    const { rows: vendaRows } = await client.query(
      `INSERT INTO vendas (nome_equipe, nome_comprador, status_pagamento, valor_total)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nome_equipe, nome_comprador, status_pagamento || 'Devendo', valorTotal]
    );
    const venda = vendaRows[0];

    for (const prod of produtos) {
      await client.query(
        'INSERT INTO venda_produtos (venda_id, produto_id, quantidade) VALUES ($1,$2,$3)',
        [venda.id, prod.id, prod.quantidade]
      );
      
      // Atualizar estoque
      await client.query(
        'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
        [prod.quantidade, prod.id]
      );
    }

    await client.query('COMMIT');

    // retorna com produtos
    const { rows } = await pool.query(`
      SELECT v.*, COALESCE(json_agg(
        json_build_object(
          'id', p.id,
          'nome', p.nome,
          'preco', p.preco,
          'quantidade', vp.quantidade
        )
      ) FILTER (WHERE p.id IS NOT NULL), '[]') as produtos
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

export const excluirVenda = async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Buscar produtos da venda para restaurar estoque
    const { rows: itensVenda } = await client.query(
      'SELECT produto_id, quantidade FROM venda_produtos WHERE venda_id = $1',
      [id]
    );
    
    // Restaurar estoque
    for (const item of itensVenda) {
      await client.query(
        'UPDATE produtos SET estoque = estoque + $1 WHERE id = $2',
        [item.quantidade, item.produto_id]
      );
    }
    
    // Excluir venda (cascade exclui venda_produtos)
    const { rowCount } = await client.query('DELETE FROM vendas WHERE id=$1', [id]);
    if (!rowCount) throw new HttpError(404, 'Venda não encontrada');
    
    await client.query('COMMIT');
    res.status(204).send();
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const exportarVendasExcel = async (_req, res) => {
  try {
    const query = `
      SELECT 
        v.id as "ID Venda",
        v.nome_equipe as "Equipe",
        v.nome_comprador as "Comprador",
        v.status_pagamento as "Status",
        v.valor_total as "Valor Total",
        v.created_at as "Data Venda",
        p.id as "ID Produto",
        p.nome as "Produto",
        p.preco as "Preço Unitário",
        vp.quantidade as "Quantidade",
        (p.preco * vp.quantidade) as "Subtotal"
      FROM vendas v
      LEFT JOIN venda_produtos vp ON vp.venda_id = v.id
      LEFT JOIN produtos p ON p.id = vp.produto_id
      ORDER BY v.created_at DESC, v.id, p.nome
    `;
    
    const { rows } = await pool.query(query);
    
    if (rows.length === 0) {
      throw new HttpError(404, 'Nenhuma venda encontrada para exportar');
    }
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema IX MAC';
    workbook.created = new Date();
    
    // Planilha 1: Vendas Detalhadas
    const sheet1 = workbook.addWorksheet('Vendas Detalhadas');
    sheet1.columns = [
      { header: 'ID Venda', key: 'id_venda', width: 12 },
      { header: 'Equipe', key: 'equipe', width: 20 },
      { header: 'Comprador', key: 'comprador', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Valor Total', key: 'valor_total', width: 15, style: { numFmt: 'R$ #,##0.00' } },
      { header: 'Data Venda', key: 'data_venda', width: 22 },
      { header: 'ID Produto', key: 'id_produto', width: 12 },
      { header: 'Produto', key: 'produto', width: 25 },
      { header: 'Preço Unitário', key: 'preco_unitario', width: 18, style: { numFmt: 'R$ #,##0.00' } },
      { header: 'Quantidade', key: 'quantidade', width: 12 },
      { header: 'Subtotal', key: 'subtotal', width: 15, style: { numFmt: 'R$ #,##0.00' } }
    ];
    sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D3748' } };
    sheet1.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    rows.forEach(row => {
      sheet1.addRow({
        id_venda: row['ID Venda'],
        equipe: row['Equipe'],
        comprador: row['Comprador'],
        status: row['Status'],
        valor_total: row['Valor Total'],
        data_venda: row['Data Venda'] ? new Date(row['Data Venda']).toLocaleString('pt-BR') : '',
        id_produto: row['ID Produto'] || '',
        produto: row['Produto'] || '',
        preco_unitario: row['Preço Unitário'] || 0,
        quantidade: row['Quantidade'] || 0,
        subtotal: row['Subtotal'] || 0
      });
    });
    
    // Planilha 2: Resumo por Venda
    const sheet2 = workbook.addWorksheet('Resumo por Venda');
    const vendasUnicas = [...new Map(rows.map(r => [r['ID Venda'], r])).values()];
    sheet2.columns = [
      { header: 'ID Venda', key: 'id_venda', width: 12 },
      { header: 'Equipe', key: 'equipe', width: 20 },
      { header: 'Comprador', key: 'comprador', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Valor Total', key: 'valor_total', width: 15, style: { numFmt: 'R$ #,##0.00' } },
      { header: 'Data Venda', key: 'data_venda', width: 22 },
      { header: 'Produtos', key: 'produtos', width: 60 }
    ];
    sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D3748' } };
    
    for (const venda of vendasUnicas) {
      const produtosVenda = rows.filter(r => r['ID Venda'] === venda['ID Venda'] && r['Produto']);
      const produtosStr = produtosVenda.map(p => 
        `${p['Produto']} (${p['Quantidade']}x R$ ${Number(p['Preço Unitário']).toFixed(2)})`
      ).join('; ');
      sheet2.addRow({
        id_venda: venda['ID Venda'],
        equipe: venda['Equipe'],
        comprador: venda['Comprador'],
        status: venda['Status'],
        valor_total: venda['Valor Total'],
        data_venda: venda['Data Venda'] ? new Date(venda['Data Venda']).toLocaleString('pt-BR') : '',
        produtos: produtosStr
      });
    }
    
    // Planilha 3: Devedores Agrupados
    const sheet3 = workbook.addWorksheet('Devedores (Agrupado)');
    const devedoresMap = new Map();
    for (const row of rows) {
      if (row['Status'] === 'Devendo' && row['Comprador']) {
        const key = row['Comprador'].toLowerCase().trim();
        if (!devedoresMap.has(key)) {
          devedoresMap.set(key, { comprador: row['Comprador'], total_devendo: 0, vendas_count: 0, detalhes: [] });
        }
        const devedor = devedoresMap.get(key);
        devedor.total_devendo += Number(row['Valor Total'] || 0);
        devedor.vendas_count += 1;
        devedor.detalhes.push({
          id_venda: row['ID Venda'],
          data: row['Data Venda'],
          valor: row['Valor Total'],
          produtos: row['Produto'] ? `${row['Produto']} (${row['Quantidade']}x)` : ''
        });
      }
    }
    sheet3.columns = [
      { header: 'Comprador', key: 'comprador', width: 30 },
      { header: 'Total Devendo', key: 'total_devendo', width: 18, style: { numFmt: 'R$ #,##0.00' } },
      { header: 'Qtd Vendas', key: 'vendas_count', width: 12 },
      { header: 'Detalhes das Vendas', key: 'detalhes', width: 60 }
    ];
    sheet3.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D3748' } };
    const devedoresOrdenados = [...devedoresMap.values()].sort((a, b) => b.total_devendo - a.total_devendo);
    for (const devedor of devedoresOrdenados) {
      const detalhesStr = devedor.detalhes.map(d => 
        `Venda #${d.id_venda} (${new Date(d.data).toLocaleDateString('pt-BR')}): R$ ${Number(d.valor).toFixed(2)} - ${d.produtos}`
      ).join('; ');
      sheet3.addRow({ comprador: devedor.comprador, total_devendo: devedor.total_devendo, vendas_count: devedor.vendas_count, detalhes: detalhesStr });
    }
    
    // Planilha 4: Produtos Vendidos
    const sheet4 = workbook.addWorksheet('Produtos Vendidos');
    const produtosMap = new Map();
    for (const row of rows) {
      if (row['Produto']) {
        const key = row['ID Produto'];
        if (!produtosMap.has(key)) {
          produtosMap.set(key, { produto: row['Produto'], total_vendido: 0, quantidade_total: 0, receita_total: 0 });
        }
        const prod = produtosMap.get(key);
        prod.quantidade_total += Number(row['Quantidade'] || 0);
        prod.receita_total += Number(row['Subtotal'] || 0);
        prod.total_vendido += 1;
      }
    }
    sheet4.columns = [
      { header: 'Produto', key: 'produto', width: 30 },
      { header: 'Quantidade Total', key: 'quantidade_total', width: 18 },
      { header: 'Vendas', key: 'total_vendido', width: 12 },
      { header: 'Receita Total', key: 'receita_total', width: 18, style: { numFmt: 'R$ #,##0.00' } }
    ];
    sheet4.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet4.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D3748' } };
    const produtosOrdenados = [...produtosMap.values()].sort((a, b) => b.quantidade_total - a.quantidade_total);
    for (const prod of produtosOrdenados) { sheet4.addRow(prod); }
    
    [sheet1, sheet2, sheet3, sheet4].forEach(sheet => {
      sheet.columns.forEach(col => {
        let maxLength = col.header.length;
        col.eachCell({ includeEmpty: true }, cell => {
          if (cell.value) maxLength = Math.max(maxLength, String(cell.value).length);
        });
        col.width = Math.min(maxLength + 5, 60);
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="mac_vendas_${new Date().toISOString().split('T')[0]}.xlsx"`);
    await workbook.xlsx.write(res);
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(500, 'Erro ao gerar Excel');
  }
};

export const listarDevedoresAgrupados = async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT 
      v.nome_comprador,
      SUM(v.valor_total) as total_devendo,
      COUNT(v.id) as qtd_vendas,
      json_agg(
        json_build_object(
          'id', v.id,
          'data', v.created_at,
          'valor', v.valor_total,
          'produtos', (
            SELECT json_agg(json_build_object('nome', p.nome, 'quantidade', vp.quantidade, 'preco', p.preco))
            FROM venda_produtos vp
            JOIN produtos p ON p.id = vp.produto_id
            WHERE vp.venda_id = v.id
          )
        )
      ) as vendas
    FROM vendas v
    WHERE v.status_pagamento = 'Devendo'
    GROUP BY v.nome_comprador
    ORDER BY total_devendo DESC
  `);
  
  const devedores = rows.map(row => ({
    comprador: row.nome_comprador,
    total_devendo: Number(row.total_devendo),
    qtd_vendas: Number(row.qtd_vendas),
    vendas: row.vendas || []
  }));
  
  res.json(devedores);
};
