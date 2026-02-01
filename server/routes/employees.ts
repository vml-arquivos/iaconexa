import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/employees - Listar funcionários
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    const employees = await prisma.employee.findMany({
      where: schoolId ? { schoolId: schoolId as string } : {},
      include: {
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários' });
  }
});

// GET /api/employees/:id - Obter funcionário específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
});

// POST /api/employees - Criar funcionário
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, role, email, phone, schoolId } = req.body;

    if (!name || !role || !schoolId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        role,
        email: email || null,
        phone: phone || null,
        schoolId,
      },
    });

    res.json({
      success: true,
      employee,
      message: 'Funcionário criado com sucesso',
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /api/employees/:id - Atualizar funcionário
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, email, phone, status } = req.body;

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name: name || undefined,
        role: role || undefined,
        email: email || undefined,
        phone: phone || undefined,
        status: status || undefined,
      },
      include: {
        documents: true,
      },
    });

    res.json({
      success: true,
      employee,
      message: 'Funcionário atualizado com sucesso',
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
});

// DELETE /api/employees/:id - Deletar funcionário
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.employee.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Funcionário deletado com sucesso',
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar funcionário' });
  }
});

export default router;
