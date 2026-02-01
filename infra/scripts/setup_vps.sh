#!/bin/bash
# ========================================
# SISTEMA CONEXA v1.0
# One-Click VPS Setup Script
# Ubuntu 24.04 LTS + Docker Compose
# ========================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Não execute este script como root!"
    print_info "Execute como usuário normal com sudo: ./setup_vps.sh"
    exit 1
fi

# ========================================
# BANNER
# ========================================
clear
echo -e "${BLUE}"
cat << "EOF"
   ____  ___   _   ___  ______  __  _____ 
  / __ \/ _ \ / | / / |/ / __ \/ / / / _ |
 / /_/ / // //  |/ /    / /_/ / /_/ / __ |
 \____/____//_/|_/_/|_/\____/\____/_/ |_|
                                          
  SISTEMA CONEXA v1.0
  "Conectando Vidas"
  
  One-Click VPS Setup
  Ubuntu 24.04 LTS + Docker Compose
EOF
echo -e "${NC}"

print_header "Iniciando Instalação"

# ========================================
# STEP 1: SYSTEM UPDATE
# ========================================
print_header "STEP 1: Atualizando Sistema"

print_info "Atualizando lista de pacotes..."
sudo apt update -qq

print_info "Instalando atualizações de segurança..."
sudo apt upgrade -y -qq

print_info "Instalando dependências básicas..."
sudo apt install -y -qq \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    nano \
    unzip

print_success "Sistema atualizado!"

# ========================================
# STEP 2: INSTALL DOCKER
# ========================================
print_header "STEP 2: Instalando Docker"

if command -v docker &> /dev/null; then
    print_warning "Docker já está instalado ($(docker --version))"
else
    print_info "Adicionando repositório Docker..."
    
    # Add Docker's official GPG key
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Add repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update -qq
    sudo apt install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker instalado: $(docker --version)"
fi

# ========================================
# STEP 3: INSTALL DOCKER COMPOSE
# ========================================
print_header "STEP 3: Verificando Docker Compose"

if docker compose version &> /dev/null; then
    print_success "Docker Compose já está instalado ($(docker compose version))"
else
    print_error "Docker Compose não encontrado!"
    exit 1
fi

# ========================================
# STEP 4: CONFIGURE FIREWALL
# ========================================
print_header "STEP 4: Configurando Firewall"

print_info "Configurando UFW (Uncomplicated Firewall)..."

# Reset UFW
sudo ufw --force reset > /dev/null 2>&1

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANTE!)
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable UFW
echo "y" | sudo ufw enable > /dev/null 2>&1

print_success "Firewall configurado!"
sudo ufw status numbered

# ========================================
# STEP 5: CONFIGURE FAIL2BAN
# ========================================
print_header "STEP 5: Configurando Fail2Ban"

print_info "Configurando proteção contra brute-force..."

sudo systemctl enable fail2ban > /dev/null 2>&1
sudo systemctl start fail2ban

print_success "Fail2Ban ativo!"

# ========================================
# STEP 6: CLONE REPOSITORY
# ========================================
print_header "STEP 6: Clonando Repositório"

read -p "Digite a URL do repositório Git (ou Enter para pular): " REPO_URL

if [ -n "$REPO_URL" ]; then
    print_info "Clonando repositório..."
    
    # Extract repo name
    REPO_NAME=$(basename "$REPO_URL" .git)
    
    if [ -d "$REPO_NAME" ]; then
        print_warning "Diretório $REPO_NAME já existe!"
        read -p "Deseja sobrescrever? (y/N): " OVERWRITE
        if [ "$OVERWRITE" = "y" ] || [ "$OVERWRITE" = "Y" ]; then
            rm -rf "$REPO_NAME"
            git clone "$REPO_URL"
        fi
    else
        git clone "$REPO_URL"
    fi
    
    cd "$REPO_NAME"
    print_success "Repositório clonado!"
else
    print_warning "Clone pulado. Certifique-se de estar no diretório do projeto!"
fi

# ========================================
# STEP 7: CONFIGURE ENVIRONMENT
# ========================================
print_header "STEP 7: Configurando Variáveis de Ambiente"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Arquivo .env criado a partir de .env.example"
    else
        print_error "Arquivo .env.example não encontrado!"
        exit 1
    fi
else
    print_warning "Arquivo .env já existe. Pulando..."
fi

# Generate secure passwords
print_info "Gerando senhas seguras..."

JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)

# Update .env file (escape special characters for sed)
JWT_SECRET_ESCAPED=$(echo "$JWT_SECRET" | sed 's/[&/\]/\\&/g')
SESSION_SECRET_ESCAPED=$(echo "$SESSION_SECRET" | sed 's/[&/\]/\\&/g')
DB_PASSWORD_ESCAPED=$(echo "$DB_PASSWORD" | sed 's/[&/\]/\\&/g')

sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET_ESCAPED/" .env
sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET_ESCAPED/" .env
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD_ESCAPED/" .env
sed -i "s/:conexa_secure_password_2026_CHANGE_ME@/:$DB_PASSWORD_ESCAPED@/" .env

print_success "Senhas geradas e configuradas!"

# Prompt for optional configurations
echo ""
print_info "Configurações Opcionais:"
echo ""

read -p "Deseja habilitar IA Mentora? (y/N): " ENABLE_AI
if [ "$ENABLE_AI" = "y" ] || [ "$ENABLE_AI" = "Y" ]; then
    read -p "Digite sua OpenAI API Key: " OPENAI_KEY
    sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_KEY/" .env
    sed -i "s/ENABLE_AI_MENTOR=.*/ENABLE_AI_MENTOR=true/" .env
    print_success "IA Mentora habilitada!"
