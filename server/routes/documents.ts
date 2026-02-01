import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadSingle } from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// POST /api/documents/upload - Upload de documento
router.post('/upload', uploadSingle, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type, studentId, employeeId } = req.body;

    if (!type || (!studentId && !employeeId)) {
      return res.status(400).json({ error: 'Missing type or studentId/employeeId' });
    }

    // Criar registro de documento
    const document = await prisma.document.create({
      data: {
        type,
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        studentId: studentId || null,
        employeeId: employeeId || null,
      },
    });

    res.json({
      success: true,
      document,
      message: 'Documento enviado com sucesso',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/documents/student/:studentId - Listar documentos do aluno
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const documents = await prisma.document.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

// GET /api/documents/employee/:employeeId - Listar documentos do funcionário
router.get('/employee/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const documents = await prisma.document.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

// DELETE /api/documents/:documentId - Deletar documento
router.delete('/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Deletar arquivo físico
    const filePath = path.join(process.cwd(), 'uploads', path.basename(document.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Deletar registro do banco
    await prisma.document.delete({
      where: { id: documentId },
    });

    res.json({
      success: true,
      message: 'Documento deletado com sucesso',
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar documento' });
  }
});

export default router;
