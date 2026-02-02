// ========================================
// SISTEMA CONEXA v1.0
// API: Gestão de Suprimentos
// Fluxo: Pedido → Aprovação → Compra
// ========================================

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, blockStrategicWrite, enforceUnitScope } from '../middleware/rbac.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Aplicar autenticação e RBAC em todas as rotas
router.use(authMiddleware);
router.use(enforceUnitScope); // Garante acesso apenas à própria unidade
router.use(blockStrategicWrite); // Bloqueia edição de nível estratégico

// ========================================
// ROTAS DE PEDIDOS DE MATERIAIS
// ========================================

/**
 * GET /api/material-requests
 * Lista todos os pedidos (com filtros)
 */
router.get('/api/material-requests', async (req, res) => {
  try {
    const { unitId, status, category, userId } = req.query;

    const where: any = {};
    
    if (unitId) where.unitId = unitId as string;
    if (status) where.status = status as string;
    if (category) where.category = category as string;
    if (userId) where.userId = userId as string;

    const requests = await prisma.materialRequest.findMany({
      where,
      include: {
        unitRel: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar pedidos de materiais',
      details: error.message,
    });
  }
});

/**
 * GET /api/material-requests/:id
 * Busca um pedido específico por ID
 */
router.get('/api/material-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.materialRequest.findUnique({
      where: { id },
      include: {
        unitRel: true,
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar pedido',
      details: error.message,
    });
  }
});

/**
 * POST /api/material-requests
 * Cria um novo pedido de material
 */
router.post('/api/material-requests', async (req, res) => {
  try {
    const {
      unitId,
      userId,
      category,
      itemName,
      quantity,
      unit,
      notes,
    } = req.body;

    // Validações
    if (!unitId || !userId || !category || !itemName || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: unitId, userId, category, itemName, quantity, unit',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade deve ser maior que zero',
      });
    }

    // Validar categoria
    const validCategories = ['HIGIENE', 'LIMPEZA', 'ALIMENTACAO', 'PEDAGOGICO'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Categoria inválida. Use: ${validCategories.join(', ')}`,
      });
    }

    const request = await prisma.materialRequest.create({
      data: {
        unitId,
        userId,
        category,
        itemName,
        quantity,
        unit,
        notes,
        status: 'PENDING',
      },
      include: {
        unitRel: true,
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: request,
      message: 'Pedido criado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar pedido',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/material-requests/:id/approve
 * Aprova um pedido
 */
router.patch('/api/material-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({
        success: false,
        error: 'Campo approvedBy é obrigatório',
      });
    }

    // Verificar se o pedido existe e está pendente
    const existingRequest = await prisma.materialRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    if (existingRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Pedido não pode ser aprovado. Status atual: ${existingRequest.status}`,
      });
    }

    const request = await prisma.materialRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        rejectionReason: null, // Limpar motivo de rejeição se houver
      },
      include: {
        unitRel: true,
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: request,
      message: 'Pedido aprovado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao aprovar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao aprovar pedido',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/material-requests/:id/reject
 * Rejeita um pedido
 */
router.patch('/api/material-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Campo rejectionReason é obrigatório',
      });
    }

    // Verificar se o pedido existe e está pendente
    const existingRequest = await prisma.materialRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    if (existingRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Pedido não pode ser rejeitado. Status atual: ${existingRequest.status}`,
      });
    }

    const request = await prisma.materialRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
      include: {
        unitRel: true,
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: request,
      message: 'Pedido rejeitado',
    });
  } catch (error: any) {
    console.error('Erro ao rejeitar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao rejeitar pedido',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/material-requests/:id/purchase
 * Marca um pedido como comprado
 */
router.patch('/api/material-requests/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o pedido existe e está aprovado
    const existingRequest = await prisma.materialRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    if (existingRequest.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: `Apenas pedidos aprovados podem ser marcados como comprados. Status atual: ${existingRequest.status}`,
      });
    }

    const request = await prisma.materialRequest.update({
      where: { id },
      data: {
        status: 'PURCHASED',
        purchasedAt: new Date(),
      },
      include: {
        unitRel: true,
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: request,
      message: 'Pedido marcado como comprado',
    });
  } catch (error: any) {
    console.error('Erro ao marcar pedido como comprado:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao marcar pedido como comprado',
      details: error.message,
    });
  }
});

/**
 * PUT /api/material-requests/:id
 * Atualiza um pedido (apenas se estiver PENDING)
 */
router.put('/api/material-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, itemName, quantity, unit, notes } = req.body;

    // Verificar se o pedido existe
    const existingRequest = await prisma.materialRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    // Apenas pedidos pendentes podem ser editados
    if (existingRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Apenas pedidos pendentes podem ser editados',
      });
    }

    const updateData: any = {};
    if (category) updateData.category = category;
    if (itemName) updateData.itemName = itemName;
    if (quantity) updateData.quantity = quantity;
    if (unit) updateData.unit = unit;
    if (notes !== undefined) updateData.notes = notes;

    const request = await prisma.materialRequest.update({
      where: { id },
      data: updateData,
      include: {
        unitRel: true,
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: request,
      message: 'Pedido atualizado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar pedido',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/material-requests/:id
 * Deleta um pedido (apenas se estiver PENDING)
 */
router.delete('/api/material-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o pedido existe
    const existingRequest = await prisma.materialRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    // Apenas pedidos pendentes podem ser deletados
    if (existingRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Apenas pedidos pendentes podem ser deletados',
      });
    }

    await prisma.materialRequest.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Pedido deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar pedido',
      details: error.message,
    });
  }
});

/**
 * GET /api/material-requests/unit/:unitId/pending
 * Lista pedidos pendentes de uma unidade
 */
router.get('/api/material-requests/unit/:unitId/pending', async (req, res) => {
  try {
    const { unitId } = req.params;

    const requests = await prisma.materialRequest.findMany({
      where: {
        unitId,
        status: 'PENDING',
      },
      include: {
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar pedidos pendentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar pedidos pendentes',
      details: error.message,
    });
  }
});

/**
 * GET /api/material-requests/unit/:unitId/approved
 * Lista pedidos aprovados de uma unidade (aguardando compra)
 */
router.get('/api/material-requests/unit/:unitId/approved', async (req, res) => {
  try {
    const { unitId } = req.params;

    const requests = await prisma.materialRequest.findMany({
      where: {
        unitId,
        status: 'APPROVED',
      },
      include: {
        userRel: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar pedidos aprovados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar pedidos aprovados',
      details: error.message,
    });
  }
});

/**
 * GET /api/material-requests/stats/:unitId
 * Estatísticas de pedidos de uma unidade
 */
router.get('/api/material-requests/stats/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;

    const [pending, approved, rejected, purchased, total] = await Promise.all([
      prisma.materialRequest.count({ where: { unitId, status: 'PENDING' } }),
      prisma.materialRequest.count({ where: { unitId, status: 'APPROVED' } }),
      prisma.materialRequest.count({ where: { unitId, status: 'REJECTED' } }),
      prisma.materialRequest.count({ where: { unitId, status: 'PURCHASED' } }),
      prisma.materialRequest.count({ where: { unitId } }),
    ]);

    res.json({
      success: true,
      data: {
        pending,
        approved,
        rejected,
        purchased,
        total,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
      details: error.message,
    });
  }
});

export default router;