else
    sed -i "s/ENABLE_AI_MENTOR=.*/ENABLE_AI_MENTOR=false/" .env
    print_info "IA Mentora desabilitada"
fi

echo ""
read -p "Deseja configurar SMTP para e-mails? (y/N): " ENABLE_SMTP
if [ "$ENABLE_SMTP" = "y" ] || [ "$ENABLE_SMTP" = "Y" ]; then
    read -p "SMTP Host (ex: smtp.gmail.com): " SMTP_HOST
    read -p "SMTP Port (ex: 587): " SMTP_PORT
    read -p "SMTP User (seu e-mail): " SMTP_USER
    read -sp "SMTP Password: " SMTP_PASS
    echo ""
    
    sed -i "s/SMTP_HOST=.*/SMTP_HOST=$SMTP_HOST/" .env
    sed -i "s/SMTP_PORT=.*/SMTP_PORT=$SMTP_PORT/" .env
    sed -i "s/SMTP_USER=.*/SMTP_USER=$SMTP_USER/" .env
    sed -i "s/SMTP_PASSWORD=.*/SMTP_PASSWORD=$SMTP_PASS/" .env
    
    print_success "SMTP configurado!"
else
    print_info "SMTP não configurado (e-mails desabilitados)"
fi

# ========================================
# STEP 8: CREATE DIRECTORIES
# ========================================
print_header "STEP 8: Criando Diretórios"

mkdir -p pgdata uploads logs backups nginx/ssl

print_success "Diretórios criados!"

# ========================================
# STEP 9: BUILD AND START
# ========================================
print_header "STEP 9: Build e Inicialização"

print_info "Este processo pode levar alguns minutos..."
echo ""

# Check if docker-compose.prod.yml exists
if [ -f "docker-compose.prod.yml" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    print_error "Arquivo docker-compose não encontrado!"
    exit 1
fi

print_info "Usando arquivo: $COMPOSE_FILE"

# Pull images (if available)
print_info "Baixando imagens base..."
docker compose -f "$COMPOSE_FILE" pull || true

# Build images
print_info "Construindo imagens (isso pode demorar)..."
docker compose -f "$COMPOSE_FILE" build --no-cache

# Start services
print_info "Iniciando serviços..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
print_info "Aguardando serviços ficarem prontos..."
sleep 10

# Check health
print_info "Verificando status dos serviços..."
docker compose -f "$COMPOSE_FILE" ps

# ========================================
# STEP 10: VERIFY INSTALLATION
# ========================================
print_header "STEP 10: Verificando Instalação"

# Check if backend is healthy
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend API está respondendo!"
else
    print_warning "Backend API não está respondendo ainda. Aguarde alguns segundos..."
fi

# Check if frontend is accessible
if curl -sf http://localhost > /dev/null 2>&1; then
    print_success "Frontend está acessível!"
else
    print_warning "Frontend não está acessível ainda. Aguarde alguns segundos..."
fi

# ========================================
# FINAL SUMMARY
# ========================================
print_header "Instalação Concluída!"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 SISTEMA CONEXA v1.0 INSTALADO!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "SEU_IP_AQUI")

echo -e "${BLUE}📊 Informações de Acesso:${NC}"
echo ""
echo -e "  🌐 URL: ${GREEN}http://$SERVER_IP${NC}"
echo -e "  📧 E-mail: ${GREEN}admin@cocris.org${NC}"
echo -e "  🔑 Senha: ${GREEN}admin123${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "  1. Altere a senha padrão após o primeiro login!"
echo -e "  2. Configure SSL/HTTPS para produção"
echo -e "  3. Configure backup automático"
echo ""

echo -e "${BLUE}📝 Comandos Úteis:${NC}"
echo ""
echo -e "  Ver logs:        ${GREEN}docker compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "  Parar sistema:   ${GREEN}docker compose -f $COMPOSE_FILE down${NC}"
echo -e "  Reiniciar:       ${GREEN}docker compose -f $COMPOSE_FILE restart${NC}"
echo -e "  Status:          ${GREEN}docker compose -f $COMPOSE_FILE ps${NC}"
echo ""

echo -e "${BLUE}🔧 Arquivos Importantes:${NC}"
echo ""
echo -e "  Configuração:    ${GREEN}.env${NC}"
echo -e "  Dados:           ${GREEN}./pgdata/${NC}"
echo -e "  Uploads:         ${GREEN}./uploads/${NC}"
echo -e "  Logs:            ${GREEN}./logs/${NC}"
echo -e "  Backups:         ${GREEN}./backups/${NC}"
echo ""

echo -e "${GREEN}✅ Sistema pronto para uso!${NC}"
echo ""

# Save credentials to file
cat > CREDENTIALS.txt << EOF
========================================
SISTEMA CONEXA v1.0
Credenciais de Acesso
========================================

URL: http://$SERVER_IP
E-mail: admin@cocris.org
Senha: admin123

⚠️ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!

Database:
  Host: localhost:5432
  User: conexa_admin
  Password: $DB_PASSWORD
  Database: conexa_prod

JWT Secret: $JWT_SECRET
Session Secret: $SESSION_SECRET

Data: $(date)
========================================
EOF

print_success "Credenciais salvas em: CREDENTIALS.txt"
print_warning "Mantenha este arquivo seguro!"

echo ""
print_info "Para ver os logs em tempo real:"
echo -e "  ${GREEN}docker compose -f $COMPOSE_FILE logs -f${NC}"
echo ""
