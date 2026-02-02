// ========================================
// SISTEMA CONEXA v1.0
// Script de Seed - Dados Iniciais
// Estrutura Multi-Unidades e Hierarquia
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
  // 2. CRIAR UNIDADES (1 MATRIZ + 2 UNIDADES)
  // ========================================
  console.log('🏢 Criando estrutura de unidades...');

  const unitsData = [
    { 
      name: 'Matriz CoCris', 
      code: 'MATRIZ-001', 
      type: 'MATRIZ',
      phone: '(61) 3575-4125',
      address: 'SHIS QI 11 Conjunto 7 Casa 14, Brasília - DF',
      email: 'matriz@cocris.org',
      // Módulos ativos na Matriz
      moduloPedagogico: true,
      moduloDiario: true,
      moduloCRM: true,
      moduloFinanceiro: true,
      moduloSuprimentos: true,
    },
    { 
      name: 'CEPI Arara Canindé', 
      code: 'UNIDADE-001', 
      type: 'UNIDADE',
      phone: '(61) 3575-0001',
      address: 'Região Administrativa, Brasília - DF',
      email: 'arara@cocris.org',
      // Módulos ativos na Unidade 1
      moduloPedagogico: true,
      moduloDiario: true,
      moduloCRM: false,
      moduloFinanceiro: false,
      moduloSuprimentos: true,
    },
    { 
      name: 'CEPI Beija-Flor', 
      code: 'UNIDADE-002', 
      type: 'UNIDADE',
      phone: '(61) 3575-0002',
      address: 'Região Administrativa, Brasília - DF',
      email: 'beijaflor@cocris.org',
      // Módulos ativos na Unidade 2
      moduloPedagogico: true,
      moduloDiario: true,
      moduloCRM: false,
      moduloFinanceiro: false,
      moduloSuprimentos: true,
    },
  ];

  const createdUnits = [];

  for (const unitData of unitsData) {
    const unit = await prisma.unit.upsert({
      where: { code: unitData.code },
      update: {},
      create: {
        name: unitData.name,
        code: unitData.code,
        type: unitData.type as any,
        phone: unitData.phone,
        address: unitData.address,
        email: unitData.email,
        associationId: association.id,
        moduloPedagogico: unitData.moduloPedagogico,
        moduloDiario: unitData.moduloDiario,
        moduloCRM: unitData.moduloCRM,
        moduloFinanceiro: unitData.moduloFinanceiro,
        moduloSuprimentos: unitData.moduloSuprimentos,
      },
    });

    createdUnits.push(unit);
    console.log(`  ✅ ${unit.name} (${unit.type})`);
  }

  const matrizUnit = createdUnits[0];
  const unidade1 = createdUnits[1];
  const unidade2 = createdUnits[2];

  // ========================================
  // 3. CRIAR SCHOOLS (MANTER COMPATIBILIDADE)
  // ========================================
  console.log('🏫 Criando schools (compatibilidade)...');

  const schools = [
    { name: 'CEPI Arara Canindé', code: 'CEPI-001', phone: '(61) 3575-0001' },
    { name: 'CEPI Beija-Flor', code: 'CEPI-002', phone: '(61) 3575-0002' },
    { name: 'CEPI Sabiá', code: 'CEPI-003', phone: '(61) 3575-0003' },
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
  // 4. CRIAR USUÁRIOS COM HIERARQUIA
  // ========================================
  console.log('👥 Criando usuários hierárquicos...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // 4.1. MATRIZ_ADMIN (Matriz)
  await prisma.user.upsert({
    where: { email: 'admin@cocris.org' },
    update: {},
    create: {
      email: 'admin@cocris.org',
      passwordHash,
      name: 'Administrador CoCris',
      cpf: '000.000.000-00',
      phone: '(61) 99999-0000',
      role: 'MATRIZ_ADMIN',
      unitId: matrizUnit.id,
      isActive: true,
    },
  });
  console.log('  ✅ MATRIZ_ADMIN criado');

  // 4.2. COORDENADOR_GERAL (Matriz)
  await prisma.user.upsert({
    where: { email: 'coordenador.geral@cocris.org' },
    update: {},
    create: {
      email: 'coordenador.geral@cocris.org',
      passwordHash,
      name: 'Maria Coordenadora Geral',
      cpf: '111.111.111-11',
      phone: '(61) 99999-1111',
      role: 'COORDENADOR_GERAL',
      unitId: matrizUnit.id,
      isActive: true,
    },
  });
  console.log('  ✅ COORDENADOR_GERAL criado');

  // 4.3. NUTRICIONISTA (Matriz)
  await prisma.user.upsert({
    where: { email: 'nutri@cocris.org' },
    update: {},
    create: {
      email: 'nutri@cocris.org',
      passwordHash,
      name: 'Ana Nutricionista',
      cpf: '222.222.222-22',
      phone: '(61) 99999-2222',
      role: 'NUTRICIONISTA',
      unitId: matrizUnit.id,
      isActive: true,
    },
  });
  console.log('  ✅ NUTRICIONISTA criado');

  // 4.4. PSICOLOGO (Matriz)
  await prisma.user.upsert({
    where: { email: 'psicologo@cocris.org' },
    update: {},
    create: {
      email: 'psicologo@cocris.org',
      passwordHash,
      name: 'Carlos Psicólogo',
      cpf: '333.333.333-33',
      phone: '(61) 99999-3333',
      role: 'PSICOLOGO',
      unitId: matrizUnit.id,
      isActive: true,
    },
  });
  console.log('  ✅ PSICOLOGO criado');

  // 4.5. DIRETOR_UNIDADE (Unidade 1)
  await prisma.user.upsert({
    where: { email: 'diretor.unidade1@cocris.org' },
    update: {},
    create: {
      email: 'diretor.unidade1@cocris.org',
      passwordHash,
      name: 'João Diretor - Arara Canindé',
      cpf: '444.444.444-44',
      phone: '(61) 99999-4444',
      role: 'DIRETOR_UNIDADE',
      unitId: unidade1.id,
      schoolId: createdSchools[0].id,
      isActive: true,
    },
  });
  console.log('  ✅ DIRETOR_UNIDADE (Unidade 1) criado');

  // 4.6. COORDENADOR_PEDAGOGICO (Unidade 1)
  await prisma.user.upsert({
    where: { email: 'coord.ped.unidade1@cocris.org' },
    update: {},
    create: {
      email: 'coord.ped.unidade1@cocris.org',
      passwordHash,
      name: 'Beatriz Coordenadora Pedagógica - Arara',
      cpf: '555.555.555-55',
      phone: '(61) 99999-5555',
      role: 'COORDENADOR_PEDAGOGICO',
      unitId: unidade1.id,
      schoolId: createdSchools[0].id,
      isActive: true,
    },
  });
  console.log('  ✅ COORDENADOR_PEDAGOGICO (Unidade 1) criado');

  // 4.7. SECRETARIO (Unidade 1)
  await prisma.user.upsert({
    where: { email: 'secretario.unidade1@cocris.org' },
    update: {},
    create: {
      email: 'secretario.unidade1@cocris.org',
      passwordHash,
      name: 'Paula Secretária - Arara',
      cpf: '666.666.666-66',
      phone: '(61) 99999-6666',
      role: 'SECRETARIO',
      unitId: unidade1.id,
      schoolId: createdSchools[0].id,
      isActive: true,
    },
  });
  console.log('  ✅ SECRETARIO (Unidade 1) criado');

  // 4.8. PROFESSOR (Unidade 1)
  // Criar uma turma primeiro
  const class1 = await prisma.class.create({
    data: {
      name: 'Berçário 1 - Arara',
      level: '0-1 anos',
      capacity: 15,
      schoolId: createdSchools[0].id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'professor.unidade1@cocris.org' },
    update: {},
    create: {
      email: 'professor.unidade1@cocris.org',
      passwordHash,
      name: 'Carla Professora - Arara',
      cpf: '777.777.777-77',
      phone: '(61) 99999-7777',
      role: 'PROFESSOR',
      unitId: unidade1.id,
      schoolId: createdSchools[0].id,
      classId: class1.id,
      isActive: true,
    },
  });
  console.log('  ✅ PROFESSOR (Unidade 1) criado');

  // 4.9. DIRETOR_UNIDADE (Unidade 2)
  await prisma.user.upsert({
    where: { email: 'diretor.unidade2@cocris.org' },
    update: {},
    create: {
      email: 'diretor.unidade2@cocris.org',
      passwordHash,
      name: 'Roberto Diretor - Beija-Flor',
      cpf: '888.888.888-88',
      phone: '(61) 99999-8888',
      role: 'DIRETOR_UNIDADE',
      unitId: unidade2.id,
      schoolId: createdSchools[1].id,
      isActive: true,
    },
  });
  console.log('  ✅ DIRETOR_UNIDADE (Unidade 2) criado');

  // 4.10. PROFESSOR (Unidade 2)
  const class2 = await prisma.class.create({
    data: {
      name: 'Maternal 1 - Beija-Flor',
      level: '1-2 anos',
      capacity: 18,
      schoolId: createdSchools[1].id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'professor.unidade2@cocris.org' },
    update: {},
    create: {
      email: 'professor.unidade2@cocris.org',
      passwordHash,
      name: 'Fernanda Professora - Beija-Flor',
      cpf: '999.999.999-99',
      phone: '(61) 99999-9999',
      role: 'PROFESSOR',
      unitId: unidade2.id,
      schoolId: createdSchools[1].id,
      classId: class2.id,
      isActive: true,
    },
  });
  console.log('  ✅ PROFESSOR (Unidade 2) criado');

  // ========================================
  // 5. CRIAR ALUNOS VINCULADOS ÀS UNIDADES
  // ========================================
  console.log('👶 Criando alunos...');

  // Alunos Unidade 1
  await prisma.student.create({
    data: {
      name: 'Miguel Silva',
      birthDate: new Date('2025-03-15'),
      enrollmentId: 'MAT-2026-001',
      unitId: unidade1.id,
      schoolId: createdSchools[0].id,
      classId: class1.id,
      status: 'ACTIVE',
    },
  });

  await prisma.student.create({
    data: {
      name: 'Sofia Santos',
      birthDate: new Date('2025-05-20'),
      enrollmentId: 'MAT-2026-002',
      unitId: unidade1.id,
      schoolId: createdSchools[0].id,
      classId: class1.id,
      status: 'ACTIVE',
    },
  });

  // Alunos Unidade 2
  await prisma.student.create({
    data: {
      name: 'Lucas Oliveira',
      birthDate: new Date('2024-08-10'),
      enrollmentId: 'MAT-2026-003',
      unitId: unidade2.id,
      schoolId: createdSchools[1].id,
      classId: class2.id,
      status: 'ACTIVE',
    },
  });

  await prisma.student.create({
    data: {
      name: 'Isabella Costa',
      birthDate: new Date('2024-11-25'),
      enrollmentId: 'MAT-2026-004',
      unitId: unidade2.id,
      schoolId: createdSchools[1].id,
      classId: class2.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ 4 alunos criados (2 por unidade)');

  // ========================================
  // 6. CRIAR ITENS DE ESTOQUE (EXEMPLO)
  // ========================================
  console.log('📦 Criando itens de estoque...');

  const inventoryItems = [
    { name: 'Fralda P', category: 'HYGIENE', quantity: 500, unit: 'unidade', minThreshold: 100 },
    { name: 'Fralda M', category: 'HYGIENE', quantity: 400, unit: 'unidade', minThreshold: 100 },
    { name: 'Leite em Pó', category: 'FOOD', quantity: 50, unit: 'kg', minThreshold: 10 },
    { name: 'Sabonete Líquido', category: 'HYGIENE', quantity: 30, unit: 'litro', minThreshold: 5 },
    { name: 'Papel A4', category: 'PEDAGOGICAL', quantity: 100, unit: 'resma', minThreshold: 20 },
  ];

  for (const itemData of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        name: itemData.name,
        category: itemData.category as any,
        quantity: itemData.quantity,
        unit: itemData.unit,
        minThreshold: itemData.minThreshold,
        schoolId: createdSchools[0].id,
      },
    });
  }

  console.log('✅ Itens de estoque criados');

  // ========================================
  // 7. CRIAR CARDÁPIO GLOBAL (EXEMPLO)
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
  console.log(`  • 3 Unidades criadas (1 MATRIZ + 2 UNIDADES)`);
  console.log(`  • 3 Schools criadas (compatibilidade)`);
  console.log(`  • 10 Usuários criados com hierarquia`);
  console.log(`  • 2 Turmas criadas`);
  console.log(`  • 4 Alunos criados`);
  console.log(`  • 5 Itens de estoque criados`);
  console.log(`  • 1 Cardápio global criado`);
  console.log('\n👥 Hierarquia de Usuários:');
  console.log('  MATRIZ:');
  console.log('    • MATRIZ_ADMIN: admin@cocris.org');
  console.log('    • COORDENADOR_GERAL: coordenador.geral@cocris.org');
  console.log('    • NUTRICIONISTA: nutri@cocris.org');
  console.log('    • PSICOLOGO: psicologo@cocris.org');
  console.log('  UNIDADE 1 (Arara Canindé):');
  console.log('    • DIRETOR_UNIDADE: diretor.unidade1@cocris.org');
  console.log('    • COORDENADOR_PEDAGOGICO: coord.ped.unidade1@cocris.org');
  console.log('    • SECRETARIO: secretario.unidade1@cocris.org');
  console.log('    • PROFESSOR: professor.unidade1@cocris.org');
  console.log('  UNIDADE 2 (Beija-Flor):');
  console.log('    • DIRETOR_UNIDADE: diretor.unidade2@cocris.org');
  console.log('    • PROFESSOR: professor.unidade2@cocris.org');
  console.log('\n🔐 Senha padrão para todos: admin123');
  console.log('\n⚠️  IMPORTANTE: Altere as senhas após o primeiro login!');
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
