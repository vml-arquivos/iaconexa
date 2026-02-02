import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import path from 'path';

// ========================================
// CONFIGURAÇÃO DO S3/R2
// ========================================
// Este middleware suporta tanto AWS S3 quanto Cloudflare R2
// Para R2, use o endpoint customizado no formato:
// https://<account-id>.r2.cloudflarestorage.com

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT || undefined, // Para R2, ex: https://xxx.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // Necessário para alguns provedores
});

// ========================================
// CONFIGURAÇÃO DO MULTER COM S3
// ========================================
const storage = multerS3({
  s3: s3Client,
  bucket: process.env.S3_BUCKET_NAME || 'conexa-uploads',
  acl: 'public-read', // Ajuste conforme necessário
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname,
      uploadedAt: new Date().toISOString(),
    });
  },
  key: (req, file, cb) => {
    // Criar estrutura de pastas por tipo
    const type = req.body.type || 'documents';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const key = `${type}/${name}-${uniqueSuffix}${ext}`;
    cb(null, key);
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
export const uploadS3 = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Middleware para múltiplos arquivos
export const uploadMultipleS3 = uploadS3.array('files', 10);

// Middleware para arquivo único
export const uploadSingleS3 = uploadS3.single('file');

// ========================================
// HELPER: Obter URL pública do arquivo
// ========================================
export function getPublicUrl(key: string): string {
  const bucketName = process.env.S3_BUCKET_NAME || 'conexa-uploads';
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION || 'auto';

  // Se for R2 ou endpoint customizado
  if (endpoint) {
    // Remove protocolo se existir
    const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
    return `https://${bucketName}.${cleanEndpoint}/${key}`;
  }

  // AWS S3 padrão
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
