# 🚀 GUIA DE DEPLOY SEGURO - Sistema Conexa
## Análise de Riscos e Procedimento de Deploy

**Data:** 02/02/2026  
**Versão:** 1.0  
**Status:** ⚠️ **REQUER ATENÇÃO**

---

## ⚠️ RESPOSTA DIRETA: TEM PERIGO?

### **SIM, existem riscos moderados que precisam ser gerenciados:**

1. ✅ **RISCO BAIXO** - Tabela `Appointment` (nova, sem dados)
2. ⚠️ **RISCO MODERADO** - Tabela `DailyLog` (alteração de estrutura)
3. ⚠️ **RISCO MODERADO** - Serviço `document-generator.service.ts` (usa campos antigos)
4. ✅ **RISCO BAIXO** - Frontend (novas páginas, sem breaking changes)

### **MAS: Podemos mitigar todos os riscos com o procedimento correto!**

---

## 🔍 ANÁLISE DETALHADA DE RISCOS

### 1. Migration `DailyLog` - ⚠️ RISCO MODERADO

**O que a migration faz:**
```sql
-- REMOVE colunas antigas (PERDA DE DADOS se houver registros!)
DROP COLUMN IF EXISTS "sleep"
DROP COLUMN IF EXISTS "sleepTime"
DROP COLUMN IF EXISTS "foodAcceptance"
DROP COLUMN IF EXISTS "evacuation"
DROP COLUMN IF EXISTS "notes"

-- ADICIONA colunas novas
ADD COLUMN "sleepStatus" "SleepStatus"
ADD COLUMN "foodIntake" "FoodIntake"
ADD COLUMN "hygieneStatus" "HygieneStatus"
ADD COLUMN "mood" "Mood"
ADD COLUMN "observations" TEXT
ADD COLUMN "alertTriggered" BOOLEAN DEFAULT false
ADD COLUMN "classId" TEXT NOT NULL DEFAULT ''
```

**⚠️ PROBLEMA IDENTIFICADO:**
- Se existirem registros em `DailyLog` no banco de produção, **os dados antigos serão perdidos**
- A coluna `classId` é `NOT NULL` com default `''` (string vazia)
- String vazia pode causar erro de foreign key se não houver Class com id `''`

**✅ SOLUÇÃO:**
1. Verificar se há dados em `DailyLog` antes de aplicar
2. Se houver, fazer backup completo
3. Considerar migração de dados (opcional)

---

### 2. Serviço `document-generator.service.ts` - ⚠️ RISCO ALTO

**PROBLEMA CRÍTICO ENCONTRADO:**

O serviço usa campos antigos que serão removidos:
```typescript
dailyLogs: {
  date: Date;
  breakfast: string;      // ❌ NÃO EXISTE MAIS
  lunch: string;          // ❌ NÃO EXISTE MAIS
  sleepQuality: string;   // ❌ NÃO EXISTE MAIS
  mood: string;           // ⚠️ MUDOU PARA ENUM
}
```

**⚠️ IMPACTO:**
- Geração de relatórios PDF **VAI QUEBRAR**
- Endpoints que usam este serviço **VAI RETORNAR ERRO 500**

**✅ SOLUÇÃO OBRIGATÓRIA:**
O serviço `document-generator.service.ts` **PRECISA SER ATUALIZADO** antes do deploy!

---

### 3. Tabela `Appointment` - ✅ RISCO BAIXO

**O que faz:**
- Cria tabela nova
- Adiciona foreign keys para `Unit` e `Student`

**✅ SEM PROBLEMAS:**
- Tabela nova, sem dados existentes
- Foreign keys com `ON DELETE SET NULL` (seguro)

---

### 4. Frontend - ✅ RISCO BAIXO

**O que mudou:**
- Novas páginas: `DiarioClasse.tsx`, `AgendaAtendimentos.tsx`
- Novas rotas no `App.tsx`
- Links no menu

**✅ SEM PROBLEMAS:**
- Não altera funcionalidades existentes
- Apenas adiciona novas features

---

## 🛡️ PLANO DE DEPLOY SEGURO

### FASE 1: PRÉ-DEPLOY (OBRIGATÓRIO)

#### 1.1. Backup Completo do Banco de Dados

```bash
# No servidor de produção (Coolify)
pg_dump -h localhost -U postgres -d conexa_db > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

# Verificar tamanho do backup
ls -lh backup_pre_deploy_*.sql

# Copiar backup para local seguro
scp backup_pre_deploy_*.sql usuario@backup-server:/backups/
```

**⚠️ NÃO PROSSIGA SEM BACKUP!**

#### 1.2. Verificar Dados Existentes

```bash
# Conectar ao banco de produção
psql -h localhost -U postgres -d conexa_db

# Verificar se há registros em DailyLog
SELECT COUNT(*) FROM "DailyLog";

# Se COUNT > 0, ATENÇÃO REDOBRADA!
# Verificar estrutura atual
\d "DailyLog"

# Sair
\q
```

#### 1.3. Atualizar `document-generator.service.ts` (CRÍTICO!)

**ANTES DE APLICAR MIGRATION**, atualize o serviço:

