// ========================================
// SISTEMA CONEXA v1.0
// Serviço: Geração de Documentos (PDFs Oficiais)
// "Conectando Vidas"
// ========================================

import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ========================================
// TIPOS E INTERFACES
// ========================================

interface DiarioClasseData {
  schoolName: string;
  className: string;
  month: string;
  year: number;
  students: {
    name: string;
    dailyLogs: {
      date: Date;
      breakfast: string;
      lunch: string;
      sleepQuality: string;
      mood: string;
    }[];
  }[];
}

interface RIAData {
  studentName: string;
  birthDate: Date;
  className: string;
  schoolName: string;
  period: string;
  
  // Análises
  frequencyAnalysis: {
    totalDays: number;
    presentDays: number;
    attendanceRate: number;
  };
  
  developmentAnalysis: {
    bnccFields: {
      name: string;
      activities: number;
      observations: string;
    }[];
  };
  
  socialEmotionalAnalysis: {
    moodSummary: Record<string, number>;
    behaviorNotes: string[];
  };
  
  healthAnalysis: {
    feedingPattern: string;
    sleepPattern: string;
    alerts: string[];
  };
  
  // Texto descritivo (gerado por IA)
  descriptiveText: string;
}

// ========================================
// DIÁRIO DE CLASSE (PDF)
// ========================================

/**
 * Gera Diário de Classe mensal em PDF
 * 
 * Formato oficial com:
 * - Cabeçalho (escola, turma, mês/ano)
 * - Tabela de frequência
 * - Observações diárias
 * - Assinaturas
 * 
 * @param classId - ID da turma
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Caminho do arquivo PDF gerado
 */
export async function generateDiarioClasse(
  classId: string,
  month: number,
  year: number
): Promise<string> {
  // 1. Buscar dados
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      school: true,
      students: {
        include: {
          dailyLogs: {
            where: {
              date: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
            orderBy: { date: 'asc' },
          },
        },
      },
    },
  });
  
  if (!classData) {
    throw new Error(`Turma ${classId} não encontrada`);
  }
  
  // 2. Criar PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const fileName = `diario_classe_${classData.name}_${month}_${year}.pdf`;
  const filePath = path.join('/tmp', fileName);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);
  
  // 3. Cabeçalho
  doc.fontSize(18).font('Helvetica-Bold').text('DIÁRIO DE CLASSE', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).font('Helvetica');
  doc.text(`Escola: ${classData.school.name}`);
  doc.text(`Turma: ${classData.name} (${classData.level})`);
  doc.text(`Período: ${getMonthName(month)}/${year}`);
  doc.moveDown();
  
  // 4. Tabela de Frequência
  doc.fontSize(14).font('Helvetica-Bold').text('Frequência', { underline: true });
  doc.moveDown();
  
  for (const student of classData.students) {
    doc.fontSize(10).font('Helvetica-Bold').text(student.name);
    doc.fontSize(9).font('Helvetica');
    
    const logsCount = student.dailyLogs.length;
    const daysInMonth = new Date(year, month, 0).getDate();
    const attendanceRate = ((logsCount / daysInMonth) * 100).toFixed(1);
    
    doc.text(`  Dias presentes: ${logsCount}/${daysInMonth} (${attendanceRate}%)`);
    doc.moveDown(0.5);
  }
  
  doc.moveDown();
  
  // 5. Observações Gerais
  doc.fontSize(14).font('Helvetica-Bold').text('Observações do Período', { underline: true });
  doc.moveDown();
  doc.fontSize(10).font('Helvetica');
  doc.text(
    'A turma apresentou bom desenvolvimento durante o período, com participação ativa nas atividades propostas. ' +
    'As crianças demonstraram evolução nas habilidades socioemocionais e cognitivas.'
  );
  doc.moveDown();
  
  // 6. Assinaturas
  doc.moveDown(2);
  doc.fontSize(10);
  doc.text('_'.repeat(40), 50, doc.y, { align: 'left' });
  doc.text('Professor(a)', 50, doc.y + 5);
  
  doc.text('_'.repeat(40), 350, doc.y - 20, { align: 'left' });
  doc.text('Diretor(a)', 350, doc.y + 5);
  
  // 7. Finalizar
  doc.end();
  
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

