/**
 * SEED SCRIPT - Test Users for RBAC Validation
 * Sistema Conexa v1.0
 * 
 * Popula o banco com usuários de teste para cada role do sistema
 * Senha padrão: 123456
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = '123456';
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Iniciando seed de usuários de teste...\n');

  // Hash da senha padrão
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // ==========================================
  // 1. CRIAR ASSOCIAÇÃO (se não existir)
  // ==========================================
  console.log('📋 Criando Associação...');
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
  console.log(`✅ Associação: ${association.name}\n`);

  // ==========================================
  // 2. CRIAR UNIDADES
  // ==========================================
  console.log('🏢 Criando Unidades...');
  
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
  console.log(`✅ Unidade Sede criada: ${unidadeSede.name}`);

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
  console.log(`✅ Unidade Filial criada: ${unidadeFilial.name}\n`);

  // ==========================================
  // 3. CRIAR USUÁRIOS DE TESTE
  // ==========================================
  console.log('👥 Criando usuários de teste...\n');

  const users = [
    {
      email: 'admin@conexa.com',
      name: 'Admin Matriz',
      role: 'MATRIZ_ADMIN',
      unitId: null, // Acesso global
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
      unitId: null, // Vê todas as unidades
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

    console.log(`✅ ${userData.email.padEnd(25)} | ${userData.role.padEnd(25)} | ${userData.description}`);
  }

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais de acesso:');
  console.log('   Senha padrão: 123456');
  console.log('   Emails disponíveis:');
  users.forEach(u => console.log(`   - ${u.email}`));
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
