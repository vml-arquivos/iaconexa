# 🚀 GUIA COMPLETO DE DEPLOY - SISTEMA CONEXA v1.0

**Data:** 31 de Janeiro de 2026  
**Status:** ✅ PRONTO PARA DEPLOY EM VPS  
**Portas Configuradas:** 9173 (Frontend), 9001 (Backend), 9432 (Database)

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Portas Utilizadas](#portas-utilizadas)
3. [Instalação Rápida](#instalação-rápida)
4. [Instalação Detalhada](#instalação-detalhada)
5. [Configuração Pós-Deploy](#configuração-pós-deploy)
6. [Troubleshooting](#troubleshooting)
7. [Backup e Recuperação](#backup-e-recuperação)

---

## 🔧 Pré-requisitos

### Sistema Operacional
- Ubuntu 20.04 LTS ou superior
- 4GB RAM mínimo
- 20GB disco SSD mínimo
- Acesso SSH com privilégios sudo

### Software Necessário
- Docker 20.10+
- Docker Compose 2.0+
- Git
- curl

### Verificar Pré-requisitos

```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Git
git --version

# Verificar espaço em disco
df -h

# Verificar RAM
free -h
```

---

## 📊 Portas Utilizadas

O Sistema Conexa foi configurado para usar portas que **não conflitam** com outros sistemas:

| Serviço | Porta | Protocolo | Descrição |
|---------|-------|-----------|-----------|
| **Frontend** | 9173 | HTTP | Site Cocris (Vite) |
| **Backend** | 9001 | HTTP | API Express |
| **Database** | 9432 | TCP | PostgreSQL 15 |

### Verificar Portas em Uso

```bash
# Ver todas as portas em uso
sudo ss -tulpn | grep LISTEN

# Verificar portas específicas
sudo ss -tulpn | grep -E "9173|9001|9432"
```

---

## ⚡ Instalação Rápida

Se você já tem Docker instalado:

```bash
# 1. Clone o repositório
git clone https://github.com/vml-arquivos/iaconexa.git
cd iaconexa

# 2. Configure o ambiente
cp .env.example .env.production
# Edite .env.production com suas configurações
nano .env.production

# 3. Execute o deploy
chmod +x infra/scripts/deploy.sh
./infra/scripts/deploy.sh

# 4. Acesse o sistema
# Frontend: http://seu-vps.com:9173
# Backend: http://seu-vps.com:9001
```

---

## 📖 Instalação Detalhada

### Passo 1: Instalar Docker (se não tiver)

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
```

### Passo 2: Instalar Docker Compose

```bash
# Baixar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker-compose --version
```

### Passo 3: Clonar Repositório

```bash
# Criar diretório para aplicação
mkdir -p /opt/conexa
cd /opt/conexa

# Clonar repositório
git clone https://github.com/vml-arquivos/iaconexa.git .

# Verificar estrutura
ls -la
```

### Passo 4: Configurar Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.production

# Editar configurações
nano .env.production
```

**Variáveis críticas a configurar:**

```bash
# Banco de dados
POSTGRES_PASSWORD=SenhaForte123!

# Segurança
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# URLs (se usar domínio)
FRONTEND_URL=http://seu-dominio.com:9173
CORS_ORIGIN=http://seu-dominio.com:9173
API_URL=http://seu-dominio.com:9001

# OpenAI (opcional)
OPENAI_API_KEY=sua_chave_aqui
```

### Passo 5: Executar Deploy

```bash
# Dar permissão ao script
chmod +x infra/scripts/deploy.sh

# Executar deploy
./infra/scripts/deploy.sh
```

O script irá:
1. ✅ Verificar pré-requisitos
2. ✅ Criar diretórios necessários
3. ✅ Fazer build das imagens Docker
4. ✅ Iniciar containers
5. ✅ Executar migrations
6. ✅ Testar endpoints

### Passo 6: Verificar Status

```bash
# Ver status dos containers
docker-compose -f infra/docker-compose.prod.yml ps

# Ver logs
docker-compose -f infra/docker-compose.prod.yml logs -f

# Testar saúde do sistema
curl http://localhost:9001/api/health
```

---

## ⚙️ Configuração Pós-Deploy

### 1. Configurar SSL/TLS (HTTPS)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Gerar certificado
sudo certbot certonly --standalone -d seu-dominio.com

# Configurar Nginx para usar SSL
# (Editar infra/nginx/nginx.conf)
```

### 2. Configurar Nginx como Reverse Proxy

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/conexa

# Conteúdo:
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:9173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Habilitar site
sudo ln -s /etc/nginx/sites-available/conexa /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 3. Configurar Backups Automáticos

```bash
# Criar script de backup
cat > /opt/conexa/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/conexa/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f infra/docker-compose.prod.yml exec -T db pg_dump -U conexa_prod conexa_prod > $BACKUP_DIR/backup_$DATE.sql
EOF

# Dar permissão
chmod +x /opt/conexa/backup.sh

# Agendar backup diário (crontab)
crontab -e

# Adicionar linha:
# 0 2 * * * /opt/conexa/backup.sh
```

### 4. Configurar Monitoramento

```bash
# Instalar ferramentas de monitoramento
sudo apt install htop iotop nethogs -y

# Monitorar recursos
htop

# Monitorar logs em tempo real
docker-compose -f infra/docker-compose.prod.yml logs -f --tail=100
```

---

## 🔍 Troubleshooting

### Problema: Porta já em uso

```bash
# Verificar qual processo está usando a porta
sudo lsof -i :9173
sudo lsof -i :9001
sudo lsof -i :9432

# Matar processo (se necessário)
sudo kill -9 <PID>

# Ou alterar porta em docker-compose.prod.yml
```

### Problema: Banco de dados não inicia

```bash
# Ver logs do banco
docker-compose -f infra/docker-compose.prod.yml logs db

# Remover volume e reiniciar
docker-compose -f infra/docker-compose.prod.yml down -v
docker-compose -f infra/docker-compose.prod.yml up -d
```

### Problema: Frontend não carrega

```bash
# Verificar logs do frontend
docker-compose -f infra/docker-compose.prod.yml logs frontend

# Verificar conectividade
curl http://localhost:9173

# Reiniciar container
docker-compose -f infra/docker-compose.prod.yml restart frontend
```

### Problema: Backend retorna erro

```bash
# Verificar logs do backend
docker-compose -f infra/docker-compose.prod.yml logs backend

# Verificar saúde
curl http://localhost:9001/api/health

# Reiniciar container
docker-compose -f infra/docker-compose.prod.yml restart backend
```

---

## 💾 Backup e Recuperação

### Fazer Backup Manual

```bash
# Backup do banco de dados
docker-compose -f infra/docker-compose.prod.yml exec db pg_dump -U conexa_prod conexa_prod > backup.sql

# Backup de arquivos
tar -czf backup_files.tar.gz uploads/

# Backup completo
tar -czf backup_completo_$(date +%Y%m%d).tar.gz uploads/ backups/ logs/
```

### Restaurar Backup

```bash
# Restaurar banco de dados
docker-compose -f infra/docker-compose.prod.yml exec -T db psql -U conexa_prod conexa_prod < backup.sql

# Restaurar arquivos
tar -xzf backup_files.tar.gz
```

---

## 📊 Acessos Pós-Deploy

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Frontend | http://localhost:9173 | - |
| Backend API | http://localhost:9001 | - |
| Health Check | http://localhost:9001/api/health | - |
| Prisma Studio | http://localhost:5555 | - |
| Database | localhost:9432 | User: conexa_prod |

---

## 🛠️ Comandos Úteis

```bash
# Ver status dos containers
docker-compose -f infra/docker-compose.prod.yml ps

# Ver logs em tempo real
docker-compose -f infra/docker-compose.prod.yml logs -f

# Parar containers
docker-compose -f infra/docker-compose.prod.yml down

# Reiniciar containers
docker-compose -f infra/docker-compose.prod.yml restart

# Executar comando no container
docker-compose -f infra/docker-compose.prod.yml exec backend npm run prisma:studio

# Entrar no container
docker-compose -f infra/docker-compose.prod.yml exec backend bash

# Limpar volumes (cuidado!)
docker-compose -f infra/docker-compose.prod.yml down -v
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs: `docker-compose -f infra/docker-compose.prod.yml logs -f`
2. Verificar saúde: `curl http://localhost:9001/api/health`
3. Verificar portas: `sudo ss -tulpn | grep LISTEN`
4. Abrir issue no GitHub: https://github.com/vml-arquivos/iaconexa/issues

---

## ✅ Checklist Pós-Deploy

- [ ] Frontend acessível em http://localhost:9173
- [ ] Backend respondendo em http://localhost:9001/api/health
- [ ] Banco de dados conectando em localhost:9432
- [ ] Senhas alteradas em .env.production
- [ ] SSL/TLS configurado
- [ ] Backups automáticos configurados
- [ ] Monitoramento ativo
- [ ] Logs sendo coletados

---

**Sistema Conexa v1.0 - Pronto para Transformar Vidas** ❤️

"Nenhuma criança fica para trás"