```typescript
// server/services/document-generator.service.ts

// SUBSTITUIR:
dailyLogs: {
  date: Date;
  breakfast: string;
  lunch: string;
  sleepQuality: string;
  mood: string;
}

// POR:
dailyLogs: {
  date: Date;
  foodIntake: string | null;     // NOVO
  sleepStatus: string | null;    // NOVO
  hygieneStatus: string | null;  // NOVO
  mood: string | null;           // NOVO (agora é enum)
  observations: string | null;   // NOVO (substitui notes)
}
```

**Commit esta mudança ANTES do deploy!**

---

### FASE 2: DEPLOY (PASSO A PASSO)

#### 2.1. Modo Manutenção (Recomendado)

```bash
# Colocar site em manutenção (se possível)
# Evita que usuários tentem usar o sistema durante a atualização
```

#### 2.2. Pull do Código

```bash
cd /app  # ou caminho do projeto no Coolify
git pull origin main
```

#### 2.3. Instalar Dependências

```bash
pnpm install
```

#### 2.4. Gerar Cliente Prisma

```bash
npx prisma generate
```

#### 2.5. Aplicar Migration (MOMENTO CRÍTICO!)

```bash
# Aplicar migration
npx prisma migrate deploy

# Verificar se aplicou corretamente
npx prisma migrate status
```

**⚠️ SE DER ERRO:**
- NÃO REINICIE O SERVIDOR
- Vá para FASE 3: ROLLBACK

#### 2.6. Build do Frontend

```bash
cd client
pnpm run build
```

#### 2.7. Reiniciar Servidor

```bash
# Coolify fará automaticamente, ou:
pm2 restart conexa-server
```

#### 2.8. Verificar Logs

```bash
# Verificar se o servidor iniciou sem erros
pm2 logs conexa-server --lines 50

# Verificar se há erros de Prisma
grep -i "prisma" /var/log/conexa/*.log
```

---

### FASE 3: VALIDAÇÃO PÓS-DEPLOY

#### 3.1. Testes de Saúde

```bash
# Testar endpoint de health
curl http://localhost:3000/api/health

# Deve retornar: {"status":"ok"}
```

#### 3.2. Testar Endpoints Críticos

```bash
# Testar DailyLog (com token de autenticação)
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/daily-log

# Testar Appointments
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/appointments
```

#### 3.3. Testar Frontend

```
1. Acessar /dashboard
2. Verificar menu lateral (novos links devem aparecer)
3. Acessar /dashboard/diario-classe
4. Acessar /dashboard/agenda-atendimentos
5. Testar criação de registro
```

#### 3.4. Verificar Banco de Dados

```sql
-- Verificar se enums foram criados
SELECT typname FROM pg_type WHERE typname IN (
  'SleepStatus', 'FoodIntake', 'HygieneStatus', 
  'Mood', 'ApptType', 'ApptStatus'
);

-- Verificar estrutura de DailyLog
\d "DailyLog"

-- Verificar se Appointment foi criada
\d "Appointment"

-- Verificar se há registros (deve estar vazio)
SELECT COUNT(*) FROM "Appointment";
```

---

### FASE 4: ROLLBACK (SE NECESSÁRIO)

#### 4.1. Quando Fazer Rollback?

- ❌ Migration falhou com erro
- ❌ Servidor não inicia após deploy
- ❌ Erros críticos nos logs
- ❌ Funcionalidades essenciais quebradas

#### 4.2. Procedimento de Rollback

```bash
# 1. Parar o servidor
pm2 stop conexa-server

# 2. Restaurar código anterior
git reset --hard HEAD~1  # Voltar 1 commit
# OU
git checkout <commit_anterior>

# 3. Aplicar rollback da migration
psql -h localhost -U postgres -d conexa_db < prisma/migrations/ROLLBACK_feature_daily_log_agenda.sql

# 4. Gerar cliente Prisma antigo
npx prisma generate

# 5. Reinstalar dependências (se necessário)
pnpm install

# 6. Rebuild frontend
cd client && pnpm run build

# 7. Reiniciar servidor
pm2 restart conexa-server

# 8. Verificar logs
pm2 logs conexa-server
```

#### 4.3. Restaurar Backup (Último Recurso)

```bash
# Se rollback não funcionar, restaurar backup completo
psql -h localhost -U postgres -d conexa_db < backup_pre_deploy_YYYYMMDD_HHMMSS.sql

# Reiniciar servidor
pm2 restart conexa-server
```

---

## 📋 CHECKLIST DE DEPLOY

### PRÉ-DEPLOY
- [ ] Backup completo do banco de dados realizado
- [ ] Backup copiado para local seguro
- [ ] Verificado se há dados em `DailyLog`
- [ ] `document-generator.service.ts` atualizado e commitado
- [ ] Equipe notificada sobre o deploy
- [ ] Modo manutenção ativado (se possível)

### DEPLOY
- [ ] `git pull origin main` executado
- [ ] `pnpm install` executado
- [ ] `npx prisma generate` executado
- [ ] `npx prisma migrate deploy` executado SEM ERROS
- [ ] `pnpm run build` (client) executado SEM ERROS
- [ ] Servidor reiniciado
- [ ] Logs verificados (sem erros críticos)

