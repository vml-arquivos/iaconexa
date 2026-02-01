// ========================================
// SISTEMA CONEXA v1.0
// Script de Seed - Dados Iniciais
// ========================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ========================================
  // 1. CRIAR ASSOCIAÇÃO (MATRIZ)
  // ========================================
  console.log('📋 Criando Associação...');
  
  const association = await prisma.association.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      name: 'Associação Beneficente Coração de Cristo',
      cnpj: '00.000.000/0001-00',
      address: 'Brasília, DF',
      phone: '(61) 3575-4125',
      email: 'contato@cocris.org',
    },
  });

  console.log(`✅ Associação criada: ${association.name}`);

  // ========================================
  // 2. CRIAR 7 UNIDADES (SCHOOLS)
  // ========================================
  console.log('🏫 Criando 7 unidades...');

  const schools = [
    { name: 'CEPI Arara Canindé', code: 'CEPI-001', phone: '(61) 3575-0001' },
    { name: 'CEPI Beija-Flor', code: 'CEPI-002', phone: '(61) 3575-0002' },
    { name: 'CEPI Sabiá', code: 'CEPI-003', phone: '(61) 3575-0003' },
    { name: 'CEPI Tucano', code: 'CEPI-004', phone: '(61) 3575-0004' },
    { name: 'Creche CoCris Sede', code: 'CRECHE-001', phone: '(61) 3575-0005' },
    { name: 'Creche Comunitária Norte', code: 'CRECHE-002', phone: '(61) 3575-0006' },
    { name: 'Creche Comunitária Sul', code: 'CRECHE-003', phone: '(61) 3575-0007' },
  ];

  const createdSchools = [];

  for (const schoolData of schools) {
    const school = await prisma.school.upsert({
      where: { code: schoolData.code },
      update: {},
      create: {
        name: schoolData.name,
        code: schoolData.code,
        address: `Brasília, DF - ${schoolData.code}`,
        phone: schoolData.phone,
        email: `${schoolData.code.toLowerCase()}@cocris.org`,
        associationId: association.id,
      },
    });

    createdSchools.push(school);
    console.log(`  ✅ ${school.name}`);
  }

  // ========================================
  // 3. CRIAR USUÁRIO ADMIN (MATRIZ_ADMIN)
  // ========================================
  console.log('👤 Criando usuário ADMIN...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cocris.org' },
    update: {},
    create: {
      email: 'admin@cocris.org',
      passwordHash,
      name: 'Administrador CoCris',
      cpf: '000.000.000-00',
      phone: '(61) 99999-0000',
      role: 'MATRIZ_ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin criado: ${adminUser.email}`);

  // ========================================
  // 4. CRIAR USUÁRIOS DE TESTE
  // ========================================
  console.log('👥 Criando usuários de teste...');

  // Nutricionista
  await prisma.user.upsert({
    where: { email: 'nutri@cocris.org' },
    update: {},
    create: {
      email: 'nutri@cocris.org',
      passwordHash,
      name: 'Maria Nutricionista',
      role: 'MATRIZ_NUTRI',
      isActive: true,
    },
  });

  // Psicóloga
  await prisma.user.upsert({
    where: { email: 'psicologa@cocris.org' },
    update: {},
    create: {
      email: 'psicologa@cocris.org',
      passwordHash,
      name: 'Ana Psicóloga',
      role: 'MATRIZ_PSYCHO',
      isActive: true,
    },
  });

  // Diretor da primeira unidade
  await prisma.user.upsert({
    where: { email: 'diretor@cocris.org' },
    update: {},
    create: {
      email: 'diretor@cocris.org',
      passwordHash,
      name: 'João Diretor',
      role: 'UNIT_DIRECTOR',
      schoolId: createdSchools[0].id,
      isActive: true,
    },
  });

  // Professor da primeira unidade
  const firstSchool = createdSchools[0];
  
  // Criar uma turma primeiro
  const class1 = await prisma.class.create({
    data: {
      name: 'Berçário 1',
      level: '0-1 anos',
      capacity: 15,
      schoolId: firstSchool.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'professor@cocris.org' },
    update: {},
    create: {
      email: 'professor@cocris.org',
      passwordHash,
      name: 'Carla Professora',
      role: 'TEACHER',
      schoolId: firstSchool.id,
      classId: class1.id,
      isActive: true,
    },
  });

  console.log('✅ Usuários de teste criados');

  // ========================================
  // 5. CRIAR ITENS DE ESTOQUE (EXEMPLO)
  // ========================================
  console.log('📦 Criando itens de estoque...');

  const inventoryItems = [
    { name: 'Fralda P', category: 'HIGIENE', quantity: 500, unit: 'unidade', minThreshold: 100 },
    { name: 'Fralda M', category: 'HIGIENE', quantity: 400, unit: 'unidade', minThreshold: 100 },
    { name: 'Leite em Pó', category: 'ALIMENTO', quantity: 50, unit: 'kg', minThreshold: 10 },
    { name: 'Sabonete Líquido', category: 'HIGIENE', quantity: 30, unit: 'litro', minThreshold: 5 },
    { name: 'Papel A4', category: 'PEDAGOGICO', quantity: 100, unit: 'resma', minThreshold: 20 },
  ];

  for (const itemData of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        ...itemData,
        schoolId: firstSchool.id,
      },
    });
  }

  console.log('✅ Itens de estoque criados');

  // ========================================
  // 6. CRIAR CARDÁPIO GLOBAL (EXEMPLO)
  // ========================================
  console.log('🍽️ Criando cardápio global...');

  await prisma.menu.create({
    data: {
      name: 'Cardápio Semana 1',
      weekNumber: 1,
      year: 2026,
      meals: {
        monday: {
          breakfast: 'Leite com pão',
          lunch: 'Arroz, feijão, frango e salada',
          snack: 'Fruta e biscoito',
        },
        tuesday: {
          breakfast: 'Mingau de aveia',
          lunch: 'Macarrão com carne moída',
          snack: 'Suco e bolo',
        },
        wednesday: {
          breakfast: 'Leite com cereal',
          lunch: 'Arroz, feijão, peixe e legumes',
          snack: 'Iogurte e fruta',
        },
        thursday: {
          breakfast: 'Pão com manteiga e suco',
          lunch: 'Sopa de legumes com carne',
          snack: 'Fruta e bolacha',
        },
        friday: {
          breakfast: 'Leite com achocolatado',
          lunch: 'Arroz, feijão, frango e purê',
          snack: 'Vitamina de fruta',
        },
      },
      associationId: association.id,
    },
  });

  console.log('✅ Cardápio global criado');

  // ========================================
  // RESUMO
  // ========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 Resumo:');
  console.log(`  • 1 Associação criada`);
  console.log(`  • 7 Unidades criadas`);
  console.log(`  • 5 Usuários criados`);
  console.log(`  • 1 Turma criada`);
  console.log(`  • 5 Itens de estoque criados`);
  console.log(`  • 1 Cardápio global criado`);
  console.log('\n🔐 Credenciais de acesso:');
  console.log('  Email: admin@cocris.org');
  console.log('  Senha: admin123');
  console.log('\n⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
