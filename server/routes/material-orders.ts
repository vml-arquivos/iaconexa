import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import ExcelJS from 'exceljs';

const router = Router();
const prisma = new PrismaClient();

// Configurar upload
const uploadDir = path.join(process.cwd(), 'uploads', 'suppliers');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/xml', 'text/xml', 'text/plain'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos XML são permitidos'));
    }
  }
});

// ========== LISTAR TURMAS ==========
router.get('/classes', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    const classes = await prisma.class.findMany({
      where: { schoolId: schoolId as string },
      include: {
        materialList: {
          include: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar turmas' });
  }
});

// ========== CRIAR TURMA ==========
router.post('/classes', async (req: Request, res: Response) => {
  try {
    const { name, level, year, schoolId } = req.body;

    if (!name || !level || !schoolId) {
      return res.status(400).json({ error: 'Nome, nível e schoolId são obrigatórios' });
    }

    const classData = await prisma.class.create({
      data: {
        name,
        level,
        year: year || new Date().getFullYear(),
        schoolId
      }
    });

    res.status(201).json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
});

// ========== OBTER LISTA DE MATERIAIS DA TURMA ==========
router.get('/classes/:classId/materials', async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    let materialList = await prisma.materialList.findUnique({
      where: { classId },
      include: { items: true }
    });

    // Se não existir, criar uma vazia
    if (!materialList) {
      const classData = await prisma.class.findUnique({
        where: { id: classId }
      });

      if (!classData) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      materialList = await prisma.materialList.create({
        data: {
          classId,
          schoolId: classData.schoolId
        },
        include: { items: true }
      });
    }

    res.json(materialList);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter lista de materiais' });
  }
});

// ========== ADICIONAR ITEM À LISTA DE MATERIAIS ==========
router.post('/classes/:classId/materials/items', async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { name, category, quantity, unit, description } = req.body;

    if (!name || !category || !quantity) {
      return res.status(400).json({ error: 'Nome, categoria e quantidade são obrigatórios' });
    }

    // Obter ou criar lista de materiais
    let materialList = await prisma.materialList.findUnique({
      where: { classId }
    });

    if (!materialList) {
      const classData = await prisma.class.findUnique({
        where: { id: classId }
      });

      materialList = await prisma.materialList.create({
        data: {
          classId,
          schoolId: classData!.schoolId
        }
      });
    }

    // Adicionar item
    const item = await prisma.materialListItem.create({
      data: {
        name,
        category,
        quantity,
        unit: unit || 'un',
        description,
        listId: materialList.id
      }
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// ========== DELETAR ITEM DA LISTA ==========
router.delete('/materials/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    await prisma.materialListItem.delete({
      where: { id: itemId }
    });

    res.json({ success: true, message: 'Item deletado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar item' });
  }
});

// ========== LISTAR FORNECEDORES ==========
router.get('/suppliers', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    const suppliers = await prisma.supplier.findMany({
      where: { schoolId: schoolId as string },
      include: {
        products: true,
        priceLists: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar fornecedores' });
  }
});

// ========== CRIAR FORNECEDOR ==========
router.post('/suppliers', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, website, address, city, state, zipCode, contactPerson, contactEmail, contactPhone, schoolId } = req.body;

    if (!name || !schoolId) {
      return res.status(400).json({ error: 'Nome e schoolId são obrigatórios' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        website,
        address,
        state,
        zipCode,
        contactPerson,
        contactEmail,
        contactPhone,
        schoolId
      }
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar fornecedor' });
  }
});

// ========== IMPORTAR TABELA DE PREÇOS (XML) ==========
router.post('/suppliers/:supplierId/import-prices', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const { name } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo XML não fornecido' });
    }

    // Ler e parsear XML
    const xmlContent = fs.readFileSync(req.file.path, 'utf-8');
    const jsonData = await parseStringPromise(xmlContent);

    // Extrair produtos do XML (estrutura esperada: <products><product>...)
    const products = jsonData.products?.product || [];
    let createdCount = 0;

    for (const product of products) {
      const sku = product.sku?.[0];
      const productName = product.name?.[0];
      const price = product.price?.[0];
      const category = product.category?.[0] || 'PEDAGOGICO';

      if (sku && productName && price) {
        // Upsert do produto
        await prisma.supplierProduct.upsert({
          where: {
            supplierId_sku: {
              supplierId,
              sku
            }
          },
          update: {
            price: parseFloat(price),
            name: productName,
            category
          },
          create: {
            sku,
            name: productName,
            price: parseFloat(price),
            category,
            supplierId
          }
        });

        createdCount++;
      }
    }

    // Criar registro de tabela de preços
    const priceList = await prisma.supplierPriceList.create({
      data: {
        name: name || `Tabela ${new Date().toLocaleDateString()}`,
        xmlData: jsonData,
        supplierId,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
      }
    });

    // Limpar arquivo temporário
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `${createdCount} produtos importados`,
      priceList
    });
  } catch (error) {
    console.error('Erro ao importar XML:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Erro ao importar tabela de preços' });
  }
});

// ========== LISTAR PRODUTOS DO FORNECEDOR ==========
router.get('/suppliers/:supplierId/products', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const { category } = req.query;

    const products = await prisma.supplierProduct.findMany({
      where: {
        supplierId,
        ...(category && { category: category as string })
      },
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// ========== CRIAR PEDIDO DE COMPRA ==========
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const { classId, schoolId, supplierId, supplierName, items, notes } = req.body;

    if (!schoolId || !items || items.length === 0) {
      return res.status(400).json({ error: 'schoolId e items são obrigatórios' });
    }

    // Calcular total
    let totalValue = 0;
    const processedItems = items.map((item: any) => {
      const subtotal = item.quantity * item.unitPrice;
      totalValue += subtotal;
      return {
        sku: item.sku,
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        subtotal,
        unit: item.unit || 'un'
      };
    });

    // Gerar número do pedido
    const orderNumber = `PED-${Date.now()}`;

    const order = await prisma.procurementOrder.create({
      data: {
        orderNumber,
        classId: classId || null,
        schoolId,
        supplierName: supplierName || 'Não especificado',
        status: 'DRAFT',
        totalValue,
        notes,
        items: {
          create: processedItems
        }
      },
      include: { items: true }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// ========== GERAR PLANILHA DE COMPRA ==========
router.post('/orders/:orderId/generate-sheet', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.procurementOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pedido de Compra');

    // Cabeçalho
    sheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Produto', key: 'itemName', width: 35 },
      { header: 'Categoria', key: 'category', width: 15 },
      { header: 'Quantidade', key: 'quantity', width: 12 },
      { header: 'Unidade', key: 'unit', width: 10 },
      { header: 'Preço Unit.', key: 'unitPrice', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 }
    ];

    // Estilizar cabeçalho
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Adicionar dados
    order.items.forEach((item: any) => {
      sheet.addRow({
        sku: item.sku || '-',
        itemName: item.itemName,
        category: item.category || '-',
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: item.subtotal.toFixed(2)
      });
    });

    // Adicionar total
    sheet.addRow({});
    const totalRow = sheet.addRow({
      itemName: 'TOTAL GERAL',
      subtotal: order.totalValue.toFixed(2)
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB9C' }
    };

    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Pedido_${order.orderNumber}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao gerar planilha:', error);
    res.status(500).json({ error: 'Erro ao gerar planilha' });
  }
});

// ========== ATUALIZAR STATUS DO PEDIDO ==========
router.patch('/orders/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await prisma.procurementOrder.update({
      where: { id: orderId },
      data: { status },
      include: { items: true }
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

export default router;
