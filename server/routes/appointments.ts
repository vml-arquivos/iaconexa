// ========================================
// SISTEMA CONEXA v1.0
// Appointments API - Agenda de Atendimentos
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
 * GET /api/appointments
 * Listar agendamentos com filtros
 * Query params: unitId, studentId, type, status, startDate, endDate
 */
router.get('/api/appointments', async (req: Request, res: Response) => {
  try {
    const { unitId, studentId, type, status, startDate, endDate } = req.query;

    const where: any = {};

    if (unitId) where.unitId = unitId as string;
    if (studentId) where.studentId = studentId as string;
    if (type) where.type = type as string;
    if (status) where.status = status as string;

    if (startDate && endDate) {
      where.scheduledAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/appointments/:id
 * Buscar agendamento específico por ID
 */
router.get('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            phone: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
            birthDate: true,
            guardians: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/appointments
 * Criar novo agendamento
 */
router.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const {
      unitId,
      studentId,
      title,
      scheduledAt,
      type,
      status,
      meetingMinutes,
      attendees,
    } = req.body;

    // Validações
    if (!unitId || !title || !scheduledAt || !type) {
      return res.status(400).json({
        success: false,
        error: 'unitId, title, scheduledAt, and type are required',
      });
    }

    // Verificar se unit existe
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found',
      });
    }

    // Verificar se student existe (se fornecido)
    if (studentId) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found',
        });
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        unitId,
        studentId: studentId || null,
        title,
        scheduledAt: new Date(scheduledAt),
        type,
        status: status || 'SCHEDULED',
        meetingMinutes,
        attendees,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/appointments/:id
 * Atualizar agendamento existente
 */
router.put('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      scheduledAt,
      type,
      status,
      meetingMinutes,
      attendees,
    } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        title,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        type,
        status,
        meetingMinutes,
        attendees,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/appointments/:id
 * Deletar agendamento
 */
router.delete('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/appointments/unit/:unitId/upcoming
 * Buscar próximos agendamentos de uma unidade
 */
router.get('/api/appointments/unit/:unitId/upcoming', async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const { limit = '10' } = req.query;

    const appointments = await prisma.appointment.findMany({
      where: {
        unitId,
        scheduledAt: {
          gte: new Date(),
        },
        status: {
          not: 'CANCELED',
        },
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/appointments/unit/:unitId/today
 * Buscar agendamentos do dia para uma unidade
 */
router.get('/api/appointments/unit/:unitId/today', async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await prisma.appointment.findMany({
      where: {
        unitId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/appointments/:id/complete
 * Marcar agendamento como concluído
 */
router.patch('/api/appointments/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { meetingMinutes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        meetingMinutes,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/appointments/:id/cancel
 * Cancelar agendamento
 */
router.patch('/api/appointments/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELED',
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            enrollmentId: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
