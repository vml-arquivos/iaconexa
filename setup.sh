#!/bin/bash

# ========================================
# SISTEMA CONEXA v1.0
# Setup Script - Development Environment
# ========================================

set -e

echo "🚀 SISTEMA CONEXA - Setup Automático"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# FUNÇÃO: Verificar pré-requisitos
# ========================================
check_prerequisites() {
  echo -e "${BLUE}📦 Verificando pré-requisitos...${NC}"
  
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado. Por favor, instale Docker primeiro.${NC}"
    exit 1
  fi

  if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado. Por favor, instale Docker Compose primeiro.${NC}"
    exit 1
  fi

  echo -e "${GREEN}✓ Docker e Docker Compose encontrados${NC}"
  echo ""
}

# ========================================
# FUNÇÃO: Configurar variáveis de ambiente
# ========================================
setup_env() {
  echo -e "${BLUE}📝 Configurando variáveis de ambiente...${NC}"
  
  if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
    echo -e "${YELLOW}⚠️  Por favor, atualize .env com seus valores reais${NC}"
  else
    echo -e "${GREEN}✓ Arquivo .env já existe${NC}"
  fi
  echo ""
}

# ========================================
# FUNÇÃO: Instalar dependências
# ========================================
install_dependencies() {
  echo -e "${BLUE}📚 Instalando dependências...${NC}"

  # Root dependencies
  if [ -f "package.json" ]; then
    echo "Instalando dependências root..."
    npm install --legacy-peer-deps 2>/dev/null || pnpm install || yarn install
  fi

  # Server dependencies
  if [ -f "server/package.json" ]; then
    echo "Instalando dependências do servidor..."
    cd server
    npm install --legacy-peer-deps 2>/dev/null || pnpm install || yarn install
    cd ..
  fi

  # Client dependencies
  if [ -f "client/package.json" ]; then
    echo "Instalando dependências do cliente..."
    cd client
    npm install --legacy-peer-deps 2>/dev/null || pnpm install || yarn install
    cd ..
  fi

  echo -e "${GREEN}✓ Dependências instaladas${NC}"
  echo ""
}

# ========================================
# FUNÇÃO: Iniciar containers Docker
# ========================================
start_docker() {
  echo -e "${BLUE}🐳 Iniciando containers Docker...${NC}"
  docker-compose up -d
  echo -e "${GREEN}✓ Containers iniciados${NC}"
  echo ""
}

# ========================================
# FUNÇÃO: Aguardar banco de dados
# ========================================
wait_database() {
  echo -e "${BLUE}⏳ Aguardando banco de dados ficar pronto...${NC}"
  
  for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U ${POSTGRES_USER:-conexa_admin} &> /dev/null; then
      echo -e "${GREEN}✓ Banco de dados pronto${NC}"
      echo ""
      return 0
    fi
    echo "Tentativa $i/30..."
    sleep 1
  done
  
  echo -e "${RED}❌ Timeout aguardando banco de dados${NC}"
  exit 1
}

# ========================================
# FUNÇÃO: Executar migrations
# ========================================
run_migrations() {
  echo -e "${BLUE}🗄️  Executando migrações do banco...${NC}"
  
  cd server
  
  echo "Gerando cliente Prisma..."
  npm run prisma:generate
  
  echo "Fazendo push do schema..."
  npm run prisma:push
  
  echo "Executando seed..."
  npm run prisma:seed || echo -e "${YELLOW}⚠️  Seed pode ter falhado (opcional)${NC}"
  
  cd ..
  
  echo -e "${GREEN}✓ Migrações concluídas${NC}"
  echo ""
}

# ========================================
# FUNÇÃO: Exibir resumo
# ========================================
show_summary() {
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "${BLUE}Próximos passos:${NC}"
  echo "1. Atualize .env com suas configurações"
  echo "2. Frontend: http://localhost:5173"
  echo "3. Backend API: http://localhost:3001"
  echo "4. Database: localhost:5432"
  echo ""
  echo -e "${BLUE}Comandos úteis:${NC}"
  echo "  docker-compose logs -f          # Ver logs em tempo real"
  echo "  docker-compose down             # Parar containers"
  echo "  docker-compose ps               # Ver status dos containers"
  echo "  npm run dev                     # Iniciar desenvolvimento"
  echo ""
  echo -e "${BLUE}Verificar saúde do sistema:${NC}"
  echo "  curl http://localhost:3001/api/health"
  echo ""
}

# ========================================
# EXECUÇÃO PRINCIPAL
# ========================================

check_prerequisites
setup_env
install_dependencies
start_docker
wait_database
run_migrations
show_summary

echo -e "${GREEN}🎉 Sistema Conexa pronto para uso!${NC}"
echo ""
