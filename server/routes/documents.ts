import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadSingle, getFileUrl, getFileKey } from '../config/storage.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

// Cliente S3 para operações de deleção (apenas se usar S3)
let s3Client: S3Client | null = null;

if (STORAGE_TYPE === 's3') {
  s3Client = new S3Client({
    region: process.env.BUCKET_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID || '',
      secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });
}

// ========================================
// POST /api/documents/upload - Upload de documento
// ========================================
router.post('/upload', uploadSingle, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type, studentId, employeeId } = req.body;

    if (!type || (!studentId && !employeeId)) {
      return res.status(400).json({ error: 'Missing type or studentId/employeeId' });
    }

    // Obter URL e chave do arquivo (compatível com S3 e local)
    const fileUrl = getFileUrl(req.file);
    const fileKey = getFileKey(req.file);

    // Criar registro de documento
    const document = await prisma.document.create({
      data: {
        type,
        filename: req.file.originalname,
        url: fileUrl,
        fileKey: fileKey,
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
// DELETE /api/documents/:documentId - Deletar documento
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

    // Deletar arquivo físico
    if (STORAGE_TYPE === 's3' && document.fileKey && s3Client) {
      // Deletar do S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME || 'conexa-uploads',
        Key: document.fileKey,
      });

      await s3Client.send(deleteCommand);
    } else if (STORAGE_TYPE === 'local') {
      // Deletar do disco local
      const filePath = path.join(process.cwd(), 'uploads', path.basename(document.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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
