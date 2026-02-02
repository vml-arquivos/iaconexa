import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

// ========================================
// CONFIGURAÇÃO DE STORAGE (S3 OU LOCAL)
// ========================================
// Este módulo suporta:
// - AWS S3
// - Cloudflare R2
// - Storage local (fallback para desenvolvimento)
// ========================================

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

// ========================================
// CONFIGURAÇÃO S3/R2
// ========================================
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
// STORAGE: S3
// ========================================
const s3Storage = s3Client ? multerS3({
  s3: s3Client,
  bucket: process.env.BUCKET_NAME || 'conexa-uploads',
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname,
      uploadedAt: new Date().toISOString(),
    });
  },
  key: (req, file, cb) => {
    const type = req.body.type || 'documents';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const key = `${type}/${name}-${uniqueSuffix}${ext}`;
    cb(null, key);
  },
}) : null;

// ========================================
// STORAGE: LOCAL (FALLBACK)
// ========================================
const uploadsDir = path.join(process.cwd(), 'uploads');
if (STORAGE_TYPE === 'local' && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'documents';
    const typeDir = path.join(uploadsDir, type);
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// ========================================
// FILTRO DE TIPOS DE ARQUIVO
// ========================================
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/csv',
    'application/xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
  }
};

// ========================================
// CONFIGURAÇÃO DO MULTER
// ========================================
const storage = STORAGE_TYPE === 's3' && s3Storage ? s3Storage : localStorage;

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Middleware para múltiplos arquivos
export const uploadMultiple = upload.array('files', 10);

// Middleware para arquivo único
export const uploadSingle = upload.single('file');

// ========================================
// HELPER: Obter URL pública do arquivo
// ========================================
export function getFileUrl(file: Express.Multer.File): string {
  if (STORAGE_TYPE === 's3') {
    // Para S3, o multer-s3 já retorna a URL em file.location
    const s3File = file as any;
    return s3File.location || s3File.key;
  }
  
  // Para storage local, retornar caminho relativo
  return `/uploads/${path.basename(file.path)}`;
}

// ========================================
// HELPER: Obter chave do arquivo (para deleção)
// ========================================
export function getFileKey(file: Express.Multer.File): string | null {
  if (STORAGE_TYPE === 's3') {
    const s3File = file as any;
    return s3File.key || null;
  }
  
  return null;
}

// ========================================
// LOG DE CONFIGURAÇÃO
// ========================================
console.log(`📦 Storage configurado: ${STORAGE_TYPE.toUpperCase()}`);
if (STORAGE_TYPE === 's3') {
  console.log(`   Bucket: ${process.env.BUCKET_NAME}`);
  console.log(`   Region: ${process.env.BUCKET_REGION}`);
  console.log(`   Endpoint: ${process.env.S3_ENDPOINT || 'AWS S3 padrão'}`);
}
