import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/temp/' });

// 1. IMPORTAR CSV (Atualiza Preços em Massa)
router.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo obrigatório' });

  const results: any[] = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let updated = 0;
      let created = 0;
      
      // Esperado CSV: sku, nome, preco, categoria
      for (const row of results) {
        if (row.sku && row.nome) {
          try {
            // Buscar item existente
            const existing = await prisma.inventoryItem.findFirst({
              where: { 
                OR: [
                  { sku: row.sku },
                  { name: row.nome }
                ]
              }
            });

            if (existing) {
              // Atualizar
              await prisma.inventoryItem.update({
                where: { id: existing.id },
                data: { 
                  lastPrice: parseFloat(row.preco) || 0,
                  lastUpdated: new Date()
                }
              });
              updated++;
            } else {
              // Criar novo
              await prisma.inventoryItem.create({
                data: { 
                  sku: row.sku,
                  name: row.nome, 
                  category: row.categoria || 'PEDAGOGICO', 
                  quantity: 0, 
                  lastPrice: parseFloat(row.preco) || 0,
                  schoolId: row.schoolId || 'default-school-id'
                }
              });
              created++;
            }
          } catch (error) {
            console.error('Erro ao processar linha:', row, error);
          }
        }
      }

      // Limpa arquivo temporário
      fs.unlinkSync(req.file!.path);
      
      res.json({ 
        success: true,
        message: `Processamento concluído. ${updated} itens atualizados, ${created} novos itens criados.`,
        updated,
        created
      });
    })
    .on('error', (error) => {
      fs.unlinkSync(req.file!.path);
      res.status(500).json({ error: 'Erro ao processar CSV', details: error.message });
    });
});

// 2. EXPORTAR PEDIDO (Gera Excel)
router.post('/export-order', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Nenhum item fornecido' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pedido de Compra');
    
    // Configurar colunas
    sheet.columns = [
      { header: 'Item', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 12 },
      { header: 'Qtd', key: 'qtd', width: 10 },
      { header: 'Categoria', key: 'cat', width: 15 },
      { header: 'Preço Unit.', key: 'price', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    // Estilizar cabeçalho
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    let totalGeral = 0;

    // Busca detalhes no banco
    for (const itemRequest of items) {
      const product = await prisma.inventoryItem.findUnique({ 
        where: { id: itemRequest.id }
      });

      if (product) {
        const preco = Number(product.lastPrice) || 0;
        const total = preco * itemRequest.quantity;
        totalGeral += total;

        sheet.addRow({
          name: product.name,
          sku: product.sku || '-',
          qtd: itemRequest.quantity,
          cat: product.category,
          price: preco.toFixed(2),
          total: total.toFixed(2)
        });
      }
    }

    // Adiciona linha em branco e total
    sheet.addRow({});
    const totalRow = sheet.addRow({
      name: 'TOTAL GERAL',
      sku: '',
      qtd: '',
      cat: '',
      price: '',
      total: totalGeral.toFixed(2)
    });

    // Estilizar linha de total
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB9C' }
    };

    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Pedido_Compra.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao exportar pedido:', error);
    res.status(500).json({ error: 'Erro ao gerar pedido' });
  }
});

// 3. LISTAR PEDIDOS
router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.procurementOrder.findMany({
      include: { items: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
});

// 4. CRIAR PEDIDO
router.post('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, items } = req.body;

    if (!schoolId || !items || items.length === 0) {
      return res.status(400).json({ error: 'schoolId e items são obrigatórios' });
    }

    const order = await prisma.procurementOrder.create({
      data: {
        schoolId,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: true }
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// 5. LISTAR ITENS PARA COMPRA
router.get('/items', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    const items = await prisma.inventoryItem.findMany({
      where: schoolId ? { schoolId: schoolId as string } : {},
      orderBy: { category: 'asc' }
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar itens' });
  }
});

export default router;
