import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import agentRoutes from '../routes/agent.js';
import employeeRoutes from '../routes/employees-advanced.js';
import documentRoutes from '../routes/documents.js';
import procurementRoutes from '../routes/procurement.js';
import materialOrderRoutes from '../routes/material-orders.js';
import studentRoutes from '../routes/students-advanced.js';
import financeRoutes from '../routes/finance.js';
import n8nRoutes from '../routes/n8n-conversas.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ==========================================
// ROTAS DE SAÚDE
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'CONEXA v1.1', timestamp: new Date() });
});

// ==========================================
// ROTAS PRINCIPAIS
// ==========================================

// Rotas do Agente de IA
app.use('/api/agent', agentRoutes);

// Rotas de Funcionários
app.use('/api/employees', employeeRoutes);

// Rotas de Documentos
app.use('/api/documents', documentRoutes);

// Rotas de Compras
app.use('/api/procurement', procurementRoutes);

// Rotas de Alunos Avançadas
app.use('/api/students', studentRoutes);

// Rotas de Pedidos por Turma
app.use('/api/material-orders', materialOrderRoutes);

// ==========================================
// NOVAS ROTAS - CRM 360º & FINANCEIRO
// ==========================================

// Rotas Financeiras (Painel Inteligente)
app.use('/api/finance', financeRoutes);

// Rotas de Integração N8N/WhatsApp
app.use('/api/n8n', n8nRoutes);

// ==========================================
// ROTAS LEGADAS (Compatibilidade)
// ==========================================

// Rota de Alunos (legado)
app.get('/api/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: true,
        school: true,
        documents: true
      }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// Rota para atualizar aluno
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.update({
      where: { id },
      data: req.body,
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// Rota de Estoque
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await prisma.inventoryItem.findMany();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
});

// Rota para atualizar item de estoque
app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar estoque' });
  }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CONEXA Server v1.1 rodando na porta ${PORT}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   - /api/health          (Health Check)`);
  console.log(`   - /api/agent           (Agente de IA)`);
  console.log(`   - /api/students        (Alunos)`);
  console.log(`   - /api/employees       (Funcionários)`);
  console.log(`   - /api/documents       (Documentos)`);
  console.log(`   - /api/procurement     (Compras)`);
  console.log(`   - /api/material-orders (Pedidos)`);
  console.log(`   - /api/finance         (Financeiro) [NEW]`);
  console.log(`   - /api/n8n             (WhatsApp/N8N) [NEW]`);
});
