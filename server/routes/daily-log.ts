// ========================================
// SISTEMA CONEXA v1.0
// Daily Log API - Diário Digital
// ========================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, blockStrategicWrite, enforceUnitScope } from '../middleware/rbac.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Aplicar authMiddleware e RBAC em todas as rotas
router.use(authMiddleware);
router.use(enforceUnitScope); // Garante acesso apenas à própria unidade
router.use(blockStrategicWrite); // Bloqueia edição de nível estratégico

/**
 * GET /api/daily-log
 * Listar registros do diário com filtros
 * Query params: studentId, classId, date, startDate, endDate
 */
router.get('/api/daily-log', async (req: Request, res: Response) => {
  try {
    const { studentId, classId, date, startDate, endDate } = req.query;

    const where: any = {};

    if (studentId) where.studentId = studentId as string;
    if (classId) where.classId = classId as string;
    
    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.date = { gte: startOfDay, lte: endOfDay };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const logs = await prisma.dailyLog.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/daily-log/:id
 * Buscar registro específico por ID
 */
router.get('/api/daily-log/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.dailyLog.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
            birthDate: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Daily log not found',
      });
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error fetching daily log:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/daily-log
 * Criar novo registro no diário
 */
router.post('/api/daily-log', async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      classId,
      date,
      sleepStatus,
      foodIntake,
      hygieneStatus,
      mood,
      observations,
      alertTriggered,
    } = req.body;

    // Validações
    if (!studentId || !classId) {
      return res.status(400).json({
        success: false,
        error: 'studentId and classId are required',
      });
    }

    // Verificar se student e class existem
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const classRoom = await prisma.class.findUnique({ where: { id: classId } });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    if (!classRoom) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
      });
    }

    // Lógica de Alerta Automático
    // Se foodIntake == REJECTED ou mood == CRYING, ativar alerta automaticamente
    const autoAlert = foodIntake === 'REJECTED' || mood === 'CRYING';
    
    const log = await prisma.dailyLog.create({
      data: {
        studentId,
        classId,
        date: date ? new Date(date) : new Date(),
        sleepStatus,
        foodIntake,
        hygieneStatus,
        mood,
        observations,
        alertTriggered: autoAlert || alertTriggered || false,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error creating daily log:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/daily-log/:id
 * Atualizar registro existente
 */
router.put('/api/daily-log/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      sleepStatus,
      foodIntake,
      hygieneStatus,
      mood,
      observations,
      alertTriggered,
    } = req.body;

    // Lógica de Alerta Automático
    // Se foodIntake == REJECTED ou mood == CRYING, ativar alerta automaticamente
    const autoAlert = foodIntake === 'REJECTED' || mood === 'CRYING';
    
    const log = await prisma.dailyLog.update({
      where: { id },
      data: {
        sleepStatus,
        foodIntake,
        hygieneStatus,
        mood,
        observations,
        alertTriggered: autoAlert || alertTriggered || false,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error updating daily log:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/daily-log/:id
 * Deletar registro
 */
router.delete('/api/daily-log/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.dailyLog.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Daily log deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting daily log:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/daily-log/student/:studentId/today
 * Buscar registro do dia atual para um aluno específico
 */
router.get('/api/daily-log/student/:studentId/today', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const log = await prisma.dailyLog.findFirst({
      where: {
        studentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: log || null,
    });
  } catch (error) {
    console.error('Error fetching today log:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/daily-log/class/:classId/today
 * Buscar todos os registros do dia atual para uma turma
 */
router.get('/api/daily-log/class/:classId/today', async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const logs = await prisma.dailyLog.findMany({
      where: {
        classId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: {
        student: {
          name: 'asc',
        },
      },
    });

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching class logs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
