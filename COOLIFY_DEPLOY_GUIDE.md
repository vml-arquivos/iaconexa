# Guia de Deploy no Coolify - Sistema Conexa

**Versão:** 1.0  
**Data:** 2026-02-01  
**Repositório:** `vml-arquivos/iaconexa`

## Pré-requisitos

Antes de iniciar o deploy, certifique-se de que você possui:

1.  **Conta no Coolify:** Acesso a uma instância do Coolify instalada em um VPS DigitalOcean (ou outro provedor).
2.  **Banco de Dados PostgreSQL:** O Coolify pode provisionar um automaticamente ou você pode conectar a um banco externo.
3.  **Storage S3/R2:** Uma conta na AWS S3 ou Cloudflare R2 com um bucket criado para armazenar uploads.
4.  **Domínio Configurado (Opcional):** Para acessar a aplicação via HTTPS com um domínio personalizado.

## Passo 1: Preparar o Storage Externo

O sistema Conexa requer um bucket S3 ou R2 para armazenar documentos e fotos de alunos.

### Opção A: AWS S3

1.  Acesse o console da AWS e crie um bucket S3 (ex: `conexa-uploads`).
2.  Configure as permissões para permitir leitura pública (ou use URLs assinadas).
3.  Crie um usuário IAM com permissões de leitura/escrita no bucket.
4.  Anote o **Access Key ID** e o **Secret Access Key**.

### Opção B: Cloudflare R2

1.  Acesse o painel do Cloudflare R2 e crie um bucket (ex: `conexa-uploads`).
2.  Gere um **API Token** com permissões de leitura/escrita.
3.  Anote o **Endpoint** (formato: `https://<account-id>.r2.cloudflarestorage.com`).

## Passo 2: Configurar o Projeto no Coolify

1.  **Adicionar Repositório:**
    *   No painel do Coolify, clique em **"New Resource"** > **"Application"**.
    *   Conecte o repositório GitHub `vml-arquivos/iaconexa`.
    *   Selecione a branch principal (geralmente `main` ou `master`).

2.  **Configurar Build:**
    *   O Coolify detectará automaticamente o `Dockerfile` na raiz do projeto.
    *   Certifique-se de que o **Build Context** está definido como `/` (raiz do repositório).

3.  **Configurar Porta:**
    *   Defina a porta da aplicação como **3001** (ou a porta definida na variável `PORT`).

## Passo 3: Configurar o Banco de Dados

1.  **Provisionar PostgreSQL no Coolify:**
    *   No painel do Coolify, clique em **"New Resource"** > **"Database"** > **"PostgreSQL"**.
    *   Anote a string de conexão fornecida (formato: `postgresql://user:password@host:port/database`).

2.  **Ou Conectar a um Banco Externo:**
    *   Se você já possui um banco PostgreSQL, use a string de conexão dele.

## Passo 4: Configurar Variáveis de Ambiente

No painel do Coolify, adicione as seguintes variáveis de ambiente (use o arquivo `.env.coolify` como referência):

| Variável | Valor de Exemplo | Descrição |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/conexa_prod` | String de conexão do PostgreSQL |
| `NODE_ENV` | `production` | Ambiente de execução |
| `PORT` | `3001` | Porta do servidor |
| `JWT_SECRET` | `<gerar com openssl rand -base64 32>` | Chave secreta para JWT |
| `SESSION_SECRET` | `<gerar com openssl rand -base64 32>` | Chave secreta para sessões |
| `CORS_ORIGIN` | `https://conexa.seu-dominio.com` | Domínio do frontend |
| `S3_REGION` | `us-east-1` ou `auto` (para R2) | Região do S3/R2 |
| `S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` (para R2) | Endpoint customizado (deixe vazio para AWS S3) |
| `S3_ACCESS_KEY_ID` | `AKIAIOSFODNN7EXAMPLE` | Access Key do S3/R2 |
| `S3_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/K7MDENG/bPxRfiCY...` | Secret Key do S3/R2 |
| `S3_BUCKET_NAME` | `conexa-uploads` | Nome do bucket |
| `S3_FORCE_PATH_STYLE` | `true` (para R2) ou `false` (para S3) | Forçar estilo de caminho |
| `PRISMA_SEED_ENABLED` | `true` | Habilitar seed inicial do banco |

**Importante:** Gere valores únicos para `JWT_SECRET` e `SESSION_SECRET` usando o comando:

```bash
openssl rand -base64 32
```

## Passo 5: Ajustar o Código para Usar S3

**Atenção:** O código atual do repositório utiliza armazenamento local. Para que o deploy funcione corretamente, você deve fazer as seguintes modificações:

1.  **Adicionar Dependências:**
    *   Edite o arquivo `server/package.json` e adicione as seguintes dependências:

    ```json
    "@aws-sdk/client-s3": "^3.0.0",
    "multer-s3": "^3.0.1"
    ```

    *   Execute `pnpm install` no diretório `server`.

2.  **Substituir o Middleware de Upload:**
    *   No arquivo `server/src/index.ts`, substitua a importação:

    ```typescript
    // ANTES:
    import documentRoutes from '../routes/documents.js';

    // DEPOIS:
    import documentRoutes from '../routes/documents-s3.js';
    ```

3.  **Verificar os Arquivos Criados:**
    *   Os arquivos `server/middleware/upload-s3.ts` e `server/routes/documents-s3.ts` já foram criados e estão prontos para uso.

## Passo 6: Deploy

1.  **Commit e Push:**
    *   Faça commit das alterações no repositório:

    ```bash
    git add .
    git commit -m "feat: adicionar suporte a S3/R2 para uploads"
    git push origin main
    ```

2.  **Iniciar Deploy no Coolify:**
    *   No painel do Coolify, clique em **"Deploy"**.
    *   O Coolify irá:
        *   Clonar o repositório.
        *   Construir a imagem Docker usando o `Dockerfile` na raiz.
        *   Executar o script `docker-entrypoint.sh`, que irá:
            *   Aguardar o PostgreSQL estar pronto.
            *   Executar as migrações do Prisma (`prisma migrate deploy`).
            *   Popular o banco com dados iniciais (se `PRISMA_SEED_ENABLED=true`).
            *   Iniciar o servidor na porta 3001.

3.  **Verificar o Deploy:**
    *   Acesse a URL fornecida pelo Coolify (ex: `https://conexa.seu-dominio.com`).
    *   Verifique o endpoint de saúde: `https://api.conexa.seu-dominio.com/api/health`.

## Passo 7: Configurar Domínio (Opcional)

1.  No painel do Coolify, vá para **"Domains"** e adicione seu domínio personalizado.
2.  O Coolify irá provisionar automaticamente um certificado SSL via Let's Encrypt.

## Troubleshooting

### Erro: "Cannot connect to database"

*   Verifique se a variável `DATABASE_URL` está correta.
*   Certifique-se de que o banco de dados está acessível a partir do container.

### Erro: "S3 credentials not found"

*   Verifique se as variáveis `S3_ACCESS_KEY_ID` e `S3_SECRET_ACCESS_KEY` estão configuradas.
*   Para R2, certifique-se de que `S3_ENDPOINT` está definido.

### Erro: "Prisma migration failed"

*   Verifique os logs do container para identificar o erro específico.
*   Certifique-se de que o banco de dados está vazio na primeira execução (ou que as migrações estão atualizadas).

## Suporte

Para dúvidas ou problemas, consulte a documentação do Coolify ou entre em contato com a equipe de desenvolvimento do Conexa.