// ========================================
// RIA - RELATÓRIO INDIVIDUAL (PDF)
// ========================================

/**
 * Gera RIA (Relatório Individual do Aluno) em PDF
 * 
 * Formato oficial com:
 * - Dados do aluno
 * - Análise de frequência
 * - Desenvolvimento BNCC
 * - Análise socioemocional
 * - Análise de saúde
 * - Texto descritivo (IA)
 * 
 * @param studentId - ID do aluno
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns Caminho do arquivo PDF gerado
 */
export async function generateRIA(
  studentId: string,
  startDate: Date,
  endDate: Date
): Promise<string> {
  // 1. Buscar dados
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: true,
      class: true,
      dailyLogs: {
        where: {
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'asc' },
      },
    },
  });
  
  if (!student) {
    throw new Error(`Aluno ${studentId} não encontrado`);
  }
  
  // 2. Análises
  const riaData = await analyzeStudentData(student, startDate, endDate);
  
  // 3. Criar PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const fileName = `ria_${student.name.replace(/\s/g, '_')}_${Date.now()}.pdf`;
  const filePath = path.join('/tmp', fileName);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);
  
  // 4. Cabeçalho
  doc.fontSize(18).font('Helvetica-Bold').text('RELATÓRIO INDIVIDUAL DO ALUNO', { align: 'center' });
  doc.moveDown();
  
  // 5. Dados do Aluno
  doc.fontSize(14).font('Helvetica-Bold').text('Dados do Aluno', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Nome: ${student.name}`);
  doc.text(`Data de Nascimento: ${student.birthDate.toLocaleDateString('pt-BR')}`);
  doc.text(`Idade: ${calculateAge(student.birthDate)} anos`);
  doc.text(`Turma: ${student.class?.name || 'N/A'}`);
  doc.text(`Escola: ${student.school.name}`);
  doc.text(`Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`);
  doc.moveDown();
  
  // 6. Frequência
  doc.fontSize(14).font('Helvetica-Bold').text('Frequência', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total de dias: ${riaData.frequencyAnalysis.totalDays}`);
  doc.text(`Dias presentes: ${riaData.frequencyAnalysis.presentDays}`);
  doc.text(`Taxa de presença: ${riaData.frequencyAnalysis.attendanceRate}%`);
  doc.moveDown();
  
  // 7. Desenvolvimento BNCC
  doc.fontSize(14).font('Helvetica-Bold').text('Desenvolvimento (BNCC)', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  for (const field of riaData.developmentAnalysis.bnccFields) {
    doc.font('Helvetica-Bold').text(`${field.name}:`);
    doc.font('Helvetica').text(`  ${field.observations}`);
    doc.moveDown(0.5);
  }
  doc.moveDown();
  
  // 8. Análise Socioemocional
  doc.fontSize(14).font('Helvetica-Bold').text('Análise Socioemocional', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text('Humor predominante:');
  for (const [mood, count] of Object.entries(riaData.socialEmotionalAnalysis.moodSummary)) {
    doc.text(`  • ${mood}: ${count} dias`);
  }
  doc.moveDown();
  
  // 9. Saúde e Rotina
  doc.fontSize(14).font('Helvetica-Bold').text('Saúde e Rotina', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Padrão alimentar: ${riaData.healthAnalysis.feedingPattern}`);
  doc.text(`Padrão de sono: ${riaData.healthAnalysis.sleepPattern}`);
  if (riaData.healthAnalysis.alerts.length > 0) {
    doc.text('Alertas:');
    for (const alert of riaData.healthAnalysis.alerts) {
      doc.text(`  • ${alert}`);
    }
  }
  doc.moveDown();
  
  // 10. Texto Descritivo (IA)
  doc.fontSize(14).font('Helvetica-Bold').text('Parecer Descritivo', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  doc.text(riaData.descriptiveText, { align: 'justify' });
  doc.moveDown();
  
  // 11. Assinaturas
  doc.moveDown(2);
  doc.fontSize(10);
  doc.text('_'.repeat(40), 50, doc.y, { align: 'left' });
  doc.text('Professor(a)', 50, doc.y + 5);
  
  doc.text('_'.repeat(40), 350, doc.y - 20, { align: 'left' });
  doc.text('Coordenador(a)', 350, doc.y + 5);
  
  // 12. Finalizar
  doc.end();
  
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

// ========================================
// ANÁLISES AUTOMÁTICAS
// ========================================

/**
 * Analisa dados do aluno para gerar RIA
 */
async function analyzeStudentData(student: any, startDate: Date, endDate: Date): Promise<RIAData> {
  const logs = student.dailyLogs;
  
  // Frequência
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const presentDays = logs.length;
  const attendanceRate = ((presentDays / totalDays) * 100).toFixed(1);
  
  // Humor
  const moodSummary: Record<string, number> = {};
  for (const log of logs) {
    if (log.mood) {
      moodSummary[log.mood] = (moodSummary[log.mood] || 0) + 1;
    }
  }
  
  // Alimentação
  const feedingGood = logs.filter((l: any) => l.lunch === 'COMEU_TUDO').length;
  const feedingPattern = feedingGood > presentDays * 0.7 ? 'Excelente' : 'Regular';
  
  // Sono
  const sleepGood = logs.filter((l: any) => l.sleepQuality === 'BOM').length;
  const sleepPattern = sleepGood > presentDays * 0.7 ? 'Adequado' : 'Irregular';
  
  // Texto descritivo (IA)
  const descriptiveText = await generateDescriptiveText(student, logs, {
    attendanceRate: Number(attendanceRate),
    feedingPattern,
    sleepPattern,
    moodSummary,
  });
  
  return {
    studentName: student.name,
    birthDate: student.birthDate,
    className: student.class?.name || 'N/A',
    schoolName: student.school.name,
    period: `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`,
    frequencyAnalysis: {
      totalDays,
      presentDays,
      attendanceRate: Number(attendanceRate),
    },
    developmentAnalysis: {
      bnccFields: [
        {
          name: 'O eu, o outro e o nós',
          activities: 15,
          observations: 'Demonstra boa interação com colegas e educadores.',
        },
        {
          name: 'Corpo, gestos e movimentos',
          activities: 20,
          observations: 'Participa ativamente das atividades motoras.',
        },
      ],
    },
    socialEmotionalAnalysis: {
      moodSummary,
      behaviorNotes: ['Criança participativa', 'Demonstra curiosidade'],
    },
    healthAnalysis: {
      feedingPattern,
      sleepPattern,
      alerts: [],
    },
    descriptiveText,
  };
}

/**
 * Gera texto descritivo usando IA (OpenAI)
 */
async function generateDescriptiveText(student: any, logs: any[], analysis: any): Promise<string> {
  // TODO: Integrar com OpenAI para gerar texto personalizado
  
  return `${student.name} demonstrou excelente desenvolvimento durante o período avaliado. ` +
    `Com frequência de ${analysis.attendanceRate}%, a criança participou ativamente das atividades propostas. ` +
    `O padrão alimentar foi ${analysis.feedingPattern.toLowerCase()} e o sono ${analysis.sleepPattern.toLowerCase()}. ` +
    `Nas interações sociais, ${student.name} mostrou-se colaborativa e curiosa, contribuindo positivamente para o ambiente da turma. ` +
    `Recomenda-se a continuidade do acompanhamento pedagógico com foco no desenvolvimento integral.`;
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1];
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  generateDiarioClasse,
  generateRIA,
};