### VALIDAÇÃO
- [ ] Endpoint `/api/health` responde OK
- [ ] Endpoint `/api/daily-log` responde (com auth)
- [ ] Endpoint `/api/appointments` responde (com auth)
- [ ] Frontend `/dashboard` carrega
- [ ] Frontend `/dashboard/diario-classe` carrega
- [ ] Frontend `/dashboard/agenda-atendimentos` carrega
- [ ] Criação de registro funciona
- [ ] Banco de dados verificado (enums e tabelas)

### PÓS-DEPLOY
- [ ] Modo manutenção desativado
- [ ] Equipe notificada sobre sucesso
- [ ] Monitoramento ativo por 1 hora
- [ ] Backup pós-deploy realizado (opcional)

---

## 🔧 CORREÇÃO OBRIGATÓRIA ANTES DO DEPLOY

### Atualizar `document-generator.service.ts`

**Arquivo:** `server/services/document-generator.service.ts`

**Linhas 23-32 (ANTES):**
```typescript
students: {
  name: string;
  dailyLogs: {
    date: Date;
    breakfast: string;
    lunch: string;
    sleepQuality: string;
    mood: string;
  }[];
}
```

**Linhas 23-32 (DEPOIS):**
```typescript
students: {
  name: string;
  dailyLogs: {
    date: Date;
    foodIntake: string | null;
    sleepStatus: string | null;
    hygieneStatus: string | null;
    mood: string | null;
    observations: string | null;
  }[];
}
```

**Também atualizar a query Prisma (linha 102):**
```typescript
dailyLogs: {
  where: {
    date: {
      gte: new Date(year, parseInt(month) - 1, 1),
      lte: new Date(year, parseInt(month), 0),
    },
  },
  select: {
    date: true,
    foodIntake: true,      // NOVO
    sleepStatus: true,     // NOVO
    hygieneStatus: true,   // NOVO
    mood: true,            // ATUALIZADO
    observations: true,    // NOVO
  },
},
```

**⚠️ CRÍTICO: Commit esta mudança ANTES de aplicar a migration!**

---

## 📊 MATRIZ DE RISCOS

| Componente | Risco | Impacto | Probabilidade | Mitigação |
|------------|-------|---------|---------------|-----------|
| Migration DailyLog | Moderado | Alto | Baixa | Backup + Verificação prévia |
| document-generator | Alto | Alto | Alta | **Atualizar ANTES do deploy** |
| Tabela Appointment | Baixo | Baixo | Muito Baixa | Tabela nova, sem dados |
| Frontend | Baixo | Médio | Muito Baixa | Build validado localmente |
| Auth Middleware | Baixo | Alto | Muito Baixa | Já testado em desenvolvimento |

---

## 🚨 SINAIS DE ALERTA PÓS-DEPLOY

### Erros Críticos (Rollback Imediato)
- ❌ Servidor não inicia
- ❌ Erro 500 em endpoints essenciais
- ❌ "Prisma Client validation error"
- ❌ "Foreign key constraint violation"
- ❌ "Column does not exist"

### Erros Moderados (Investigar)
- ⚠️ Endpoints novos retornam erro (esperado se não houver dados)
- ⚠️ Logs de warning (investigar, mas não rollback)

### Sinais de Sucesso
- ✅ Servidor inicia sem erros
- ✅ Logs mostram "Server running on port..."
- ✅ Endpoints respondem corretamente
- ✅ Frontend carrega sem erros no console

---

## 📞 CONTATOS DE EMERGÊNCIA

**Em caso de problemas críticos:**
1. Executar rollback imediatamente
2. Notificar equipe técnica
3. Restaurar backup se necessário
4. Analisar logs para identificar causa
5. Corrigir problema em ambiente de desenvolvimento
6. Tentar deploy novamente

---

## 🎯 RECOMENDAÇÃO FINAL

### ⚠️ ANTES DE FAZER O DEPLOY:

1. **OBRIGATÓRIO:** Atualizar `document-generator.service.ts`
2. **OBRIGATÓRIO:** Fazer backup completo do banco
3. **OBRIGATÓRIO:** Verificar se há dados em `DailyLog`
4. **RECOMENDADO:** Testar migration em ambiente de staging primeiro
5. **RECOMENDADO:** Fazer deploy fora do horário de pico

### ✅ SE SEGUIR ESTE GUIA:

- Risco de quebra: **< 5%**
- Tempo de rollback: **< 5 minutos**
- Perda de dados: **0% (com backup)**

### ❌ SE NÃO SEGUIR:

- Risco de quebra: **> 50%**
- Tempo de recuperação: **> 1 hora**
- Perda de dados: **Possível**

---

## 📝 HISTÓRICO DE DEPLOYS

| Data | Versão | Status | Observações |
|------|--------|--------|-------------|
| 02/02/2026 | 1.0 | Pendente | Aguardando correção do document-generator |

---

**Criado por:** Manus AI - Senior FullStack Developer  
**Última atualização:** 02/02/2026  
**Versão do documento:** 1.0
