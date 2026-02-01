import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Webhook para automação (n8n, Zapier, etc)
router.post('/command', async (req: Request, res: Response) => {
  const { secret, action, payload } = req.body;

  // Segurança: Verificar secret
  if (secret !== process.env.AGENT_SECRET && secret !== 'conexa_secret_key') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  try {
    let result;

    switch (action) {
      // ========== ALUNOS ==========
      case 'REGISTER_STUDENT':
        // Payload: { name, turma, responsavel, schoolId, birthDate, classId }
        result = await prisma.student.create({
          data: {
            name: payload.name,
            birthDate: payload.birthDate ? new Date(payload.birthDate) : new Date('2020-01-01'),
            classId: payload.classId || payload.turma || 'default-class',
            schoolId: payload.schoolId || 'default-school',
            profileData: { 
              responsavel: payload.responsavel, 
              turma: payload.turma 
            }
          }
        });
        break;

      case 'UPDATE_STUDENT':
        // Payload: { studentId, name, turma, status }
        result = await prisma.student.update({
          where: { id: payload.studentId },
          data: {
            name: payload.name,
            status: payload.status,
            profileData: { turma: payload.turma }
          }
        });
        break;

      case 'DELETE_STUDENT':
        // Payload: { studentId }
        result = await prisma.student.delete({
          where: { id: payload.studentId }
        });
        break;

      // ========== ESTOQUE ==========
      case 'CHECK_STOCK':
        // Payload: { category: 'Higiene' }
        result = await prisma.inventoryItem.findMany({
          where: { 
            category: payload.category,
            quantity: { lte: 10 }
          }
        });
        break;

      case 'UPDATE_STOCK':
        // Payload: { itemId, quantity }
        result = await prisma.inventoryItem.update({
          where: { id: payload.itemId },
          data: { quantity: payload.quantity }
        });
        break;

      case 'ADD_STOCK':
        // Payload: { itemId, quantity }
        const item = await prisma.inventoryItem.findUnique({
          where: { id: payload.itemId }
        });
        result = await prisma.inventoryItem.update({
          where: { id: payload.itemId },
          data: { quantity: (item?.quantity || 0) + payload.quantity }
        });
        break;

      // ========== FUNCIONÁRIOS ==========
      case 'REGISTER_EMPLOYEE':
        // Payload: { name, role, email, phone, schoolId }
        result = await prisma.employee.create({
          data: {
            name: payload.name,
            role: payload.role,
            email: payload.email,
            phone: payload.phone,
            schoolId: payload.schoolId || 'default-school'
          }
        });
        break;

      case 'UPDATE_EMPLOYEE':
        // Payload: { employeeId, name, role, status }
        result = await prisma.employee.update({
          where: { id: payload.employeeId },
          data: {
            name: payload.name,
            role: payload.role,
            status: payload.status
          }
        });
        break;

      // ========== COMPRAS ==========
      case 'CREATE_ORDER':
        // Payload: { schoolId, items: [{ itemId, quantity, price }] }
        result = await prisma.procurementOrder.create({
          data: {
            schoolId: payload.schoolId,
            status: 'PENDING',
            items: {
              create: payload.items.map((item: any) => ({
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          },
          include: { items: true }
        });
        break;

      case 'APPROVE_ORDER':
        // Payload: { orderId }
        result = await prisma.procurementOrder.update({
          where: { id: payload.orderId },
          data: { status: 'APPROVED' }
        });
        break;

      case 'REJECT_ORDER':
        // Payload: { orderId }
        result = await prisma.procurementOrder.update({
          where: { id: payload.orderId },
          data: { status: 'REJECTED' }
        });
        break;

      // ========== RELATÓRIOS ==========
      case 'GET_SCHOOL_STATS':
        // Payload: { schoolId }
        const students = await prisma.student.count({
          where: { schoolId: payload.schoolId }
        });
        const employees = await prisma.employee.count({
          where: { schoolId: payload.schoolId }
        });
        const inventory = await prisma.inventoryItem.findMany({
          where: { schoolId: payload.schoolId }
        });
        const totalInventoryValue = inventory.reduce((sum: number, item: any) => 
          sum + (Number(item.lastPrice) * item.quantity), 0
        );

        result = {
          students,
          employees,
          inventoryItems: inventory.length,
          totalInventoryValue
        };
        break;

      case 'GET_LOW_STOCK':
        // Payload: { schoolId, threshold: 10 }
        result = await prisma.inventoryItem.findMany({
          where: {
            schoolId: payload.schoolId,
            quantity: { lte: payload.threshold || 10 }
          }
        });
        break;

      case 'GET_STUDENT_ATTENDANCE':
        // Payload: { studentId }
        const student = await prisma.student.findUnique({
          where: { id: payload.studentId }
        });
        result = {
          name: student?.name,
          attendance: student?.attendance
        };
        break;

      // ========== AUDITORIA ==========
      case 'GET_AUDIT_LOGS':
        // Payload: { userId, limit: 50 }
        result = await prisma.auditLog.findMany({
          where: { userId: payload.userId },
          take: payload.limit || 50,
          orderBy: { createdAt: 'desc' }
        });
        break;

      default:
        return res.status(400).json({ 
          error: 'Comando desconhecido',
          availableCommands: [
            'REGISTER_STUDENT',
            'UPDATE_STUDENT',
            'DELETE_STUDENT',
            'CHECK_STOCK',
            'UPDATE_STOCK',
            'ADD_STOCK',
            'REGISTER_EMPLOYEE',
            'UPDATE_EMPLOYEE',
            'CREATE_ORDER',
            'APPROVE_ORDER',
            'REJECT_ORDER',
            'GET_SCHOOL_STATS',
            'GET_LOW_STOCK',
            'GET_STUDENT_ATTENDANCE',
            'GET_AUDIT_LOGS'
          ]
        });
    }
    
    res.json({ 
      success: true, 
      action,
      data: result 
    });
  } catch (error) {
    console.error('Erro no Agente:', error);
    res.status(500).json({ 
      error: 'Erro interno no Agente',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Listar comandos disponíveis
router.get('/commands', (req: Request, res: Response) => {
  res.json({
    commands: [
      {
        action: 'REGISTER_STUDENT',
        description: 'Registrar novo aluno',
        payload: { name: 'string', birthDate: 'string', classId: 'string', turma: 'string', responsavel: 'string', schoolId: 'string' }
      },
      {
        action: 'UPDATE_STUDENT',
        description: 'Atualizar dados do aluno',
        payload: { studentId: 'string', name: 'string', turma: 'string', status: 'string' }
      },
      {
        action: 'DELETE_STUDENT',
        description: 'Deletar aluno',
        payload: { studentId: 'string' }
      },
      {
        action: 'CHECK_STOCK',
        description: 'Verificar estoque baixo',
        payload: { category: 'string' }
      },
      {
        action: 'UPDATE_STOCK',
        description: 'Atualizar quantidade de estoque',
        payload: { itemId: 'string', quantity: 'number' }
      },
      {
        action: 'ADD_STOCK',
        description: 'Adicionar quantidade ao estoque',
        payload: { itemId: 'string', quantity: 'number' }
      },
      {
        action: 'REGISTER_EMPLOYEE',
        description: 'Registrar novo funcionário',
        payload: { name: 'string', role: 'string', email: 'string', phone: 'string', schoolId: 'string' }
      },
      {
        action: 'UPDATE_EMPLOYEE',
        description: 'Atualizar dados do funcionário',
        payload: { employeeId: 'string', name: 'string', role: 'string', status: 'string' }
      },
      {
        action: 'CREATE_ORDER',
        description: 'Criar pedido de compra',
        payload: { schoolId: 'string', items: 'array' }
      },
      {
        action: 'APPROVE_ORDER',
        description: 'Aprovar pedido de compra',
        payload: { orderId: 'string' }
      },
      {
        action: 'REJECT_ORDER',
        description: 'Rejeitar pedido de compra',
        payload: { orderId: 'string' }
      },
      {
        action: 'GET_SCHOOL_STATS',
        description: 'Obter estatísticas da escola',
        payload: { schoolId: 'string' }
      },
      {
        action: 'GET_LOW_STOCK',
        description: 'Obter itens com estoque baixo',
        payload: { schoolId: 'string', threshold: 'number' }
      },
      {
        action: 'GET_STUDENT_ATTENDANCE',
        description: 'Obter frequência do aluno',
        payload: { studentId: 'string' }
      },
      {
        action: 'GET_AUDIT_LOGS',
        description: 'Obter logs de auditoria',
        payload: { userId: 'string', limit: 'number' }
      }
    ]
  });
});

export default router;
