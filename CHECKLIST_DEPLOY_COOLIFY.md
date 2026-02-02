# Checklist de Deploy no Coolify - Sistema Conexa

Use esta lista para garantir que todos os passos foram executados corretamente antes do deploy.

## ✅ Pré-Deploy

- [ ] **Bucket S3/R2 criado** e configurado com permissões adequadas
- [ ] **Credenciais S3/R2** (Access Key ID e Secret Access Key) anotadas
- [ ] **Banco de Dados PostgreSQL** provisionado no Coolify ou string de conexão externa disponível
- [ ] **Domínio configurado** (opcional, mas recomendado para produção)
- [ ] **Secrets gerados** para `JWT_SECRET` e `SESSION_SECRET` usando `openssl rand -base64 32`

## ✅ Modificações no Código

- [ ] **Dependências S3 adicionadas** ao `server/package.json`:
  - `@aws-sdk/client-s3`
  - `multer-s3`
- [ ] **Middleware de upload S3** criado em `server/middleware/upload-s3.ts`
- [ ] **Rota de documentos S3** criada em `server/routes/documents-s3.ts`
- [ ] **Importação atualizada** em `server/src/index.ts` para usar `documents-s3.js`
- [ ] **Commit e push** das alterações para o repositório

## ✅ Configuração no Coolify

- [ ] **Repositório conectado** ao Coolify
- [ ] **Branch selecionada** (main/master)
- [ ] **Porta configurada** como `3001`
- [ ] **Variáveis de ambiente adicionadas**:
  - [ ] `DATABASE_URL`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `JWT_SECRET`
  - [ ] `SESSION_SECRET`
  - [ ] `CORS_ORIGIN`
  - [ ] `S3_REGION`
  - [ ] `S3_ENDPOINT` (se usar R2)
  - [ ] `S3_ACCESS_KEY_ID`
  - [ ] `S3_SECRET_ACCESS_KEY`
  - [ ] `S3_BUCKET_NAME`
  - [ ] `S3_FORCE_PATH_STYLE`
  - [ ] `PRISMA_SEED_ENABLED=true`

## ✅ Deploy

- [ ] **Build iniciado** no Coolify
- [ ] **Build concluído** sem erros
- [ ] **Container iniciado** e rodando
- [ ] **Healthcheck passando** (verificar logs)
- [ ] **Migrações executadas** com sucesso
- [ ] **Seed executado** (se habilitado)

## ✅ Pós-Deploy

- [ ] **Endpoint de saúde acessível**: `https://api.seu-dominio.com/api/health`
- [ ] **Frontend carregando** corretamente
- [ ] **Upload de documentos funcionando** (testar com um arquivo)
- [ ] **Documentos sendo salvos no S3/R2** (verificar no console do S3/R2)
- [ ] **Login funcionando** (se aplicável)
- [ ] **SSL configurado** (se domínio personalizado)

## ✅ Monitoramento

- [ ] **Logs do container** sendo monitorados no Coolify
- [ ] **Alertas configurados** (opcional)
- [ ] **Backup do banco de dados** configurado (recomendado)

## 🚨 Troubleshooting

Se algo não funcionar, verifique:

1.  **Logs do container** no painel do Coolify
2.  **Variáveis de ambiente** estão corretas e sem espaços extras
3.  **String de conexão do banco** está acessível
4.  **Credenciais S3/R2** estão válidas
5.  **Porta 3001** está exposta corretamente

---

**Última atualização:** 2026-02-01  
**Versão do Sistema:** Conexa v1.0
