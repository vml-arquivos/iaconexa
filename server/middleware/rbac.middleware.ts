/**
 * RBAC Middleware - Strict Access Control
 * Sistema Conexa - Security Hardening
 * 
 * Regra de Negócio: "A MATRIZ AUDITA, A UNIDADE EXECUTA"
 * 
 * Hierarquia:
 * - Estratégico (ADMIN_MATRIZ, GESTOR_REDE): Vê tudo, não edita operacional
 * - Tático (DIRETOR_UNIDADE, COORD_PEDAGOGICO, SECRETARIA): Autoridade local
 * - Operacional (NUTRICIONISTA, PROFESSOR): Execução
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        unitId: string | null;
      };
    }
  }
}

// Role Levels
const STRATEGIC_ROLES: UserRole[] = ['ADMIN_MATRIZ', 'GESTOR_REDE'];
const TACTICAL_ROLES: UserRole[] = ['DIRETOR_UNIDADE', 'COORD_PEDAGOGICO', 'SECRETARIA'];
const OPERATIONAL_ROLES: UserRole[] = ['NUTRICIONISTA', 'PROFESSOR'];

// Resource Types
type ResourceType = 
  | 'daily-log' 
  | 'student' 
  | 'class' 
  | 'appointment' 
  | 'material-request' 
  | 'planning'
  | 'unit-settings'
  | 'unit'
  | 'report';

// Action Types
type ActionType = 'READ' | 'WRITE' | 'DELETE';

/**
 * Check if user has permission to perform action on resource
 */
export function checkPermission(
  user: Express.Request['user'],
  resource: ResourceType,
  action: ActionType,
  resourceUnitId?: string
): { allowed: boolean; reason?: string } {
  
  if (!user) {
    return { allowed: false, reason: 'User not authenticated' };
  }

  const { role, unitId } = user;

  // ========================================
  // STRATEGIC ROLES (Global View-Only)
  // ========================================
  if (STRATEGIC_ROLES.includes(role)) {
    // READ: Allow access to EVERYTHING (Global)
    if (action === 'READ') {
      return { allowed: true };
    }

    // WRITE/DELETE: DENY for operational resources
    const operationalResources: ResourceType[] = [
      'daily-log',
      'student',
      'class',
      'appointment',
      'material-request',
      'planning'
    ];

    if (operationalResources.includes(resource)) {
      return { 
        allowed: false, 
        reason: 'Nível estratégico não pode editar dados operacionais. Apenas a unidade pode editar.' 
      };
    }

    // EXCEPTION: Can edit unit-settings and create units
    if (resource === 'unit-settings' || resource === 'unit') {
      return { allowed: true };
    }

    // Default deny for strategic on write
    return { 
      allowed: false, 
      reason: 'Permissão negada para nível estratégico' 
    };
  }

  // ========================================
  // TACTICAL & OPERATIONAL ROLES (Local Authority)
  // ========================================
  
  // Must have unitId
  if (!unitId) {
    return { 
      allowed: false, 
      reason: 'Usuário não está vinculado a uma unidade' 
    };
  }

  // If resource has unitId, check if it matches user's unitId
  if (resourceUnitId && resourceUnitId !== unitId) {
    return { 
      allowed: false, 
      reason: 'Acesso negado: recurso pertence a outra unidade' 
    };
  }

  // TACTICAL ROLES: Full access within their unit
  if (TACTICAL_ROLES.includes(role)) {
    return { allowed: true };
  }

  // OPERATIONAL ROLES: Limited access
  if (OPERATIONAL_ROLES.includes(role)) {
    // PROFESSOR: Can only manage their own classes
    if (role === 'PROFESSOR') {
      // READ: Can read within their unit
      if (action === 'READ') {
        return { allowed: true };
      }

      // WRITE/DELETE: Only for their assigned resources
      // This should be checked at route level with additional logic
      return { allowed: true }; // Basic permission, route will check ownership
    }

    // NUTRICIONISTA: Can manage health-related data
    if (role === 'NUTRICIONISTA') {
      const allowedResources: ResourceType[] = ['daily-log', 'student', 'report'];
      if (allowedResources.includes(resource)) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'Nutricionista só pode acessar dados de saúde' 
      };
    }
  }

  // Default deny
  return { 
    allowed: false, 
    reason: 'Permissão não definida para este role' 
  };
}

/**
 * Middleware to check permissions
 * Usage: rbacMiddleware('daily-log', 'WRITE')
 * OR: rbacMiddleware(['ADMIN_MATRIZ', 'DIRETOR_UNIDADE']) for role-based access
 */
export function rbacMiddleware(resourceOrRoles: ResourceType | UserRole[], action?: ActionType) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if it's role-based access (array of roles)
    if (Array.isArray(resourceOrRoles)) {
      const allowedRoles = resourceOrRoles as UserRole[];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Você não tem permissão para realizar esta ação',
          code: 'RBAC_ROLE_DENIED'
        });
      }
      return next();
    }

    // Resource-based access
    const resource = resourceOrRoles as ResourceType;
    if (!action) {
      return res.status(500).json({ error: 'Action is required for resource-based access' });
    }

    const resourceUnitId = req.body?.unitId || req.params?.unitId || req.query?.unitId as string;
    const permission = checkPermission(req.user, resource, action, resourceUnitId);

    if (!permission.allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: permission.reason || 'Você não tem permissão para realizar esta ação',
        code: 'RBAC_PERMISSION_DENIED'
      });
    }

    next();
  };
}

/**
 * Helper to check if user is strategic level
 */
export function isStrategicRole(role: UserRole): boolean {
  return STRATEGIC_ROLES.includes(role);
}

/**
 * Helper to check if user is tactical level
 */
export function isTacticalRole(role: UserRole): boolean {
  return TACTICAL_ROLES.includes(role);
}

/**
 * Helper to check if user is operational level
 */
export function isOperationalRole(role: UserRole): boolean {
  return OPERATIONAL_ROLES.includes(role);
}

/**
 * Middleware to restrict strategic roles from write operations
 */
export function blockStrategicWrite(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (isStrategicRole(req.user.role) && req.method !== 'GET') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Nível estratégico não pode editar dados operacionais. Apenas visualização permitida.',
      code: 'STRATEGIC_WRITE_BLOCKED'
    });
  }

  next();
}

/**
 * Middleware to ensure user can only access their unit's data
 */
export function enforceUnitScope(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Strategic roles can access all units
  if (isStrategicRole(req.user.role)) {
    return next();
  }

  // Other roles must have unitId
  if (!req.user.unitId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Usuário não está vinculado a uma unidade',
      code: 'NO_UNIT_ASSIGNED'
    });
  }

  // Check if resource belongs to user's unit
  const resourceUnitId = req.body?.unitId || req.params?.unitId || req.query?.unitId as string;
  
  if (resourceUnitId && resourceUnitId !== req.user.unitId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Você não pode acessar dados de outra unidade',
      code: 'CROSS_UNIT_ACCESS_DENIED'
    });
  }

  next();
}

export default {
  checkPermission,
  rbacMiddleware,
  isStrategicRole,
  isTacticalRole,
  isOperationalRole,
  blockStrategicWrite,
  enforceUnitScope
};
