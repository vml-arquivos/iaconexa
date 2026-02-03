# 🔍 DIAGNÓSTICO: LOOP DE RESTART DO CONTAINER

**Sistema:** CONEXA v1.1  
**Ambiente:** Coolify / DigitalOcean  
**Problema:** Container reinicia continuamente (build OK, runtime falha)

---

## 📋 ANÁLISE COMPLETA REALIZADA

### ✅ 1. CÓDIGO DO SERVIDOR (index.ts)

**Status:** ✅ **CÓDIGO ESTÁ PROTEGIDO CONTRA CRASHES**

| Linha | Componente | Proteção | Status |
|-------|------------|----------|--------|
| 39-44 | Conexão Prisma | `catch()` sem `process.exit()` | ✅ Não mata processo |
| 192-204 | Uncaught Exception | Handler que apenas loga | ✅ Não mata processo |
| 207-226 | Graceful Shutdown | SIGTERM/SIGINT handlers | ✅ Correto |
| 169 | Server Listen | Bind em `0.0.0.0:PORT` | ✅ Correto para Docker |

**Conclusão:** O código do servidor está bem escrito e **NÃO** deve causar crashes por si só.

---

### 📦 2. VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS

**Total identificado:** 20 variáveis

#### **Críticas (podem causar crash):**

| Variável | Obrigatória? | Fallback | Onde é usada |
|----------|--------------|----------|--------------|
| `DATABASE_URL` | ✅ SIM | ❌ Nenhum | Prisma Client (linha 33) |
| `PORT` | ⚠️ Recomendada | ✅ `3001` | Server listen (linha 168) |
| `JWT_SECRET` | ⚠️ Recomendada | ✅ `dev_secret...` | Auth middleware |
| `NODE_ENV` | ⚠️ Recomendada | ✅ `undefined` | Logging e paths |
| `CORS_ORIGIN` | ⚠️ Recomendada | ✅ `*` | CORS middleware |

#### **Opcionais (não causam crash):**

- `AGENT_SECRET` - Autenticação do agente IA
- `N8N_WEBHOOK_URL` - Integração WhatsApp
- `S3_*` - Upload de arquivos (S3/MinIO)
- `RATE_LIMIT_*` - Rate limiting
- `STORAGE_TYPE` - Tipo de storage

**Conclusão:** Apenas `DATABASE_URL` é **CRÍTICA**. Sem ela, o Prisma não consegue conectar.

---

### 🐘 3. ENTRYPOINT DO DOCKER

**Arquivo:** `infra/docker/docker-entrypoint.sh`

**Fluxo de inicialização:**

```
1. Gerar Prisma Client ✅
2. Aguardar PostgreSQL (pg_isready) ✅
   └─ Timeout: 60 segundos
   └─ Se falhar: exit 1 ❌ (CAUSA POTENCIAL DE RESTART)
3. Executar migrations ✅
   └─ Se falhar: exit 1 ❌ (CAUSA POTENCIAL DE RESTART)
4. Seed (se PRISMA_SEED_ENABLED=true) ⚠️
   └─ Se falhar: apenas aviso, continua ✅
5. Iniciar servidor (node dist/src/index.js) ✅
```

**⚠️ PONTOS DE FALHA IDENTIFICADOS:**

| Linha | Comando | Falha causa restart? | Motivo |
|-------|---------|----------------------|--------|
| 33-42 | `pg_isready` | ✅ SIM | `exit 1` se timeout |
| 55 | `prisma migrate deploy` | ✅ SIM | `exit 1` se falhar |
| 75-89 | `prisma db seed` | ❌ NÃO | Apenas aviso |
| 111 | `node dist/src/index.js` | ⚠️ DEPENDE | Se o Node crashar |

---

## 🎯 CAUSAS MAIS PROVÁVEIS DO LOOP DE RESTART

### **1. PostgreSQL não está acessível (60%)**

**Sintoma:**
```
⏳ Aguardando PostgreSQL... (60/60 segundos)
❌ ERRO: PostgreSQL não respondeu em 60 segundos
```

**Causas possíveis:**
- `DATABASE_URL` incorreta ou faltando
- Container do banco não está rodando
- Rede Docker mal configurada
- Firewall bloqueando conexão
- Host/porta errados na URL

**Solução:**
```bash
# No painel do Coolify, verificar:
1. Variável DATABASE_URL está definida?
2. Formato correto: postgresql://user:password@host:5432/database
3. Container do banco está "Running"?
4. Teste de conexão manual: docker exec <container> pg_isready -h <host> -p 5432
```

---

### **2. Migration falhando (30%)**

**Sintoma:**
```
🗄️ Executando migrations...
❌ ERRO: Falha ao executar migrations
```

