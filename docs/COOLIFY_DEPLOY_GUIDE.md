# Guia de Deploy no Coolify - Sistema Conexa v1.0

## 🎯 Pré-requisitos

✅ **Checklist de Prontidão:**

- [x] Código TypeScript compila sem erros
- [x] Migrations de banco sincronizadas
- [x] Schema.prisma atualizado com roles corretas
- [x] Seed script configurado (`prisma.seed` no package.json)
- [x] Dockerfile presente e funcional
- [x] docker-compose.prod.yml configurado
- [x] Entrypoint com auto-heal de migrations
- [x] Frontend com God Mode para MATRIZ_ADMIN
- [x] Backend com handlers de erro robustos
- [x] Health check configurado

**Status:** ✅ **SISTEMA PRONTO PARA DEPLOY**

---

## 🚀 Passo a Passo - Deploy no Coolify

### 1. Acessar o Painel do Coolify

1. Acesse: `https://seu-coolify.com`
2. Faça login com suas credenciais

### 2. Criar Novo Projeto

1. Clique em **"New Project"**
2. Nome: `conexa-production`
3. Descrição: `Sistema Conexa v1.0 - ERP Educacional`

### 3. Adicionar Repositório Git

1. Clique em **"Add New Resource"** → **"Git Repository"**
2. Configurações:
   - **Repository URL:** `https://github.com/vml-arquivos/iaconexa`
   - **Branch:** `main`
   - **Build Pack:** `Dockerfile`
   - **Port:** `3001` (backend) e `5173` (frontend, se separado)

### 4. Configurar Variáveis de Ambiente

**Variáveis Obrigatórias:**

```bash
# Database
DATABASE_URL=postgresql://user:password@db:5432/conexa_prod

# Node Environment
NODE_ENV=production
PORT=3001

# JWT Secret (gerar com: openssl rand -base64 32)
JWT_SECRET=<seu_jwt_secret_aqui>

# CORS
CORS_ORIGIN=https://seu-dominio.com

# Prisma
PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x
```

