# 🚀 Guia de Instalação - CoCris Super System

**Versão**: 2.0  
**Data**: 31 de Janeiro de 2026  
**Autor**: Equipe de Desenvolvimento CoCris

---

## 📋 Pré-requisitos

### Servidor de Produção:
- **Sistema Operacional**: Ubuntu 22.04 LTS ou superior
- **CPU**: Mínimo 2 cores (recomendado 4 cores)
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Disco**: Mínimo 50GB SSD
- **Docker**: Versão 24.0 ou superior
- **Docker Compose**: Versão 2.0 ou superior

### Domínio e DNS:
- Domínio registrado (ex: `cocris.org`)
- Acesso ao painel de DNS para configuração
- Certificado SSL (Let's Encrypt recomendado)

### Acesso:
- Acesso SSH ao servidor
- Usuário com permissões sudo
- Portas abertas: 80 (HTTP), 443 (HTTPS), 22 (SSH)

---

## 📦 Instalação do Docker

Se o Docker ainda não estiver instalado, execute:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Verificar instalação
docker --version
docker compose version
```

---

## 🔧 Configuração Inicial

### 1. Clonar o Repositório

```bash
# Clonar via GitHub
git clone https://github.com/vml-arquivos/conexa.git cocris-supersystem
cd cocris-supersystem

# OU fazer upload manual dos arquivos via SCP/SFTP
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.production.example .env.production

# Editar com suas configurações
nano .env.production
```

**Variáveis OBRIGATÓRIAS a alterar:**

```env
# Banco de Dados
DB_PASSWORD=SUA_SENHA_SEGURA_AQUI

# Backend
JWT_SECRET=SUA_CHAVE_JWT_SECRETA_AQUI_32_CARACTERES
CORS_ORIGIN=https://cocris.org

# Frontend
VITE_API_URL=https://api.cocris.org

# E-mail (opcional, mas recomendado)
SMTP_USER=contato@cocris.org
SMTP_PASSWORD=SUA_SENHA_SMTP

# Criptografia
ENCRYPTION_KEY=SUA_CHAVE_CRIPTOGRAFIA_32_CHARS
```

### 3. Criar Diretórios Necessários

```bash
# Criar diretórios
mkdir -p backups logs nginx/ssl server/uploads

# Definir permissões
chmod +x scripts/backup.sh scripts/restore.sh
chmod 755 backups logs server/uploads
```

---

## 🏗️ Build e Deploy

### Opção 1: Deploy Completo (Primeira Vez)

```bash
# Build das imagens
docker compose -f docker-compose.production.yml build

# Iniciar serviços
docker compose -f docker-compose.production.yml up -d

# Verificar status
docker compose -f docker-compose.production.yml ps

# Ver logs
docker compose -f docker-compose.production.yml logs -f
```

### Opção 2: Deploy Rápido (Atualizações)

```bash
# Parar serviços
docker compose -f docker-compose.production.yml down

# Atualizar código
git pull origin main

# Rebuild e restart
docker compose -f docker-compose.production.yml up -d --build

# Ver logs
docker compose -f docker-compose.production.yml logs -f backend frontend
```

---

## 🗄️ Inicialização do Banco de Dados

### 1. Executar Migrations

```bash
# Entrar no container do backend
docker exec -it cocris_api sh

# Executar migrations
npx prisma migrate deploy

# Sair do container
exit
```

### 2. Popular com Dados Iniciais (Seed)

```bash
# Entrar no container do backend
docker exec -it cocris_api sh

# Executar seed
npx tsx prisma/seed_cocris.ts

# Verificar dados
npx prisma studio

# Sair do container
exit
```

**O seed irá criar:**
- ✅ 7 unidades escolares CoCris
- ✅ 5 Campos de Experiência BNCC
- ✅ 5 turmas de exemplo
- ✅ 4 funcionários de exemplo
- ✅ Cardápio de exemplo
- ✅ 2 templates de planejamento

---

## 🌐 Configuração de Domínio e SSL

### 1. Configurar DNS

No painel do seu provedor de DNS, adicione os seguintes registros:

```
Tipo  | Nome | Valor              | TTL
------|------|-------------------|-----
A     | @    | SEU_IP_SERVIDOR   | 3600
A     | www  | SEU_IP_SERVIDOR   | 3600
A     | api  | SEU_IP_SERVIDOR   | 3600
```

### 2. Instalar Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot

# Parar Nginx temporariamente
docker compose -f docker-compose.production.yml stop frontend

# Gerar certificado
sudo certbot certonly --standalone -d cocris.org -d www.cocris.org

# Copiar certificados para o projeto
sudo cp /etc/letsencrypt/live/cocris.org/fullchain.pem nginx/ssl/cocris.org.crt
sudo cp /etc/letsencrypt/live/cocris.org/privkey.pem nginx/ssl/cocris.org.key
sudo chown $USER:$USER nginx/ssl/*

# Reiniciar frontend
docker compose -f docker-compose.production.yml start frontend
```

### 3. Habilitar HTTPS no Nginx

```bash
# Editar configuração do Nginx
nano nginx/nginx.production.conf

# Descomentar seção HTTPS (linhas com #)
# Comentar seção HTTP temporária

# Reiniciar Nginx
docker compose -f docker-compose.production.yml restart frontend
```

### 4. Renovação Automática de SSL

```bash
# Adicionar ao crontab
sudo crontab -e

# Adicionar linha (renovar todo dia às 3h)
0 3 * * * certbot renew --quiet && docker compose -f /caminho/para/cocris-supersystem/docker-compose.production.yml restart frontend
```

---

## 🔐 Segurança

### 1. Firewall (UFW)

```bash
# Instalar UFW
sudo apt install -y ufw

# Configurar regras
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

### 2. Fail2Ban (Proteção contra Brute Force)

```bash
# Instalar Fail2Ban
sudo apt install -y fail2ban

# Copiar configuração
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuração
sudo nano /etc/fail2ban/jail.local

# Reiniciar serviço
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

### 3. Atualizações Automáticas

```bash
# Instalar unattended-upgrades
sudo apt install -y unattended-upgrades

# Configurar
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📊 Monitoramento

### 1. Verificar Status dos Containers

```bash
# Ver containers rodando
docker compose -f docker-compose.production.yml ps

# Ver uso de recursos
docker stats

# Ver logs em tempo real
docker compose -f docker-compose.production.yml logs -f
```

### 2. Health Checks

```bash
# Backend API
curl http://localhost:3000/health

# Frontend
curl http://localhost/health

# Banco de dados
docker exec cocris_db pg_isready -U cocris_admin
```

### 3. Monitoramento de Disco

```bash
# Ver uso de disco
df -h

# Ver tamanho dos volumes Docker
docker system df

# Limpar recursos não utilizados
docker system prune -a --volumes
```

---

## 💾 Backup e Restauração

### 1. Backup Manual

```bash
# Executar backup
docker exec cocris_backup /backup.sh

# Verificar backups
ls -lh backups/
```

### 2. Backup Automático

O backup automático está configurado para rodar **diariamente às 2h da manhã** via cron.

Para alterar o horário:

```bash
# Editar .env.production
BACKUP_SCHEDULE=0 2 * * *  # Formato: minuto hora dia mês dia_da_semana
```

### 3. Restaurar Backup

```bash
# Listar backups disponíveis
ls -lh backups/

# Restaurar backup específico
docker exec -it cocris_backup /restore.sh /backups/cocris_backup_20260131_020000.sql.gz
```

---

## 🔄 Atualizações do Sistema

### 1. Atualizar Código

```bash
# Parar serviços
docker compose -f docker-compose.production.yml down

# Atualizar código
git pull origin main

# Rebuild
docker compose -f docker-compose.production.yml build

# Executar migrations (se houver)
docker compose -f docker-compose.production.yml run backend npx prisma migrate deploy

# Reiniciar
docker compose -f docker-compose.production.yml up -d
```

### 2. Rollback (Reverter Atualização)

```bash
# Ver commits anteriores
git log --oneline

# Reverter para commit específico
git checkout <commit_hash>

# Rebuild e restart
docker compose -f docker-compose.production.yml up -d --build
```

---

## 🐛 Troubleshooting

### Problema: Container não inicia

```bash
# Ver logs detalhados
docker compose -f docker-compose.production.yml logs <service_name>

# Reiniciar container específico
docker compose -f docker-compose.production.yml restart <service_name>

# Rebuild forçado
docker compose -f docker-compose.production.yml up -d --build --force-recreate
```

### Problema: Banco de dados não conecta

```bash
# Verificar se o container está rodando
docker ps | grep cocris_db

# Testar conexão
docker exec cocris_db psql -U cocris_admin -d cocris_db -c "SELECT 1;"

# Ver logs do banco
docker compose -f docker-compose.production.yml logs db
```

### Problema: Erro de permissão em uploads

```bash
# Ajustar permissões
sudo chown -R 1001:1001 server/uploads
sudo chmod -R 755 server/uploads
```

### Problema: SSL não funciona

```bash
# Verificar certificados
ls -la nginx/ssl/

# Testar configuração do Nginx
docker exec cocris_web nginx -t

# Ver logs do Nginx
docker compose -f docker-compose.production.yml logs frontend
```

---

## 📞 Suporte

### Contatos:
- **E-mail**: suporte@cocris.org
- **Telefone**: (61) 3575-4125
- **GitHub Issues**: https://github.com/vml-arquivos/conexa/issues

### Documentação Adicional:
- `FASE3_BACKEND_COMPLETO.md` - Documentação do backend
- `FASE4_MOBILE_INTERFACES.md` - Documentação das interfaces mobile
- `README.md` - Visão geral do projeto

---

## ✅ Checklist de Deploy

- [ ] Servidor configurado com requisitos mínimos
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas (`.env.production`)
- [ ] Diretórios criados com permissões corretas
- [ ] Containers buildados e iniciados
- [ ] Migrations executadas
- [ ] Seed executado (dados iniciais)
- [ ] DNS configurado
- [ ] SSL instalado e configurado
- [ ] Firewall configurado
- [ ] Backup automático testado
- [ ] Health checks verificados
- [ ] Acesso ao sistema testado
- [ ] Documentação revisada pela equipe

---

**Desenvolvido com ❤️ para a Associação Coração de Cristo**

*"Tecnologia a serviço da educação infantil de qualidade"*