**Causas possíveis:**
- Migration travada (já corrigimos com auto-heal)
- Banco com schema incompatível
- Permissões insuficientes no banco
- Timeout de conexão durante migration

**Solução:**
```bash
# Opção A: Resetar banco (CUIDADO: apaga dados)
docker exec <container> pnpm exec prisma migrate reset --force

# Opção B: Resolver migration manualmente
docker exec <container> pnpm exec prisma migrate resolve --applied <migration_name>
```

---

### **3. Porta em uso ou erro de bind (5%)**

**Sintoma:**
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3001
```

**Causas possíveis:**
- Outro processo usando porta 3001
- Coolify mapeou porta errada
- Múltiplos containers tentando usar mesma porta

**Solução:**
```bash
# Verificar mapeamento de portas no Coolify:
- Porta interna do container: 3001
- Porta externa (pode ser qualquer): definida pelo Coolify
```

---

### **4. Variável DATABASE_URL faltando (5%)**

**Sintoma:**
```
Invalid `prisma.$connect()` invocation:
Error: Environment variable not found: DATABASE_URL
```

**Solução:**
```bash
# No painel do Coolify:
1. Ir em "Environment Variables"
2. Adicionar: DATABASE_URL=postgresql://user:pass@host:5432/db
3. Salvar e reiniciar container
```

---

## 🛠️ SCRIPT DE DIAGNÓSTICO CRIADO

**Arquivo:** `server/test-connection.js`

**Como usar:**

```bash
# Opção 1: Executar no container rodando
docker exec <container_id> node /app/server/test-connection.js

# Opção 2: Executar localmente (com .env configurado)
cd server
node test-connection.js
```

**O que o script faz:**
1. ✅ Verifica todas as variáveis de ambiente obrigatórias
2. ✅ Testa conexão com Prisma
3. ✅ Executa query de teste
4. ✅ Lista tabelas no banco
5. ✅ Fornece dicas específicas para cada erro

---

## 📊 CHECKLIST DE VALIDAÇÃO

### **No Painel do Coolify:**

- [ ] Variável `DATABASE_URL` está definida?
- [ ] Container do banco de dados está "Running"?
- [ ] Logs do container mostram erro específico?
- [ ] Porta 3001 está mapeada corretamente?
- [ ] Health check está configurado (`/api/health`)?

### **Logs a Procurar:**

```bash
# Erro de conexão com banco:
❌ ERRO: PostgreSQL não respondeu em 60 segundos
❌ ERRO ao conectar Prisma: P1001

# Erro de migration:
❌ ERRO: Falha ao executar migrations
Error: P3009

# Erro de porta:
Error: listen EADDRINUSE

# Erro de variável:
Environment variable not found: DATABASE_URL
```

---

## 🚀 AÇÕES IMEDIATAS

### **1. Coletar Logs do Container**

```bash
# No painel do Coolify:
1. Ir na aba "Logs" do recurso
2. Copiar os últimos 50 linhas
3. Procurar por mensagens de erro (❌)
```

### **2. Executar Script de Diagnóstico**

```bash
# Via terminal do Coolify ou SSH:
docker ps  # Pegar ID do container
docker exec <container_id> node /app/server/test-connection.js
```

### **3. Verificar Variáveis de Ambiente**

```bash
# Mínimo necessário:
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=3001
NODE_ENV=production
```

### **4. Testar Conexão Manual com Banco**

```bash
# Dentro do container:
docker exec <container_id> pg_isready -h <db_host> -p 5432 -U <db_user>

# Se retornar "accepting connections" = OK
# Se retornar "no response" = Problema de rede/conexão
```

---

## 📝 INFORMAÇÕES NECESSÁRIAS PARA DIAGNÓSTICO FINAL

Para eu fornecer a solução cirúrgica, preciso que você me envie:

### **1. Logs do Container (últimos 50 linhas)**

```bash
# Copie do painel do Coolify ou via:
docker logs <container_id> --tail 50
```

### **2. Variáveis de Ambiente Configuradas**

```bash
# Liste (sem expor senhas):
docker exec <container_id> env | grep -E "DATABASE_URL|PORT|NODE_ENV"
```

### **3. Status do Container do Banco**

```bash
# Verificar se o banco está rodando:
docker ps | grep postgres
```

### **4. Teste de Conexão**

```bash
# Executar script de diagnóstico:
docker exec <container_id> node /app/server/test-connection.js
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Coletar informações acima**
2. **Identificar mensagem de erro exata**
3. **Aplicar correção específica**
4. **Validar que container permanece estável**

---

**Aguardando logs do Coolify para diagnóstico final!** 🔍