**Variáveis Opcionais:**

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Email (se configurado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Storage (se configurado)
AWS_ACCESS_KEY_ID=<sua_key>
AWS_SECRET_ACCESS_KEY=<seu_secret>
AWS_BUCKET_NAME=conexa-uploads
AWS_REGION=us-east-1
```

### 5. Configurar Banco de Dados

**Opção A: Usar Banco Gerenciado do Coolify**

1. No projeto, clique em **"Add Database"**
2. Escolha **PostgreSQL 16**
3. Nome: `conexa_db`
4. Copie a `DATABASE_URL` gerada
5. Cole nas variáveis de ambiente do app

**Opção B: Usar Banco Externo (Google Cloud SQL)**

1. Crie uma instância PostgreSQL no Google Cloud
2. Configure IP autorizado do Coolify
3. Copie a connection string
4. Cole nas variáveis de ambiente

### 6. Configurar Domínio

1. Na aba **"Domains"**, adicione:
   - `conexa.seu-dominio.com` (ou seu domínio personalizado)
2. Coolify gerará automaticamente certificado SSL via Let's Encrypt

### 7. Deploy Inicial

1. Clique em **"Deploy"**
2. Aguarde o build (~5-10 minutos na primeira vez)
3. Monitore os logs em tempo real

**Logs Esperados (Sucesso):**

```
✓ Building Docker image...
✓ Running migrations...
🚑 [AUTO-HEAL] Tentando destravar migração presa...
✓ Migrations executadas com sucesso!
✓ Prisma conectado ao banco de dados
✓ Sistema pronto para receber requisições
✓ Container started successfully
✓ Health check passing
```

### 8. Executar Seed (Popular Banco)

**Opção A: Via Rota HTTP (Mais Fácil)**

Acesse no navegador:
```
https://conexa.seu-dominio.com/api/seed-test-users
```

**Opção B: Via Terminal do Container**

1. No Coolify, vá em **"Terminal"**
2. Execute:
```bash
npx prisma db seed
```

**Resultado Esperado:**

```json
{
  "success": true,
  "message": "Usuários de teste criados com sucesso!",
  "users": [
    { "email": "admin@cocris.org", "role": "MATRIZ_ADMIN" },
    ...
  ]
}
```

### 9. Validar Deploy

1. **Health Check:**
   ```bash
   curl https://conexa.seu-dominio.com/api/health
   ```
   Resposta esperada:
   ```json
   {
     "status": "OK",
     "system": "CONEXA v1.1",
     "timestamp": "2026-02-02T18:00:00.000Z",
     "uptime": 3600
   }
   ```

2. **Teste de Login:**
   - Acesse: `https://conexa.seu-dominio.com/login`
   - Email: `admin@cocris.org`
   - Senha: `admin123`
   - **Resultado:** ✅ Login bem-sucedido, redirecionamento para dashboard

3. **Verificar Menus:**
   - Usuário `admin@cocris.org` deve ver **TODOS os menus**
   - Incluindo: CRM 360º, Financeiro, Planejamentos, etc.

---

## 🔄 Redeploy (Atualizações)

Para fazer deploy de novas alterações:

1. **Commit e Push** no GitHub:
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```

2. **No Coolify:**
   - Clique em **"Redeploy"**
   - Ou configure **Auto Deploy** para deploy automático a cada push

---

## 📊 Monitoramento

### Logs em Tempo Real

No Coolify, vá em **"Logs"** para ver:
- Logs do container
- Logs de build
- Logs de migrations
- Logs de erros

### Métricas

No Coolify, vá em **"Metrics"** para ver:
- CPU usage
- Memory usage
- Network traffic
- Uptime

### Alertas

Configure alertas no Coolify para:
- Container restart
- High CPU/Memory
- Failed deployments
- Health check failures

---

## 🚨 Troubleshooting

### Problema: Build falha com erro TypeScript

**Solução:**
```bash
# Localmente, execute:
pnpm run build

# Se passar, commit e push
# Se falhar, corrija os erros de TS primeiro
```

### Problema: Migration falha (P3009)

**Solução:**
O entrypoint já tem auto-heal. Se ainda falhar:
1. Acesse terminal do container
2. Execute:
   ```bash
   npx prisma migrate resolve --rolled-back "20260202000000_multi_unit_structure_and_hierarchical_roles"
   npx prisma migrate deploy
   ```

### Problema: Container em loop de restart

**Solução:**
1. Verifique logs para identificar erro
2. Causas comuns:
   - Porta já em uso (altere PORT nas env vars)
   - DATABASE_URL incorreta
   - Falta de variáveis de ambiente obrigatórias

### Problema: Frontend não carrega

**Solução:**
1. Verifique se o build do frontend foi bem-sucedido
2. Verifique se a variável `CORS_ORIGIN` está correta
3. Limpe cache do navegador (Ctrl+Shift+R)

### Problema: Seed não cria usuários

**Solução:**
1. Verifique se o banco está vazio: `SELECT COUNT(*) FROM "User";`
2. Execute seed manualmente: `npx prisma db seed`
3. Verifique logs para erros de bcrypt ou Prisma

---

## 🔐 Segurança

### Checklist de Segurança Pós-Deploy

- [ ] Alterar senha padrão `admin123` do usuário admin
- [ ] Remover rota `/api/seed-test-users` (ou proteger com auth)
- [ ] Configurar rate limiting
- [ ] Habilitar HTTPS (automático no Coolify)
- [ ] Configurar backup automático do banco
- [ ] Revisar variáveis de ambiente (não expor secrets)
- [ ] Configurar firewall (permitir apenas Coolify e IPs confiáveis)

---

## 📞 Suporte

**Em caso de problemas:**

1. **Verifique logs** no Coolify
2. **Consulte documentação** em `/docs`
3. **Contate o time de desenvolvimento** com:
   - Screenshot do erro
   - Logs relevantes
   - Passos para reproduzir

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Deploy bem-sucedido (sem erros)
- [ ] Health check respondendo 200 OK
- [ ] Migrations aplicadas com sucesso
- [ ] Seed executado (usuários criados)
- [ ] Login funcionando
- [ ] MATRIZ_ADMIN vê todos os menus
- [ ] Domínio configurado e SSL ativo
- [ ] Testes de RBAC realizados (ver RBAC_TESTING_GUIDE.md)
- [ ] Senha padrão alterada
- [ ] Backup configurado

**Status:** 🎉 **DEPLOY COMPLETO E VALIDADO**
