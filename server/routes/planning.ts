import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// 1. GET /templates: Buscar Sugestões da BNCC (Banco de Ideias)
// Permite filtrar por Segmento (Bebês/Crianças), Mês e Eixo Temático
router.get('/templates', async (req, res) => {
  try {
    const { segment, month, axis } = req.query;
    
    // Construção dinâmica do filtro
    const where: any = {};
    if (segment) where.segment = segment;
    if (month) where.month = month;
    if (axis) where.thematicAxis = { contains: String(axis) };

    const templates = await prisma.lessonTemplate.findMany({
      where,
      take: 50, // Limite de segurança
      orderBy: { weekNumber: 'asc' }
    });

    res.json(templates);
  } catch (error) {
    console.error('Erro ao buscar templates BNCC:', error);
    res.status(500).json({ error: 'Erro interno ao buscar sugestões pedagógicas' });
  }
});

// 2. GET /class/:classId: Listar Planejamentos de uma Turma
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const plans = await prisma.bNCCPlanning.findMany({
      where: { classId },
      orderBy: { date: 'desc' },
      include: { class: true } // Inclui dados da turma se necessário
    });

    res.json(plans);
  } catch (error) {
    console.error('Erro ao buscar planejamentos:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico de planejamentos' });
  }
});

// 3. POST /: Criar ou Salvar um Novo Planejamento
router.post('/', async (req, res) => {
  try {
    const { classId, date, theme, bnccCodes, activities, resources } = req.body;

    // Validação básica
    if (!classId || !date || !theme) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando (Turma, Data ou Tema)' });
    }

    const newPlan = await prisma.bNCCPlanning.create({
      data: {
        classId,
        date: new Date(date),
        theme,
        bnccCodes: bnccCodes || [], // Array de códigos (ex: ['EI01EO01'])
        activities,
        resources
      }
    });

    res.json(newPlan);
  } catch (error) {
    console.error('Erro ao salvar planejamento:', error);
    res.status(500).json({ error: 'Erro ao salvar o planejamento no banco' });
  }
});

export default router;
