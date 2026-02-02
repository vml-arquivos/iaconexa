import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// 1. Buscar Templates/Sugestões da BNCC
router.get('/templates', async (req, res) => {
  try {
    const { segment, month, axis } = req.query;
    const where: any = {};
    if (segment) where.segment = segment;
    if (month) where.month = month;
    if (axis) where.thematicAxis = { contains: String(axis) };
    
    const templates = await prisma.lessonTemplate.findMany({
      where,
      take: 20
    });
    res.json(templates);
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({ error: 'Erro ao buscar sugestões BNCC' });
  }
});

// 2. Listar Planejamentos da Turma
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const plans = await prisma.bNCCPlanning.findMany({
      where: { classId },
      orderBy: { date: 'desc' },
      include: { class: true }
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar planejamentos' });
  }
});

// 3. Criar Novo Planejamento
router.post('/', async (req, res) => {
  try {
    const { classId, date, theme, bnccCodes, activities, resources } = req.body;
    const newPlan = await prisma.bNCCPlanning.create({
      data: {
        classId,
        date: new Date(date),
        theme,
        bnccCodes,
        activities,
        resources
      }
    });
    res.json(newPlan);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao salvar planejamento' });
  }
});

export default router;
