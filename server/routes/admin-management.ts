import { Router, Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, checkPermission } from '../middleware/rbac.middleware.js';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authMiddleware);

// ==========================================
// EMPLOYEE MANAGEMENT (Funcionários)
// ==========================================

/**
 * GET /api/employees
 * List all employees in the unit (or all if ADMIN_MATRIZ)
 */
router.get('/employees', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Build filter based on role
    const where: any = {};
    
    // If not strategic level, filter by unit
    if (!['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(user.role)) {
      where.unitId = user.unitId;
    }
    
    const employees = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        role: true,
        isActive: true,
        unitId: true,
        unit: {
          select: {
            id: true,
            name: true,
          }
        },
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
    
    res.json(employees);
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

/**
 * POST /api/employees
 * Create new employee (user)
 * Rule: Prevent DIRETOR from creating ADMIN_MATRIZ
 */
router.post('/employees', rbacMiddleware('employee' as any, 'WRITE' as any), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, email, cpf, phone, role, password, unitId } = req.body;
    
    // Validation
    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'Missing required fields: name, email, role, password' });
    }
    
    // SECURITY RULE: Prevent non-strategic users from creating strategic roles
    if (!['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(user.role)) {
      if (['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(role)) {
        return res.status(403).json({ 
          error: 'Forbidden: You cannot create users with strategic roles (ADMIN_MATRIZ, GESTOR_REDE)' 
        });
      }
    }
    
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Determine unitId: use provided or fallback to creator's unit
    const finalUnitId = unitId || user.unitId;
    
    // Create user
    const newEmployee = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        phone,
        role: role as UserRole,
        passwordHash,
        unitId: finalUnitId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        unitId: true,
        createdAt: true,
      },
    });
    
    res.status(201).json(newEmployee);
  } catch (error: any) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

/**
 * PUT /api/employees/:id
 * Update employee information
 */
router.put('/employees/:id', rbacMiddleware('employee' as any, 'WRITE' as any), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { name, email, cpf, phone, role, isActive, unitId } = req.body;
    
    // Check if employee exists
    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // SECURITY: Prevent changing role to strategic if user is not strategic
    if (role && !['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(user.role)) {
      if (['ADMIN_MATRIZ', 'GESTOR_REDE'].includes(role)) {
        return res.status(403).json({ 
          error: 'Forbidden: You cannot assign strategic roles' 
        });
      }
    }
    
    // Update employee
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(cpf !== undefined && { cpf }),
        ...(phone !== undefined && { phone }),
        ...(role && { role: role as UserRole }),
        ...(isActive !== undefined && { isActive }),
        ...(unitId && { unitId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        unitId: true,
        updatedAt: true,
      },
    });
    
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

/**
 * DELETE /api/employees/:id
 * Deactivate employee (soft delete)
 */
router.delete('/employees/:id', rbacMiddleware('employee' as any, 'WRITE' as any), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete: set isActive to false
    const deactivated = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });
    
    res.json({ message: 'Employee deactivated successfully', employee: deactivated });
  } catch (error: any) {
    console.error('Error deactivating employee:', error);
    res.status(500).json({ error: 'Failed to deactivate employee' });
  }
});

// ==========================================
// STUDENT MANAGEMENT (Alunos + Saúde)
// ==========================================

/**
 * POST /api/students
 * Create student with health profile in single payload
 */
router.post('/students', rbacMiddleware('student', 'WRITE'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { 
      // Personal data
      name, birthDate, cpf, email, enrollmentId, classId, unitId,
      // Health profile
      bloodType, hasAllergy, allergyDetails, dietaryRestrictions,
      hasSpecialNeeds, medicalReport, medications, emergencyContact, susNumber
    } = req.body;
    
    // Validation
    if (!name || !birthDate || !classId) {
      return res.status(400).json({ error: 'Missing required fields: name, birthDate, classId' });
    }
    
    // Determine unitId
    const finalUnitId = unitId || user.unitId;
    
    // Create student with health profile
    const newStudent = await prisma.student.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        cpf,
        email,
        enrollmentId,
        classId,
        unitId: finalUnitId,
        status: 'ACTIVE',
        // Create health profile if any health data provided
        ...(bloodType || hasAllergy || hasSpecialNeeds ? {
          healthProfile: {
            create: {
              bloodType,
              hasAllergy: hasAllergy || false,
              allergyDetails,
              dietaryRestrictions,
              hasSpecialNeeds: hasSpecialNeeds || false,
              medicalReport,
              medications,
              emergencyContact,
              susNumber,
            }
          }
        } : {}),
      },
      include: {
        healthProfile: true,
        class: {
          select: {
            id: true,
            name: true,
          }
        },
        unit: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    });
    
    res.status(201).json(newStudent);
  } catch (error: any) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

/**
 * PUT /api/students/:id/health
 * Update student health profile
 */
