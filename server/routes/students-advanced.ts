import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configurar upload de documentos
const uploadDir = path.join(process.cwd(), 'uploads', 'students');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// ========== LISTAR ALUNOS ==========
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, classId, status } = req.query;

    const students = await prisma.student.findMany({
      where: {
        schoolId: schoolId as string,
        ...(classId && { classId: classId as string }),
        ...(status && { status: status as string })
      },
      include: {
        documents: true,
        class: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar alunos' });
  }
});

// ========== OBTER ALUNO INDIVIDUAL ==========
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        documents: true,
        class: true,
        school: true
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter aluno' });
  }
});

// ========== CRIAR ALUNO ==========
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      name, email, phone, birthDate, schoolId, classId, 
      responsavelName, responsavelEmail, responsavelPhone,
      healthData, academicData
    } = req.body;

    if (!name || !schoolId) {
      return res.status(400).json({ error: 'Nome e schoolId são obrigatórios' });
    }

    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        schoolId,
        classId: classId || null,
        responsavelName,
        responsavelEmail,
        responsavelPhone,
        healthData: healthData || {},
        academicData: academicData || {}
      },
      include: { documents: true, class: true }
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// ========== ATUALIZAR ALUNO ==========
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, email, phone, birthDate, classId, status,
      responsavelName, responsavelEmail, responsavelPhone,
      healthData, academicData, attendance
    } = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(classId !== undefined && { classId: classId || null }),
        ...(status && { status }),
        ...(responsavelName && { responsavelName }),
        ...(responsavelEmail && { responsavelEmail }),
        ...(responsavelPhone && { responsavelPhone }),
        ...(healthData && { healthData }),
        ...(academicData && { academicData }),
        ...(attendance && { attendance })
      },
      include: { documents: true, class: true }
    });

    res.json(student);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// ========== ARQUIVAR ALUNO ==========
router.patch('/:id/archive', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: { documents: true }
    });

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao arquivar aluno' });
  }
});

// ========== DELETAR ALUNO ==========
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Deletar documentos primeiro
    await prisma.document.deleteMany({
      where: { studentId: id }
    });

    // Deletar aluno
    await prisma.student.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Aluno deletado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar aluno' });
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
        url: `/uploads/students/${newFilename}`,
        filename: req.file.originalname,
        fileSize: req.file.size,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        studentId: id
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Erro ao upload de documento:', error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

// ========== LISTAR DOCUMENTOS DO ALUNO ==========
router.get('/:id/documents', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const documents = await prisma.document.findMany({
      where: { studentId: id },
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

export default router;
