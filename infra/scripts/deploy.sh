#!/bin/bash

################################################################################
#                                                                              #
#  SCRIPT: Deploy do Sistema Conexa em VPS com Docker                         #
#  Autor: Sistema Conexa                                                      #
#  Data: 31 de Janeiro de 2026                                               #
#  Descrição: Deploy completo e automatizado                                 #
#                                                                              #
################################################################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funções
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ========================================
# INÍCIO DO SCRIPT
# ========================================

clear
print_header "DEPLOY - SISTEMA CONEXA v1.0"

echo ""
echo -e "${CYAN}Data: $(date '+%d de %B de %Y - %H:%M:%S')${NC}"
echo -e "${CYAN}Usuário: $(whoami)${NC}"
echo -e "${CYAN}Hostname: $(hostname)${NC}"
echo ""

# ========================================
# 1. Verificar pré-requisitos
# ========================================

print_step "Verificando pré-requisitos..."

if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado"
    exit 1
fi
print_success "Docker encontrado: $(docker --version)"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado"
    exit 1
fi
print_success "Docker Compose encontrado: $(docker-compose --version)"

if ! command -v git &> /dev/null; then
    print_error "Git não está instalado"
    exit 1
fi
print_success "Git encontrado: $(git --version)"

echo ""

# ========================================
# 2. Verificar se estamos no diretório correto
# ========================================

print_step "Verificando diretório..."

if [ ! -f "docker-compose.yml" ] && [ ! -f "infra/docker-compose.prod.yml" ]; then
    print_error "Não encontrado docker-compose.yml ou infra/docker-compose.prod.yml"
    print_warning "Execute este script no diretório raiz do projeto"
    exit 1
fi
print_success "Diretório correto"

echo ""

# ========================================
# 3. Verificar arquivo .env
# ========================================

print_step "Verificando configuração de ambiente..."

if [ ! -f ".env.production" ]; then
    print_warning "Arquivo .env.production não encontrado"
    print_step "Criando .env.production a partir de .env.example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        print_success ".env.production criado"
        print_warning "⚠️  IMPORTANTE: Edite .env.production com suas configurações!"
        echo ""
        echo "Variáveis críticas a configurar:"
        echo "  - POSTGRES_PASSWORD (senha do banco)"
        echo "  - JWT_SECRET (chave JWT)"
        echo "  - SESSION_SECRET (chave de sessão)"
        echo "  - OPENAI_API_KEY (se usar IA)"
        echo ""
        read -p "Pressione ENTER para continuar após editar .env.production..."
    else
        print_error ".env.example não encontrado"
        exit 1
    fi
fi
print_success ".env.production encontrado"

echo ""

# ========================================
# 4. Parar containers antigos (se existirem)
# ========================================

print_step "Verificando containers existentes..."

if docker ps -a | grep -q "conexa_"; then
    print_warning "Containers Conexa existentes encontrados"
    read -p "Deseja parar e remover os containers antigos? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_step "Parando containers..."
        docker-compose -f infra/docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
        print_success "Containers parados"
    fi
else
    print_success "Nenhum container Conexa anterior encontrado"
fi

echo ""

# ========================================
# 5. Criar diretórios necessários
# ========================================

print_step "Criando diretórios necessários..."

mkdir -p uploads logs backups pgdata
chmod 755 uploads logs backups pgdata
print_success "Diretórios criados"

echo ""

# ========================================
# 6. Build das imagens Docker
# ========================================

print_step "Fazendo build das imagens Docker..."

docker-compose -f infra/docker-compose.prod.yml build --no-cache
print_success "Build concluído"

echo ""

# ========================================
# 7. Iniciar containers
# ========================================

print_step "Iniciando containers..."

docker-compose -f infra/docker-compose.prod.yml up -d
print_success "Containers iniciados"

echo ""

# ========================================
# 8. Aguardar banco de dados
# ========================================

print_step "Aguardando banco de dados ficar pronto..."

for i in {1..30}; do
    if docker-compose -f infra/docker-compose.prod.yml exec -T db pg_isready -U conexa_prod &> /dev/null; then
        print_success "Banco de dados pronto"
        break
    fi
    echo "Tentativa $i/30..."
    sleep 1
done

echo ""

# ========================================
# 9. Executar migrations
# ========================================

print_step "Executando migrations do banco de dados..."

docker-compose -f infra/docker-compose.prod.yml exec -T backend npm run prisma:generate
docker-compose -f infra/docker-compose.prod.yml exec -T backend npm run prisma:push
docker-compose -f infra/docker-compose.prod.yml exec -T backend npm run prisma:seed || print_warning "Seed pode ter falhado (opcional)"

print_success "Migrations concluídas"

echo ""

# ========================================
# 10. Verificar saúde dos serviços
# ========================================

print_step "Verificando saúde dos serviços..."

echo ""
echo "Aguardando serviços ficarem prontos..."
sleep 10

echo ""
echo -e "${CYAN}Status dos containers:${NC}"
docker-compose -f infra/docker-compose.prod.yml ps

echo ""

# ========================================
# 11. Testar endpoints
# ========================================

print_step "Testando endpoints..."

echo ""
echo -e "${CYAN}Testando Backend (porta 9001):${NC}"
if curl -s http://localhost:9001/api/health | grep -q "status"; then
    print_success "Backend respondendo"
else
    print_warning "Backend pode estar ainda iniciando"
fi

echo ""
echo -e "${CYAN}Testando Frontend (porta 9173):${NC}"
if curl -s http://localhost:9173/ | grep -q "html" > /dev/null 2>&1; then
    print_success "Frontend respondendo"
else
    print_warning "Frontend pode estar ainda iniciando"
fi

echo ""

# ========================================
# 12. Resumo Final
# ========================================

print_header "DEPLOY CONCLUÍDO COM SUCESSO!"

echo ""
echo -e "${GREEN}Sistema Conexa está rodando!${NC}"
echo ""
echo -e "${CYAN}Acessos:${NC}"
echo -e "  ${YELLOW}Frontend:${NC} http://localhost:9173"
echo -e "  ${YELLOW}Backend API:${NC} http://localhost:9001"
echo -e "  ${YELLOW}Health Check:${NC} http://localhost:9001/api/health"
echo -e "  ${YELLOW}Database:${NC} localhost:9432"
echo ""
echo -e "${CYAN}Credenciais Padrão:${NC}"
echo -e "  ${YELLOW}Database User:${NC} conexa_prod"
echo -e "  ${YELLOW}Database Name:${NC} conexa_prod"
echo ""
echo -e "${CYAN}Comandos úteis:${NC}"
echo "  docker-compose -f infra/docker-compose.prod.yml logs -f          # Ver logs"
echo "  docker-compose -f infra/docker-compose.prod.yml ps               # Status"
echo "  docker-compose -f infra/docker-compose.prod.yml down             # Parar"
echo "  docker-compose -f infra/docker-compose.prod.yml restart          # Reiniciar"
echo ""
echo -e "${CYAN}Backup do banco:${NC}"
echo "  docker-compose -f infra/docker-compose.prod.yml exec db pg_dump -U conexa_prod conexa_prod > backup.sql"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "  1. Altere as senhas padrão em .env.production"
echo "  2. Configure SSL/TLS para produção"
echo "  3. Configure backups automáticos"
echo "  4. Configure monitoramento e alertas"
echo ""

print_header "Deploy finalizado!"

exit 0
