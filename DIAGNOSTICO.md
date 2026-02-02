# Diagnóstico de Prontidão para Deploy no Coolify

**Repositório:** `vml-arquivos/iaconexa`
**Data da Análise:** 2026-02-01

## Sumário Executivo

A análise do repositório `iaconexa` revela uma base de código bem estruturada e com componentes essenciais já implementados, como o uso do Prisma ORM e um script de inicialização (`docker-entrypoint.sh`) que automatiza as migrações de banco de dados. No entanto, existem duas lacunas críticas que impedem um deploy direto e confiável no Coolify: a ausência de um `Dockerfile` unificado na raiz do projeto e, mais importante, o uso de armazenamento local para uploads de arquivos, o que torna a aplicação incompatível com ambientes de contêineres efêmeros.

## Análise Detalhada

A seguir, uma avaliação detalhada dos pontos-chave da Fase 1 (Varredura Estrutural).

### 1. Estrutura do Repositório

| Critério | Status | Observações |
| :--- | :--- | :--- |
| **Tipo de Repositório** | ✅ **Monorepo** | O projeto está organizado em diretórios `client` (Frontend), `server` (Backend) e `shared`, com um `pnpm-workspace.yaml` que gerencia os pacotes. A estrutura é lógica e bem definida. |
| **Separação Frontend/Backend** | ✅ **Separados** | Frontend (React/Vite) e Backend (Node.js/Express) estão em pastas distintas, facilitando a conteinerização independente e a construção em estágios (multi-stage build). |

### 2. Dependências e Configuração

| Critério | Status | Observações |
| :--- | :--- | :--- |
| **ORM (Prisma)** | ✅ **Presente** | O `package.json` do servidor e o da raiz confirmam a presença do `prisma`. O arquivo `prisma/schema.prisma` está bem estruturado e utiliza `env("DATABASE_URL")` para a conexão, o que é uma prática recomendada. |
| **Storage (Uploads)** | ❌ **Crítico: Incompatível** | O middleware `server/middleware/upload.ts` utiliza `multer.diskStorage` para salvar arquivos no diretório local `/uploads`. **Isso é um bloqueador crítico**, pois os dados seriam perdidos a cada reinicialização do contêiner. É mandatória a implementação de um adaptador para um serviço de storage externo como S3 ou R2. |

### 3. Banco de Dados

| Critério | Status | Observações |
| :--- | :--- | :--- |
| **Schema do Banco** | ✅ **Adequado** | O arquivo `prisma/schema.prisma` define corretamente a hierarquia escolar com os modelos `School`, `Class` e `Student`, atendendo aos requisitos do projeto. |
| **Conexão com Banco** | ✅ **Pronto** | O schema do Prisma já está configurado para ler a string de conexão da variável de ambiente `DATABASE_URL`. |
| **Script de Migração** | ✅ **Excelente** | O script `infra/docker-entrypoint.sh` já contém a lógica para aguardar o banco de dados e executar `prisma migrate deploy`, o que é perfeito para o ambiente de deploy automatizado do Coolify. |

## Conclusão: O Que Falta para o Deploy

Para que o projeto `iaconexa` esteja pronto para um "one-click deploy" no Coolify, as seguintes ações são necessárias:

1.  **Criar um `Dockerfile` Unificado:** É preciso desenvolver um `Dockerfile` na raiz do projeto que utilize **multi-stage builds** para:
    *   **Estágio 1:** Construir a aplicação frontend (React/Vite).
    *   **Estágio 2:** Construir a aplicação backend (Node.js/TypeScript).
    *   **Estágio Final:** Copiar os artefatos de build do frontend para uma pasta de arquivos estáticos no backend e configurar o servidor Node.js para servir a aplicação completa.

2.  **Implementar Storage Externo (S3/R2):** O sistema de upload de arquivos deve ser refatorado.
    *   Substituir `multer.diskStorage` por uma biblioteca como `multer-s3`.
    *   Adicionar as variáveis de ambiente necessárias para a conexão com o bucket S3/R2 (Access Key, Secret Key, Bucket Name, Region, Endpoint).

3.  **Ajustar Scripts de Deploy:**
    *   Garantir que o `CMD` ou `ENTRYPOINT` do `Dockerfile` final execute o script `infra/docker-entrypoint.sh` para automatizar as migrações antes de iniciar o servidor.

Com essas modificações, o repositório estará alinhado com as melhores práticas para deploy em contêineres e pronto para ser integrado ao Coolify.
