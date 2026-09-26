#!/usr/bin/env node
/**
 * Script para exportar vendas do banco de dados para Excel
 * Execute: node backend/scripts/export-vendas.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function exportVendas() {
  const client = await pool.connect();
  try {
    console.log('📊 Conectando ao banco de dados...');
    
    // Query completa com todos os detalhes
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
    
    const { rows } = await client.query(query);
    
    if (rows.length === 0) {
      console.log('⚠️ Nenhuma venda encontrada no banco de dados.');
      return;
    }
    
    console.log(`✅ Encontradas ${rows.length} linhas de vendas/produtos`);
    
    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema IX MAC';
    workbook.created = new Date();
    
    // Planilha 1: Vendas Detalhadas (cada linha = um produto de uma venda)
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
    
    // Estilo do cabeçalho
    sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet1.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D3748' }
    };
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
    
    // Planilha 2: Resumo por Venda (uma linha por venda)
    const sheet2 = workbook.addWorksheet('Resumo por Venda');
    
    const vendasUnicas = [...new Map(rows.map(r => [r['ID Venda'], r])).values()];
    
    sheet2.columns = [
      { header: 'ID Venda', key: 'id_venda', width: 12 },
      { header: 'Equipe', key: 'equipe', width: 20 },
      { header: 'Comprador', key: 'comprador', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Valor Total', key: 'valor_total', width: 15, style: { numFmt: 'R$ #,##0.00' } },
      { header: 'Data Venda', key: 'data_venda', width: 22 },
      { header: 'Produtos', key: 'produtos', width: 50 }
    ];
    
    sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet2.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D3748' }
    };
    
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
    
    // Planilha 3: Devedores Agrupados (Dividendos)
    const sheet3 = workbook.addWorksheet('Devedores (Agrupado)');
    
    const devedoresMap = new Map();
    
    for (const row of rows) {
      if (row['Status'] === 'Devendo' && row['Comprador']) {
        const key = row['Comprador'].toLowerCase().trim();
        if (!devedoresMap.has(key)) {
          devedoresMap.set(key, {
            comprador: row['Comprador'],
            total_devendo: 0,
            vendas_count: 0,
            detalhes: []
          });
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
    sheet3.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D3748' }
    };
    
    // Ordenar por maior devedor
    const devedoresOrdenados = [...devedoresMap.values()].sort((a, b) => b.total_devendo - a.total_devendo);
    
    for (const devedor of devedoresOrdenados) {
      const detalhesStr = devedor.detalhes.map(d => 
        `Venda #${d.id_venda} (${new Date(d.data).toLocaleDateString('pt-BR')}): R$ ${Number(d.valor).toFixed(2)} - ${d.produtos}`
      ).join('; ');
      
      sheet3.addRow({
        comprador: devedor.comprador,
        total_devendo: devedor.total_devendo,
        vendas_count: devedor.vendas_count,
        detalhes: detalhesStr
      });
    }
    
    // Planilha 4: Produtos Vendidos (Resumo)
    const sheet4 = workbook.addWorksheet('Produtos Vendidos');
    
    const produtosMap = new Map();
    
    for (const row of rows) {
      if (row['Produto']) {
        const key = row['ID Produto'];
        if (!produtosMap.has(key)) {
          produtosMap.set(key, {
            produto: row['Produto'],
            total_vendido: 0,
            quantidade_total: 0,
            receita_total: 0
          });
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
    sheet4.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D3748' }
    };
    
    const produtosOrdenados = [...produtosMap.values()].sort((a, b) => b.quantidade_total - a.quantidade_total);
    
    for (const prod of produtosOrdenados) {
      sheet4.addRow(prod);
    }
    
    // Ajustar largura das colunas automaticamente
    [sheet1, sheet2, sheet3, sheet4].forEach(sheet => {
      sheet.columns.forEach(col => {
        let maxLength = col.header.length;
        col.eachCell({ includeEmpty: true }, cell => {
          if (cell.value) {
            maxLength = Math.max(maxLength, String(cell.value).length);
          }
        });
        col.width = Math.min(maxLength + 5, 60);
      });
    });
    
    // Salvar arquivo
    const desktopPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop');
    const fileName = `mac_vendas_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filePath = path.join(desktopPath, fileName);
    
    await workbook.xlsx.writeFile(filePath);
    
    console.log(`✅ Arquivo salvo em: ${filePath}`);
    console.log(`📋 Planilhas criadas:`);
    console.log(`   1. Vendas Detalhadas (${rows.length} linhas)`);
    console.log(`   2. Resumo por Venda (${vendasUnicas.length} vendas)`);
    console.log(`   3. Devedores Agrupados (${devedoresOrdenados.length} devedores)`);
    console.log(`   4. Produtos Vendidos (${produtosOrdenados.length} produtos)`);
    
  } catch (error) {
    console.error('❌ Erro ao exportar:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

exportVendas();