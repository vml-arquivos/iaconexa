// ========================================
// SISTEMA CONEXA v1.0
// Health Check Endpoint
// ========================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Health Check Endpoint
 * GET /health
 * 
 * Verifica:
 * - Status da API
 * - Conexão com banco de dados
 * - Timestamp
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Testar conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ok',
      service: 'SISTEMA CONEXA v1.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'SISTEMA CONEXA v1.0',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Readiness Check Endpoint
 * GET /ready
 * 
 * Verifica se o sistema está pronto para receber requisições
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (tables.length === 0) {
      return res.status(503).json({
        status: 'not_ready',
        message: 'Database not initialized. Run migrations first.',
      });
    }
    
    res.status(200).json({
      status: 'ready',
      tables: tables.length,
      message: 'System is ready to accept requests',
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Liveness Check Endpoint
 * GET /live
 * 
 * Verifica se o processo está vivo (não travado)
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    pid: process.pid,
    uptime: process.uptime(),
  });
});

export default router;
