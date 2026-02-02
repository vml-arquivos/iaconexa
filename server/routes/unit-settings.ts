// ========================================
// UNIT SETTINGS API - Configurações de Módulos
// ========================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ========================================
// GET /api/unit-settings/:unitId
// Obter configurações de módulos de uma unidade
// ========================================
router.get('/:unitId', async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;

    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        moduloPedagogico: true,
        moduloDiario: true,
        moduloCRM: true,
        moduloFinanceiro: true,
        moduloSuprimentos: true,
      },
    });

    if (!unit) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    res.json(unit);
  } catch (error) {
    console.error('Erro ao buscar configurações da unidade:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// ========================================
// PATCH /api/unit-settings/:unitId
// Atualizar configurações de módulos de uma unidade
// ========================================
router.patch('/:unitId', async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const {
      moduloPedagogico,
      moduloDiario,
      moduloCRM,
      moduloFinanceiro,
      moduloSuprimentos,
    } = req.body;

    // Validar que pelo menos um campo foi enviado
    if (
      moduloPedagogico === undefined &&
      moduloDiario === undefined &&
      moduloCRM === undefined &&
      moduloFinanceiro === undefined &&
      moduloSuprimentos === undefined
    ) {
      return res.status(400).json({ error: 'Nenhuma configuração fornecida' });
    }

    // Construir objeto de atualização apenas com campos definidos
    const updateData: any = {};
    if (moduloPedagogico !== undefined) updateData.moduloPedagogico = moduloPedagogico;
    if (moduloDiario !== undefined) updateData.moduloDiario = moduloDiario;
    if (moduloCRM !== undefined) updateData.moduloCRM = moduloCRM;
    if (moduloFinanceiro !== undefined) updateData.moduloFinanceiro = moduloFinanceiro;
    if (moduloSuprimentos !== undefined) updateData.moduloSuprimentos = moduloSuprimentos;

    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: updateData,
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        moduloPedagogico: true,
        moduloDiario: true,
        moduloCRM: true,
        moduloFinanceiro: true,
        moduloSuprimentos: true,
      },
    });

    res.json(updatedUnit);
  } catch (error: any) {
    console.error('Erro ao atualizar configurações da unidade:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }
    
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

// ========================================
// GET /api/unit-settings
// Listar todas as unidades com suas configurações
// ========================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const units = await prisma.unit.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        moduloPedagogico: true,
        moduloDiario: true,
        moduloCRM: true,
        moduloFinanceiro: true,
        moduloSuprimentos: true,
      },
      orderBy: [
        { type: 'asc' }, // MATRIZ primeiro
        { name: 'asc' },
      ],
    });

    res.json(units);
  } catch (error) {
    console.error('Erro ao listar unidades:', error);
    res.status(500).json({ error: 'Erro ao listar unidades' });
  }
});

export default router;
