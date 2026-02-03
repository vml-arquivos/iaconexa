#!/usr/bin/env node
/**
 * SCRIPT DE DIAGNÓSTICO - TESTE DE CONEXÃO COM BANCO DE DADOS
 * 
 * Este script testa a conexão com o banco de dados PostgreSQL
 * e identifica problemas de runtime que podem causar loop de restart.
 * 
 * USO:
 *   node test-connection.js
 * 
 * OU no container:
 *   docker exec <container_id> node /app/server/test-connection.js
 */

console.log('\n🔍 ===== DIAGNÓSTICO DE CONEXÃO - CONEXA v1.1 =====\n');

// ==========================================
// 1. VERIFICAR VARIÁVEIS DE AMBIENTE
// ==========================================

console.log('📋 Verificando variáveis de ambiente obrigatórias...\n');

const requiredEnvVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'NODE_ENV': process.env.NODE_ENV || 'development',
  'PORT': process.env.PORT || '3001',
  'JWT_SECRET': process.env.JWT_SECRET || 'dev_secret_change_me_in_production',
  'CORS_ORIGIN': process.env.CORS_ORIGIN || '*',
};

let hasEnvErrors = false;

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`❌ ERRO: Variável ${key} não está definida!`);
    hasEnvErrors = true;
  } else if (key === 'DATABASE_URL') {
    // Mascarar senha na URL do banco
    const maskedUrl = value.replace(/:([^:@]+)@/, ':****@');
    console.log(`✅ ${key}: ${maskedUrl}`);
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

if (hasEnvErrors) {
  console.error('\n❌ FALHA: Variáveis de ambiente obrigatórias faltando!');
  console.error('Configure as variáveis no painel do Coolify e reinicie o container.\n');
  process.exit(1);
}

console.log('\n✅ Todas as variáveis obrigatórias estão definidas.\n');

// ==========================================
// 2. TESTAR CONEXÃO COM PRISMA
// ==========================================

console.log('🔌 Testando conexão com banco de dados via Prisma...\n');

import('@prisma/client').then(async ({ PrismaClient }) => {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('⏳ Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Testar uma query simples
    console.log('⏳ Executando query de teste...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executada com sucesso:', result);

    // Verificar se há tabelas no banco
    console.log('\n⏳ Verificando tabelas no banco...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log(`✅ Banco contém ${tables.length} tabelas:`);
      tables.slice(0, 10).forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
      });
      if (tables.length > 10) {
        console.log(`   ... e mais ${tables.length - 10} tabelas`);
      }
    } else {
      console.warn('⚠️  AVISO: Banco de dados está vazio! Execute as migrations.');
    }

    await prisma.$disconnect();
    console.log('\n✅ Prisma desconectado com sucesso.\n');
    console.log('🎉 DIAGNÓSTICO COMPLETO: Conexão com banco de dados está OK!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO ao conectar com banco de dados:');
    console.error(error);
    
    if (error.code === 'P1001') {
      console.error('\n💡 DICA: O servidor de banco de dados não está acessível.');
      console.error('   - Verifique se o container do banco está rodando');
      console.error('   - Verifique a URL de conexão (DATABASE_URL)');
      console.error('   - Verifique as configurações de rede do Docker/Coolify');
    } else if (error.code === 'P1003') {
      console.error('\n💡 DICA: O banco de dados não existe.');
      console.error('   - Crie o banco de dados antes de iniciar o servidor');
      console.error('   - Verifique o nome do banco na DATABASE_URL');
    } else if (error.code === 'P1010') {
      console.error('\n💡 DICA: Credenciais de acesso inválidas.');
      console.error('   - Verifique o usuário e senha na DATABASE_URL');
    }

    await prisma.$disconnect();
    console.error('\n❌ DIAGNÓSTICO FALHOU: Problema de conexão com banco de dados.\n');
    process.exit(1);
  }
}).catch((error) => {
  console.error('\n❌ ERRO ao importar @prisma/client:');
  console.error(error);
  console.error('\n💡 DICA: Execute "pnpm exec prisma generate" para gerar o Prisma Client.\n');
  process.exit(1);
});
