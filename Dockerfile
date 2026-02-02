# ========================================
# SISTEMA CONEXA - Dockerfile Unificado
# OTIMIZADO PARA COOLIFY + CLOUDFLARE R2
# ========================================
# Multi-stage build:
# 1. Base: Instalar dependências
# 2. Build Client (React/Vite)
# 3. Build Server (Node.js/TypeScript)
# 4. Production: Imagem final Alpine
# ========================================

# ========================================
# STAGE 1: BASE (Dependências)
# ========================================
FROM node:20-alpine AS base

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.4.1

# Copiar arquivos de configuração do monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY prisma ./prisma/

# Instalar dependências de TODOS os workspaces
RUN pnpm install --frozen-lockfile

# ========================================
# STAGE 2: BUILD CLIENT (Frontend)
# ========================================
FROM base AS client-builder

WORKDIR /app

# Copiar código fonte do cliente
COPY client ./client/
COPY shared ./shared/

# Build do frontend
WORKDIR /app/client
RUN pnpm run build

# ========================================
# STAGE 3: BUILD SERVER (Backend)
# ========================================
FROM base AS server-builder

WORKDIR /app

# Instalar dependências do sistema para Prisma
RUN apk add --no-cache openssl openssl-dev

# Gerar Prisma Client
RUN pnpm exec prisma generate

# Copiar código fonte do servidor
COPY server ./server/
COPY shared ./shared/

# Build do backend
WORKDIR /app/server
RUN pnpm run build

# ========================================
# STAGE 4: PRODUCTION (Imagem Final)
# ========================================
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash \
    openssl \
    openssl-dev

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copiar arquivos de configuração do monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY prisma ./prisma/

# Instalar APENAS dependências de produção
RUN pnpm install --frozen-lockfile --prod && pnpm store prune

# Gerar Prisma Client (necessário para runtime)
RUN pnpm exec prisma generate

# Copiar o backend compilado do stage anterior
COPY --from=server-builder /app/server/dist ./server/dist

# Copiar o frontend compilado do stage anterior
COPY --from=client-builder /app/client/dist ./client/dist

# Copiar o script de entrypoint
COPY infra/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Criar diretórios necessários
RUN mkdir -p /app/uploads /app/logs

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expor a porta do backend
EXPOSE 3001

# Healthcheck para o Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Usar o entrypoint que executa migrations e inicia o servidor
ENTRYPOINT ["/app/docker-entrypoint.sh"]
