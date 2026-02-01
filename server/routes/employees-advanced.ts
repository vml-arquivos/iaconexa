import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configurar upload de documentos
const uploadDir = path.join(process.cwd(), 'uploads', 'employees');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// ========== LISTAR FUNCIONÁRIOS ==========
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, category, status } = req.query;

    const employees = await prisma.employee.findMany({
      where: {
        schoolId: schoolId as string,
        ...(category && { category: category as string }),
        ...(status && { status: status as string })
      },
      include: {
        documents: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
});

// ========== OBTER FUNCIONÁRIO INDIVIDUAL ==========
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        documents: true,
        school: true
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter funcionário' });
  }
});

// ========== CRIAR FUNCIONÁRIO ==========
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, email, phone, cpf, schoolId, hireDate, salary, department, personalData } = req.body;

    if (!name || !category || !schoolId) {
      return res.status(400).json({ error: 'Nome, categoria e schoolId são obrigatórios' });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        category,
        email,
        phone,
        cpf,
        schoolId,
        hireDate: hireDate ? new Date(hireDate) : null,
        salary: salary ? parseFloat(salary) : null,
        department
      },
      include: { documents: true }
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
});

// ========== ATUALIZAR FUNCIONÁRIO ==========
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, email, phone, cpf, status, hireDate, salary, department, personalData } = req.body;

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(cpf && { cpf }),
        ...(status && { status }),
        ...(hireDate && { hireDate: new Date(hireDate) }),
        ...(salary !== undefined && { salary: salary ? parseFloat(salary) : null }),
        ...(department && { department })
      },
      include: { documents: true }
    });

    res.json(employee);
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
});

// ========== ARQUIVAR FUNCIONÁRIO ==========
router.patch('/:id/archive', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: { documents: true }
    });

    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao arquivar funcionário' });
  }
});

// ========== DELETAR FUNCIONÁRIO ==========
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Deletar documentos primeiro
    await prisma.document.deleteMany({
      where: { employeeId: id }
    });

    // Deletar funcionário
    await prisma.employee.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Funcionário deletado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar funcionário' });
  }
});

// ========== UPLOAD DE DOCUMENTO ==========
router.post('/:id/documents', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, expiryDate } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não fornecido' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Tipo de documento é obrigatório' });
    }

    // Renomear arquivo
    const ext = path.extname(req.file.originalname);
    const newFilename = `${id}-${type}-${Date.now()}${ext}`;
    const newPath = path.join(uploadDir, newFilename);
    fs.renameSync(req.file.path, newPath);

    // Salvar no banco
    const document = await prisma.document.create({
      data: {
        type,
        url: `/uploads/employees/${newFilename}`,
        filename: req.file.originalname,
        fileSize: req.file.size,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        employeeId: id
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Erro ao upload de documento:', error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

// ========== LISTAR DOCUMENTOS DO FUNCIONÁRIO ==========
router.get('/:id/documents', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const documents = await prisma.document.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar documentos' });
  }
});

// ========== DELETAR DOCUMENTO ==========
router.delete('/documents/:docId', async (req: Request, res: Response) => {
  try {
    const { docId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: docId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Deletar arquivo
    const filePath = path.join(process.cwd(), 'public', document.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Deletar do banco
    await prisma.document.delete({
      where: { id: docId }
    });

    res.json({ success: true, message: 'Documento deletado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar documento' });
  }
});

// ========== LISTAR CATEGORIAS ==========
router.get('/categories/list', (req: Request, res: Response) => {
  const categories = [
    'Diretor',
    'Coordenador',
    'Professor',
    'Limpeza',
    'Cozinha',
    'Nutricionista',
    'Administrativo',
    'Segurança',
    'Outro'
  ];

  res.json(categories);
});

export default router;
