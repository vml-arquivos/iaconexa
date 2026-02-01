import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ==========================================
// INTERFACES
// ==========================================

interface FinancialRecord {
  id: string;
  studentId: string;
  studentName: string;
  guardianName: string;
  guardianPhone?: string;
  classId: string;
  className: string;
  classLevel?: string;
  type: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  month?: number;
  year?: number;
}

interface FinancialSummary {
  totalReceivable: number;
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  inadimplenciaRate: number;
}

interface ClassSummary {
  classId: string;
  className: string;
  level?: string;
  totalStudents: number;
  totalReceivable: number;
  totalReceived: number;
  totalOverdue: number;
  inadimplenciaRate: number;
}

// ==========================================
// MOCK DATA (Substituir por tabela real)
// ==========================================

const mockFinancialRecords: FinancialRecord[] = [
  // Turma: Infantil 1
  { id: '1', studentId: 's1', studentName: 'Ana Silva', guardianName: 'João Silva', guardianPhone: '11999990001', classId: 'c1', className: 'Infantil 1', classLevel: 'Educação Infantil', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1200.00, dueDate: '2026-01-10', paidDate: '2026-01-08', status: 'PAGO', month: 1, year: 2026 },
  { id: '2', studentId: 's1', studentName: 'Ana Silva', guardianName: 'João Silva', guardianPhone: '11999990001', classId: 'c1', className: 'Infantil 1', classLevel: 'Educação Infantil', type: 'MENSALIDADE', description: 'Mensalidade Fevereiro/2026', amount: 1200.00, dueDate: '2026-02-10', status: 'PENDENTE', month: 2, year: 2026 },
  { id: '3', studentId: 's2', studentName: 'Pedro Santos', guardianName: 'Maria Santos', guardianPhone: '11999990002', classId: 'c1', className: 'Infantil 1', classLevel: 'Educação Infantil', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1200.00, dueDate: '2026-01-10', status: 'ATRASADO', month: 1, year: 2026 },
  { id: '4', studentId: 's2', studentName: 'Pedro Santos', guardianName: 'Maria Santos', guardianPhone: '11999990002', classId: 'c1', className: 'Infantil 1', classLevel: 'Educação Infantil', type: 'MATERIAL', description: 'Material Didático', amount: 450.00, dueDate: '2026-01-15', paidDate: '2026-01-15', status: 'PAGO' },
  
  // Turma: 3º Ano
  { id: '5', studentId: 's3', studentName: 'Lucas Oliveira', guardianName: 'Carlos Oliveira', guardianPhone: '11999990003', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1500.00, dueDate: '2026-01-10', paidDate: '2026-01-10', status: 'PAGO', month: 1, year: 2026 },
  { id: '6', studentId: 's3', studentName: 'Lucas Oliveira', guardianName: 'Carlos Oliveira', guardianPhone: '11999990003', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Fevereiro/2026', amount: 1500.00, dueDate: '2026-02-10', status: 'PENDENTE', month: 2, year: 2026 },
  { id: '7', studentId: 's4', studentName: 'Julia Costa', guardianName: 'Roberto Costa', guardianPhone: '11999990004', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1500.00, dueDate: '2026-01-10', status: 'ATRASADO', month: 1, year: 2026 },
  { id: '8', studentId: 's4', studentName: 'Julia Costa', guardianName: 'Roberto Costa', guardianPhone: '11999990004', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'EVENTO', description: 'Excursão Museu', amount: 120.00, dueDate: '2026-03-20', status: 'PENDENTE' },
  { id: '9', studentId: 's5', studentName: 'Gabriel Ferreira', guardianName: 'Fernanda Ferreira', guardianPhone: '11999990005', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1500.00, dueDate: '2026-01-10', status: 'ATRASADO', month: 1, year: 2026 },
  
  // Turma: 5º Ano
  { id: '10', studentId: 's6', studentName: 'Mariana Lima', guardianName: 'Paulo Lima', guardianPhone: '11999990006', classId: 'c3', className: '5º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1600.00, dueDate: '2026-01-10', paidDate: '2026-01-05', status: 'PAGO', month: 1, year: 2026 },
  { id: '11', studentId: 's6', studentName: 'Mariana Lima', guardianName: 'Paulo Lima', guardianPhone: '11999990006', classId: 'c3', className: '5º Ano', classLevel: 'Ensino Fundamental', type: 'TAXA', description: 'Taxa de Matrícula', amount: 300.00, dueDate: '2026-01-05', paidDate: '2026-01-05', status: 'PAGO' },
  { id: '12', studentId: 's7', studentName: 'Rafael Souza', guardianName: 'Amanda Souza', guardianPhone: '11999990007', classId: 'c3', className: '5º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1600.00, dueDate: '2026-01-10', paidDate: '2026-01-10', status: 'PAGO', month: 1, year: 2026 },
];

// ==========================================
// ROTAS
// ==========================================

/**
 * GET /api/finance/records
 * Lista todos os registros financeiros com filtros
 */
router.get('/records', async (req: Request, res: Response) => {
  try {
    const { 
      guardianName, 
      classId, 
      category, 
      status, 
      dateFrom, 
      dateTo,
      studentId,
      search 
    } = req.query;

    let records = [...mockFinancialRecords];

    // Aplicar filtros
    if (guardianName && guardianName !== 'all') {
      records = records.filter(r => r.guardianName === guardianName);
    }

    if (classId && classId !== 'all') {
      records = records.filter(r => r.classId === classId);
    }

    if (category && category !== 'all') {
      records = records.filter(r => r.type === category);
    }

    if (status && status !== 'all') {
      records = records.filter(r => r.status === status);
    }

    if (studentId) {
      records = records.filter(r => r.studentId === studentId);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom as string);
      records = records.filter(r => new Date(r.dueDate) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo as string);
      records = records.filter(r => new Date(r.dueDate) <= toDate);
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      records = records.filter(r => 
        r.studentName.toLowerCase().includes(searchLower) ||
        r.guardianName.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
      );
    }

    res.json(records);
  } catch (error) {
    console.error('Erro ao buscar registros financeiros:', error);
    res.status(500).json({ error: 'Erro ao buscar registros financeiros' });
  }
});

/**
 * GET /api/finance/summary
 * Retorna resumo financeiro com totais
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { guardianName, classId, category, dateFrom, dateTo } = req.query;

    let records = [...mockFinancialRecords];

    // Aplicar mesmos filtros
    if (guardianName && guardianName !== 'all') {
      records = records.filter(r => r.guardianName === guardianName);
    }
    if (classId && classId !== 'all') {
      records = records.filter(r => r.classId === classId);
    }
    if (category && category !== 'all') {
      records = records.filter(r => r.type === category);
    }
    if (dateFrom) {
      records = records.filter(r => new Date(r.dueDate) >= new Date(dateFrom as string));
    }
    if (dateTo) {
      records = records.filter(r => new Date(r.dueDate) <= new Date(dateTo as string));
    }

    const totalReceivable = records.reduce((sum, r) => sum + r.amount, 0);
    const totalReceived = records.filter(r => r.status === 'PAGO').reduce((sum, r) => sum + r.amount, 0);
    const totalPending = records.filter(r => r.status === 'PENDENTE').reduce((sum, r) => sum + r.amount, 0);
    const totalOverdue = records.filter(r => r.status === 'ATRASADO').reduce((sum, r) => sum + r.amount, 0);
    const inadimplenciaRate = totalReceivable > 0 ? (totalOverdue / totalReceivable) * 100 : 0;

    const summary: FinancialSummary = {
      totalReceivable,
      totalReceived,
      totalPending,
      totalOverdue,
      inadimplenciaRate
    };

    res.json(summary);
  } catch (error) {
    console.error('Erro ao calcular resumo financeiro:', error);
    res.status(500).json({ error: 'Erro ao calcular resumo financeiro' });
  }
});

/**
 * GET /api/finance/by-class
 * Retorna resumo de inadimplência por turma
 */
router.get('/by-class', async (req: Request, res: Response) => {
  try {
    const classMap = new Map<string, ClassSummary>();

    mockFinancialRecords.forEach(record => {
      if (!classMap.has(record.classId)) {
        classMap.set(record.classId, {
          classId: record.classId,
          className: record.className,
          level: record.classLevel,
          totalStudents: 0,
          totalReceivable: 0,
          totalReceived: 0,
          totalOverdue: 0,
          inadimplenciaRate: 0
        });
      }

      const summary = classMap.get(record.classId)!;
      summary.totalReceivable += record.amount;
      if (record.status === 'PAGO') summary.totalReceived += record.amount;
      if (record.status === 'ATRASADO') summary.totalOverdue += record.amount;
    });

    // Calcular taxa de inadimplência e contar alunos
    classMap.forEach(summary => {
      summary.inadimplenciaRate = summary.totalReceivable > 0 
        ? (summary.totalOverdue / summary.totalReceivable) * 100 
        : 0;
      summary.totalStudents = mockFinancialRecords
        .filter(r => r.classId === summary.classId)
        .map(r => r.studentId)
        .filter((v, i, a) => a.indexOf(v) === i).length;
    });

    const result = Array.from(classMap.values()).sort((a, b) => b.inadimplenciaRate - a.inadimplenciaRate);

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar resumo por turma:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo por turma' });
  }
});

/**
 * GET /api/finance/by-guardian/:guardianName
 * Retorna resumo financeiro de um responsável específico
 */
router.get('/by-guardian/:guardianName', async (req: Request, res: Response) => {
  try {
    const { guardianName } = req.params;
    const { year } = req.query;

    let records = mockFinancialRecords.filter(r => r.guardianName === guardianName);

    if (year) {
      records = records.filter(r => r.year === parseInt(year as string));
    }

    if (records.length === 0) {
      return res.status(404).json({ error: 'Responsável não encontrado' });
    }

    const summary = {
      guardianName,
      studentName: records[0].studentName,
      studentId: records[0].studentId,
      totalPaid: records.filter(r => r.status === 'PAGO').reduce((sum, r) => sum + r.amount, 0),
      totalPending: records.filter(r => r.status === 'PENDENTE').reduce((sum, r) => sum + r.amount, 0),
      totalOverdue: records.filter(r => r.status === 'ATRASADO').reduce((sum, r) => sum + r.amount, 0),
      records
    };

    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar dados do responsável:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do responsável' });
  }
});

/**
 * GET /api/finance/guardians
 * Lista todos os responsáveis únicos
 */
router.get('/guardians', async (req: Request, res: Response) => {
  try {
    const guardians = [...new Set(mockFinancialRecords.map(r => r.guardianName))].sort();
    res.json(guardians);
  } catch (error) {
    console.error('Erro ao listar responsáveis:', error);
    res.status(500).json({ error: 'Erro ao listar responsáveis' });
  }
});

/**
 * GET /api/finance/classes
 * Lista todas as turmas únicas
 */
router.get('/classes', async (req: Request, res: Response) => {
  try {
    const classesMap = new Map();
    mockFinancialRecords.forEach(r => {
      if (!classesMap.has(r.classId)) {
        classesMap.set(r.classId, { id: r.classId, name: r.className, level: r.classLevel });
      }
    });
    res.json(Array.from(classesMap.values()));
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json({ error: 'Erro ao listar turmas' });
  }
});

/**
 * GET /api/finance/student/:studentId
 * Retorna histórico financeiro de um aluno
 */
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const records = mockFinancialRecords.filter(r => r.studentId === studentId);

    if (records.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const summary = {
      studentId,
      studentName: records[0].studentName,
      guardianName: records[0].guardianName,
      guardianPhone: records[0].guardianPhone,
      className: records[0].className,
      totalPaid: records.filter(r => r.status === 'PAGO').reduce((sum, r) => sum + r.amount, 0),
      totalPending: records.filter(r => r.status === 'PENDENTE').reduce((sum, r) => sum + r.amount, 0),
      totalOverdue: records.filter(r => r.status === 'ATRASADO').reduce((sum, r) => sum + r.amount, 0),
      isInadimplente: records.some(r => r.status === 'ATRASADO'),
      records
    };

    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar histórico do aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico do aluno' });
  }
});

export default router;
