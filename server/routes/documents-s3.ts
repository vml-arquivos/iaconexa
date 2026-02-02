import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadSingleS3, getPublicUrl } from '../middleware/upload-s3.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const router = Router();
const prisma = new PrismaClient();

// Cliente S3 para operações de deleção
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});

// ========================================
// POST /api/documents/upload - Upload de documento para S3
// ========================================
router.post('/upload', uploadSingleS3, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type, studentId, employeeId } = req.body;

    if (!type || (!studentId && !employeeId)) {
      return res.status(400).json({ error: 'Missing type or studentId/employeeId' });
    }

    // O multer-s3 adiciona informações extras ao objeto file
    const s3File = req.file as any;

    // Criar registro de documento
    const document = await prisma.document.create({
      data: {
        type,
        filename: req.file.originalname,
        url: s3File.location, // URL pública do S3
        fileKey: s3File.key,   // Chave do arquivo no S3 (para deleção)
        fileSize: req.file.size,
        studentId: studentId || null,
        employeeId: employeeId || null,
      } as any,
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

// ========================================
// GET /api/documents/student/:studentId
// ========================================
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

// ========================================
// GET /api/documents/employee/:employeeId
// ========================================
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

// ========================================
// DELETE /api/documents/:documentId - Deletar documento do S3
// ========================================
router.delete('/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Deletar arquivo do S3 usando a fileKey
    if (document.fileKey) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || 'conexa-uploads',
        Key: document.fileKey,
      });

      await s3Client.send(deleteCommand);
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
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar documento',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
