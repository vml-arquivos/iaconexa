/**
 * TEMPORARY ROUTE - Seed Test Users
 * Sistema Conexa v1.0
 * 
 * Rota temporária para popular banco com usuários de teste
 * REMOVER EM PRODUÇÃO!
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

const DEFAULT_PASSWORD = '123456';
const SALT_ROUNDS = 10;

/**
 * GET /api/seed-test-users
 * 
 * Popula o banco com usuários de teste para validação RBAC
 * ⚠️ USAR APENAS EM DESENVOLVIMENTO/STAGING
 */
router.get('/api/seed-test-users', async (req, res) => {
  try {
    console.log('🌱 [SEED] Iniciando seed de usuários de teste...');

    // Hash da senha padrão
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    // ==========================================
    // 1. CRIAR ASSOCIAÇÃO (se não existir)
    // ==========================================
    const association = await prisma.association.upsert({
      where: { cnpj: '00.000.000/0001-00' },
      update: {},
      create: {
        name: 'Associação Conexa',
        cnpj: '00.000.000/0001-00',
        address: 'Rua Principal, 123',
        phone: '(11) 1234-5678',
        email: 'contato@conexa.com',
      },
    });

    // ==========================================
    // 2. CRIAR UNIDADES
    // ==========================================
    const unidadeSede = await prisma.unit.upsert({
      where: { code: 'SEDE' },
      update: {},
      create: {
        name: 'Unidade Sede',
        code: 'SEDE',
        address: 'Av. Central, 1000',
        phone: '(11) 9999-0001',
        email: 'sede@conexa.com',
        type: 'MATRIZ',
        associationId: association.id,
        moduloPedagogico: true,
        moduloDiario: true,
        moduloCRM: true,
        moduloFinanceiro: true,
        moduloSuprimentos: true,
      },
    });

    const unidadeFilial = await prisma.unit.upsert({
      where: { code: 'FILIAL-01' },
      update: {},
      create: {
        name: 'Unidade Filial 01',
        code: 'FILIAL-01',
        address: 'Rua Secundária, 500',
        phone: '(11) 9999-0002',
        email: 'filial01@conexa.com',
        type: 'UNIDADE',
        associationId: association.id,
        moduloPedagogico: true,
        moduloDiario: true,
        moduloCRM: false,
        moduloFinanceiro: false,
        moduloSuprimentos: true,
      },
    });

    // ==========================================
    // 3. CRIAR USUÁRIOS DE TESTE
    // ==========================================
    const users = [
      {
        email: 'admin@conexa.com',
        name: 'Admin Matriz',
        role: 'MATRIZ_ADMIN',
        unitId: null,
        description: 'Super Admin - Acesso Total',
      },
      {
        email: 'adm@conexa.com',
        name: 'Secretário Administrativo',
        role: 'SECRETARIO',
        unitId: unidadeSede.id,
        description: 'Secretaria - Visão Admin Limitada',
      },
      {
        email: 'geral@conexa.com',
        name: 'Coordenador Geral',
        role: 'COORDENADOR_GERAL',
        unitId: null,
        description: 'Coordenador Geral - Visão de Todas as Unidades',
      },
      {
        email: 'diretor@conexa.com',
        name: 'Diretor da Filial',
        role: 'DIRETOR_UNIDADE',
        unitId: unidadeFilial.id,
        description: 'Diretor - Restrito à Unidade Filial',
      },
      {
        email: 'coordenador@conexa.com',
        name: 'Coordenador Pedagógico',
        role: 'COORDENADOR_PEDAGOGICO',
        unitId: unidadeFilial.id,
        description: 'Coordenador Pedagógico - Restrito à Unidade Filial',
      },
      {
        email: 'nutri@conexa.com',
        name: 'Nutricionista',
        role: 'NUTRICIONISTA',
        unitId: unidadeFilial.id,
        description: 'Nutricionista - Gestão de Saúde e Alimentação',
      },
      {
        email: 'psi@conexa.com',
        name: 'Psicólogo',
        role: 'PSICOLOGO',
        unitId: unidadeFilial.id,
        description: 'Psicólogo - Atendimento e Acompanhamento',
      },
      {
        email: 'prof@conexa.com',
        name: 'Professor',
        role: 'PROFESSOR',
        unitId: unidadeFilial.id,
        description: 'Professor - Acesso às suas turmas',
      },
    ];

    const createdUsers = [];

    for (const userData of users) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          passwordHash,
          role: userData.role as any,
          unitId: userData.unitId,
        },
        create: {
          email: userData.email,
          name: userData.name,
          passwordHash,
          role: userData.role as any,
          unitId: userData.unitId,
          isActive: true,
        },
      });

      createdUsers.push({
        email: user.email,
        name: user.name,
        role: user.role,
        description: userData.description,
      });

      console.log(`✅ [SEED] ${user.email} | ${user.role}`);
    }

    res.json({
      success: true,
      message: 'Usuários de teste criados com sucesso!',
      defaultPassword: DEFAULT_PASSWORD,
      association: {
        name: association.name,
        id: association.id,
      },
      units: [
        { name: unidadeSede.name, code: unidadeSede.code, type: unidadeSede.type },
        { name: unidadeFilial.name, code: unidadeFilial.code, type: unidadeFilial.type },
      ],
      users: createdUsers,
    });

  } catch (error: any) {
    console.error('❌ [SEED] Erro ao criar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar usuários de teste',
      details: error.message,
    });
  }
});

export default router;