router.put('/students/:id/health', rbacMiddleware('student', 'WRITE'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      bloodType, hasAllergy, allergyDetails, dietaryRestrictions,
      hasSpecialNeeds, medicalReport, medications, emergencyContact, susNumber
    } = req.body;
    
    // Check if student exists
    const student = await prisma.student.findUnique({ 
      where: { id },
      include: { healthProfile: true },
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Upsert health profile
    const healthProfile = await prisma.studentHealthProfile.upsert({
      where: { studentId: id },
      update: {
        ...(bloodType !== undefined && { bloodType }),
        ...(hasAllergy !== undefined && { hasAllergy }),
        ...(allergyDetails !== undefined && { allergyDetails }),
        ...(dietaryRestrictions !== undefined && { dietaryRestrictions }),
        ...(hasSpecialNeeds !== undefined && { hasSpecialNeeds }),
        ...(medicalReport !== undefined && { medicalReport }),
        ...(medications !== undefined && { medications }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(susNumber !== undefined && { susNumber }),
      },
      create: {
        studentId: id,
        bloodType,
        hasAllergy: hasAllergy || false,
        allergyDetails,
        dietaryRestrictions,
        hasSpecialNeeds: hasSpecialNeeds || false,
        medicalReport,
        medications,
        emergencyContact,
        susNumber,
      },
    });
    
    res.json(healthProfile);
  } catch (error: any) {
    console.error('Error updating health profile:', error);
    res.status(500).json({ error: 'Failed to update health profile' });
  }
});

/**
 * GET /api/students/:id/health
 * Get student health profile
 */
router.get('/students/:id/health', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const healthProfile = await prisma.studentHealthProfile.findUnique({
      where: { studentId: id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });
    
    if (!healthProfile) {
      return res.status(404).json({ error: 'Health profile not found' });
    }
    
    res.json(healthProfile);
  } catch (error: any) {
    console.error('Error fetching health profile:', error);
    res.status(500).json({ error: 'Failed to fetch health profile' });
  }
});

// ==========================================
// STUDENT OBSERVATIONS (Observações)
// ==========================================

/**
 * POST /api/observations
 * Create new observation
 */
router.post('/observations', rbacMiddleware('observation' as any, 'WRITE' as any), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { studentId, type, title, description, isPrivate } = req.body;
    
    // Validation
    if (!studentId || !type || !title || !description) {
      return res.status(400).json({ error: 'Missing required fields: studentId, type, title, description' });
    }
    
    // Create observation
    const observation = await prisma.studentObservation.create({
      data: {
        studentId,
        authorId: user.id,
        type,
        title,
        description,
        isPrivate: isPrivate || false,
        date: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        student: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    });
    
    res.status(201).json(observation);
  } catch (error: any) {
    console.error('Error creating observation:', error);
    res.status(500).json({ error: 'Failed to create observation' });
  }
});

/**
 * GET /api/observations/student/:id
 * Get all observations for a student
 * Filter private observations if user is PROFESSOR
 */
router.get('/observations/student/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    // Build filter
    const where: any = { studentId: id };
    
    // If user is PROFESSOR, hide private observations
    if (user.role === 'PROFESSOR') {
      where.isPrivate = false;
    }
    
    const observations = await prisma.studentObservation.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
      },
      orderBy: { date: 'desc' },
    });
    
    res.json(observations);
  } catch (error: any) {
    console.error('Error fetching observations:', error);
    res.status(500).json({ error: 'Failed to fetch observations' });
  }
});

/**
 * PUT /api/observations/:id
 * Update observation
 */
router.put('/observations/:id', rbacMiddleware('observation' as any, 'WRITE' as any), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { type, title, description, isPrivate } = req.body;
    
    // Check if observation exists and belongs to user (or user is admin)
    const observation = await prisma.studentObservation.findUnique({ where: { id } });
    if (!observation) {
      return res.status(404).json({ error: 'Observation not found' });
    }
    
    // Only author or admin can edit
    if (observation.authorId !== user.id && !['ADMIN_MATRIZ', 'GESTOR_REDE', 'DIRETOR_UNIDADE'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own observations' });
    }
    
    // Update observation
    const updated = await prisma.studentObservation.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(description && { description }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
      },
    });
    
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating observation:', error);
    res.status(500).json({ error: 'Failed to update observation' });
  }
});

/**
 * DELETE /api/observations/:id
 * Delete observation
 */
router.delete('/observations/:id', rbacMiddleware('observation' as any, 'WRITE' as any), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    // Check if observation exists
    const observation = await prisma.studentObservation.findUnique({ where: { id } });
    if (!observation) {
      return res.status(404).json({ error: 'Observation not found' });
    }
    
    // Only author or admin can delete
    if (observation.authorId !== user.id && !['ADMIN_MATRIZ', 'GESTOR_REDE', 'DIRETOR_UNIDADE'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own observations' });
    }
    
    await prisma.studentObservation.delete({ where: { id } });
    
    res.json({ message: 'Observation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting observation:', error);
    res.status(500).json({ error: 'Failed to delete observation' });
  }
});

export default router;
