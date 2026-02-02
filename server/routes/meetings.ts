import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware } from '../middleware/rbac.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ==========================================
// GET /meetings/upcoming?unitId=X
// Retorna a próxima reunião agendada e os tópicos sugeridos
// ==========================================
router.get('/upcoming', async (req, res) => {
  try {
    const { unitId } = req.query;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    // Build where clause
    const where: any = {
      date: { gte: new Date() },
      isClosed: false,
    };
    
    // If unitId is provided, filter by unit
    if (unitId) {
      where.unitId = unitId as string;
    } else if (!['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(userRole)) {
      // Non-strategic users can only see their unit's meetings
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { unitId: true },
      });
      
      if (user?.unitId) {
        where.unitId = user.unitId;
      }
    }
    
    const upcomingMeeting = await prisma.meeting.findFirst({
      where,
      orderBy: { date: 'asc' },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        topics: {
          include: {
            suggester: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        actions: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    res.json(upcomingMeeting || null);
  } catch (error) {
    console.error('Error fetching upcoming meeting:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming meeting' });
  }
});

// ==========================================
// POST /topics/suggest
// Qualquer professor pode sugerir um tema para a próxima reunião da sua unidade
// ==========================================
router.post('/topics/suggest', async (req, res) => {
  try {
    const { meetingId, title, description } = req.body;
    const userId = (req as any).user.id;
    
    if (!meetingId || !title) {
      return res.status(400).json({ error: 'meetingId and title are required' });
    }
    
    // Verify meeting exists and is not closed
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { isClosed: true, unitId: true },
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    if (meeting.isClosed) {
      return res.status(400).json({ error: 'Cannot suggest topics for closed meeting' });
    }
    
    // Verify user belongs to the same unit (unless strategic level)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { unitId: true, role: true },
    });
    
    if (!['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(user?.role || '') && 
        user?.unitId !== meeting.unitId) {
      return res.status(403).json({ error: 'You can only suggest topics for your unit meetings' });
    }
    
    const topic = await prisma.meetingTopic.create({
      data: {
        meetingId,
        suggesterId: userId,
        title,
        description,
        status: 'SUGGESTED',
      },
      include: {
        suggester: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    
    res.status(201).json(topic);
  } catch (error) {
    console.error('Error suggesting topic:', error);
    res.status(500).json({ error: 'Failed to suggest topic' });
  }
});

// ==========================================
// POST /meetings/start
// O Coordenador ou Anfitrião inicia a reunião (transforma tópicos em pauta oficial)
// ==========================================
router.post('/start', rbacMiddleware(['COORD_PEDAGOGICO', 'DIRETOR_UNIDADE', 'GESTOR_REDE', 'ADMIN_MATRIZ']), async (req, res) => {
  try {
    const { meetingId, approvedTopicIds } = req.body;
    const userId = (req as any).user.id;
    
    if (!meetingId) {
      return res.status(400).json({ error: 'meetingId is required' });
    }
    
    // Verify meeting exists and user is the host or has permission
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { unit: true },
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    if (meeting.isClosed) {
      return res.status(400).json({ error: 'Meeting is already closed' });
    }
    
    // Verify permission
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { unitId: true, role: true },
    });
    
    const isHost = meeting.hostId === userId;
    const isStrategic = ['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(user?.role || '');
    const isSameUnit = user?.unitId === meeting.unitId;
    const isCoordinator = ['COORD_PEDAGOGICO', 'DIRETOR_UNIDADE'].includes(user?.role || '');
    
    if (!isHost && !isStrategic && !(isSameUnit && isCoordinator)) {
      return res.status(403).json({ error: 'Only the host or coordinators can start the meeting' });
    }
    
    // Approve selected topics
    if (approvedTopicIds && Array.isArray(approvedTopicIds)) {
      await prisma.meetingTopic.updateMany({
        where: {
          id: { in: approvedTopicIds },
          meetingId,
        },
        data: {
          status: 'APPROVED',
        },
      });
    }
    
    // Get updated meeting
    const updatedMeeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        topics: {
          include: {
            suggester: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    
    res.json(updatedMeeting);
  } catch (error) {
    console.error('Error starting meeting:', error);
    res.status(500).json({ error: 'Failed to start meeting' });
  }
});

// ==========================================
// POST /meetings/finalize
// Fecha a reunião, salva a Ata e dispara as Tarefas (Action Items)
// ==========================================
router.post('/finalize', rbacMiddleware(['COORD_PEDAGOGICO', 'DIRETOR_UNIDADE', 'GESTOR_REDE', 'ADMIN_MATRIZ']), async (req, res) => {
  try {
    const { meetingId, minutes, actionItems, discussedTopicIds, deferredTopicIds } = req.body;
    const userId = (req as any).user.id;
    
    if (!meetingId) {
      return res.status(400).json({ error: 'meetingId is required' });
    }
    
    // Verify meeting exists and user has permission
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    if (meeting.isClosed) {
      return res.status(400).json({ error: 'Meeting is already closed' });
    }
    
    // Verify permission (same as start)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { unitId: true, role: true },
    });
    
    const isHost = meeting.hostId === userId;
    const isStrategic = ['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(user?.role || '');
    const isSameUnit = user?.unitId === meeting.unitId;
    const isCoordinator = ['COORD_PEDAGOGICO', 'DIRETOR_UNIDADE'].includes(user?.role || '');
    
    if (!isHost && !isStrategic && !(isSameUnit && isCoordinator)) {
      return res.status(403).json({ error: 'Only the host or coordinators can finalize the meeting' });
    }
    
    // Update meeting
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        minutes: minutes || '',
        isClosed: true,
      },
    });
    
    // Update topic statuses
    if (discussedTopicIds && Array.isArray(discussedTopicIds)) {
      await prisma.meetingTopic.updateMany({
        where: {
          id: { in: discussedTopicIds },
          meetingId,
        },
        data: {
          status: 'DISCUSSED',
        },
      });
    }
    
    if (deferredTopicIds && Array.isArray(deferredTopicIds)) {
      await prisma.meetingTopic.updateMany({
        where: {
          id: { in: deferredTopicIds },
          meetingId,
        },
        data: {
          status: 'DEFERRED',
        },
      });
    }
    
    // Create action items
    if (actionItems && Array.isArray(actionItems)) {
      for (const item of actionItems) {
        if (item.assigneeId && item.description) {
          await prisma.actionItem.create({
            data: {
              meetingId,
              assigneeId: item.assigneeId,
              description: item.description,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
            },
          });
        }
      }
    }
    
    // Get final meeting
    const finalMeeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        topics: {
          include: {
            suggester: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        actions: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    
    res.json(finalMeeting);
  } catch (error) {
    console.error('Error finalizing meeting:', error);
    res.status(500).json({ error: 'Failed to finalize meeting' });
  }
});

// ==========================================
// GET /meetings/general
// Rota exclusiva para ADMIN_MATRIZ e GESTOR_REDE verem todas as atas
// ==========================================
router.get('/general', rbacMiddleware(['ADMIN_MATRIZ', 'GESTOR_REDE']), async (req, res) => {
  try {
    const { type, keyword, startDate, endDate } = req.query;
    
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }
    
    // Keyword search in title or minutes
    if (keyword) {
      where.OR = [
        { title: { contains: keyword as string, mode: 'insensitive' } },
        { minutes: { contains: keyword as string, mode: 'insensitive' } },
      ];
    }
    
    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        topics: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        actions: {
          select: {
            id: true,
            description: true,
            isCompleted: true,
            assignee: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching general meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// ==========================================
// GET /meetings/:id
// Get meeting details
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        topics: {
          include: {
            suggester: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        actions: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check permission
    if (!['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(userRole)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { unitId: true },
      });
      
      if (user?.unitId !== meeting.unitId) {
        return res.status(403).json({ error: 'You can only view meetings from your unit' });
      }
    }
    
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// ==========================================
// POST /meetings
// Create new meeting
// ==========================================
router.post('/', rbacMiddleware(['COORD_PEDAGOGICO', 'DIRETOR_UNIDADE', 'GESTOR_REDE', 'ADMIN_MATRIZ']), async (req, res) => {
  try {
    const { unitId, hostId, date, type, title } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    if (!hostId || !date || !type || !title) {
      return res.status(400).json({ error: 'hostId, date, type, and title are required' });
    }
    
    // Verify permission
    if (!['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(userRole)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { unitId: true },
      });
      
      if (unitId && user?.unitId !== unitId) {
        return res.status(403).json({ error: 'You can only create meetings for your unit' });
      }
    }
    
    const meeting = await prisma.meeting.create({
      data: {
        unitId: unitId || null,
        hostId,
        date: new Date(date),
        type,
        title,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    
    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

export default router;
