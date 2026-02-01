// ========================================
// SISTEMA VALENTE - RBAC Middleware
// Proteção Global de Multi-Tenancy
// ========================================

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Estender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        schoolId: string | null;
        classId: string | null;
      };
    }
  }
}

// ========================================
// HIERARQUIA DE PERMISSÕES
// ========================================

const ROLE_HIERARCHY = {
  // NÍVEL 1: MATRIZ (Acesso total)
  MATRIZ_ADMIN: {
    level: 1,
    canAccessAllSchools: true,
    canCreateSchools: true,
    canAccessPsychRecords: false,
  },
  MATRIZ_COORD: {
    level: 1,
    canAccessAllSchools: true,
    canCreateSchools: false,
    canAccessPsychRecords: false,
  },
  MATRIZ_NUTRI: {
    level: 1,
    canAccessAllSchools: true,
    canCreateSchools: false,
    canAccessPsychRecords: false,
  },
  MATRIZ_PSYCHO: {
    level: 1,
    canAccessAllSchools: true,
    canCreateSchools: false,
    canAccessPsychRecords: true, // ÚNICO com acesso
  },
  
  // NÍVEL 2: UNIDADE (Gestão local)
  UNIT_DIRECTOR: {
    level: 2,
    canAccessAllSchools: false,
    canApproveRequests: true,
    canManageEmployees: true,
  },
  UNIT_SECRETARY: {
    level: 2,
    canAccessAllSchools: false,
    canManageEnrollments: true,
    canIssueCertificates: true,
  },
  
  // NÍVEL 3: SALA DE AULA (Visão restrita)
  TEACHER: {
    level: 3,
    canAccessAllSchools: false,
    canAccessOnlyOwnClass: true,
  },
};

// ========================================
// MIDDLEWARE: Verificar Autenticação
// ========================================

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verificar se o token JWT está presente
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    // Aqui você deve validar o JWT e extrair o userId
    // Por enquanto, vamos simular (você deve implementar JWT real)
    const userId = 'user-id-from-jwt'; // TODO: Extrair do JWT
    
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        schoolId: true,
        classId: true,
        isActive: true,
      },
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    }
    
    // Anexar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ error: 'Erro ao autenticar' });
  }
};

// ========================================
// MIDDLEWARE: Injetar Filtro de Multi-Tenancy
// ========================================

export const injectSchoolFilter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  const userRole = ROLE_HIERARCHY[req.user.role];
  
  // Se for MATRIZ, não precisa de filtro (acessa tudo)
  if (userRole.canAccessAllSchools) {
    return next();
  }
  
  // Se for UNIT ou TEACHER, DEVE ter schoolId
  if (!req.user.schoolId) {
    return res.status(403).json({ 
      error: 'Usuário sem unidade associada' 
    });
  }
  
  // Injetar schoolId em todas as queries do Prisma
  // Isso será feito via Prisma Middleware (veja abaixo)
  
  next();
};

// ========================================
// MIDDLEWARE: Verificar Permissão de Turma (TEACHER)
// ========================================

export const requireClassAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  // Se for TEACHER, verificar se tem acesso à turma
  if (req.user.role === 'TEACHER') {
    const classId = req.params.classId || req.body.classId || req.query.classId;
    
    if (!classId) {
      return res.status(400).json({ 
        error: 'classId é obrigatório para professores' 
      });
    }
    
    if (req.user.classId !== classId) {
      return res.status(403).json({ 
        error: 'Você não tem acesso a esta turma' 
      });
    }
  }
  
  next();
};

// ========================================
// MIDDLEWARE: Verificar Permissão de Prontuário Psicológico
// ========================================

export const requirePsychAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  // Apenas MATRIZ_PSYCHO pode acessar prontuários
  if (req.user.role !== 'MATRIZ_PSYCHO') {
    return res.status(403).json({ 
      error: 'Acesso negado: apenas psicólogos podem acessar prontuários' 
    });
  }
  
  next();
};

// ========================================
// MIDDLEWARE: Verificar Permissão de Aprovação
// ========================================

export const requireApprovalPermission = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  const allowedRoles: UserRole[] = [
    'MATRIZ_ADMIN',
    'UNIT_DIRECTOR',
  ];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Você não tem permissão para aprovar requisições' 
    });
  }
  
  next();
};

// ========================================
// PRISMA MIDDLEWARE: Injeção Automática de schoolId
// ========================================

export const setupPrismaMiddleware = () => {
  prisma.$use(async (params, next) => {
    // Lista de modelos que precisam de filtro de schoolId
    const modelsWithSchool = [
      'Student',
      'Class',
      'DailyLog',
      'PsychologicalRecord',
      'InventoryItem',
      'InventoryRequest',
      'BNCCPlanning',
      'Supplier',
    ];
    
    // Verificar se o modelo precisa de filtro
    if (modelsWithSchool.includes(params.model || '')) {
      // Aqui você pode injetar o schoolId baseado no contexto
      // Por enquanto, vamos apenas logar (você deve implementar a lógica real)
      
      // Exemplo de injeção:
      // if (params.action === 'findMany' || params.action === 'findFirst') {
      //   params.args.where = {
      //     ...params.args.where,
      //     schoolId: currentUserSchoolId,
      //   };
      // }
    }
    
    return next(params);
  });
};

// ========================================
// HELPER: Verificar se usuário pode acessar escola
// ========================================

export const canAccessSchool = (
  userRole: UserRole,
  userSchoolId: string | null,
  targetSchoolId: string
): boolean => {
  const roleConfig = ROLE_HIERARCHY[userRole];
  
  // MATRIZ pode acessar qualquer escola
  if (roleConfig.canAccessAllSchools) {
    return true;
  }
  
  // Outros só podem acessar sua própria escola
  return userSchoolId === targetSchoolId;
};

// ========================================
// HELPER: Verificar se usuário pode criar escola
// ========================================

export const canCreateSchool = (userRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole]?.canCreateSchools || false;
};

// ========================================
// HELPER: Verificar se usuário pode aprovar requisições
// ========================================

export const canApproveRequests = (userRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole]?.canApproveRequests || false;
};

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  requireAuth,
  injectSchoolFilter,
  requireClassAccess,
  requirePsychAccess,
  requireApprovalPermission,
  setupPrismaMiddleware,
  canAccessSchool,
  canCreateSchool,
  canApproveRequests,
};
