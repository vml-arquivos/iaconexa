# 🚀 QUICK DEPLOY GUIDE
## SISTEMA CONEXA v1.0 - One-Click Installation

**Target**: Fresh VPS (DigitalOcean Droplet) - Ubuntu 24.04 LTS  
**Time**: ~10 minutes  
**Difficulty**: Easy ⭐

---

## 📋 PRÉ-REQUISITOS

### VPS Requirements:
- **OS**: Ubuntu 24.04 LTS (64-bit)
- **RAM**: 2GB mínimo (4GB recomendado)
- **Storage**: 20GB mínimo (40GB recomendado)
- **CPU**: 2 cores mínimo
- **Network**: Acesso SSH (porta 22)

### Local Requirements:
- SSH client
- Git (opcional)

---

## 🎯 MÉTODO 1: INSTALAÇÃO AUTOMÁTICA (RECOMENDADO)

### Passo 1: Conectar ao VPS

```bash
ssh root@SEU_IP_VPS
```

### Passo 2: Criar Usuário (se necessário)

```bash
# Criar usuário
adduser conexa

# Adicionar ao grupo sudo
usermod -aG sudo conexa

# Trocar para o usuário
su - conexa
```

### Passo 3: Baixar e Executar Script

```bash
# Clonar repositório
git clone https://github.com/vml-arquivos/conexa.git
cd conexa

# Executar instalação
./setup_vps.sh
```

### Passo 4: Seguir Prompts Interativos

O script irá perguntar:

1. **Habilitar IA Mentora?** (y/N)
   - Se sim, forneça sua OpenAI API Key

2. **Configurar SMTP?** (y/N)
   - Se sim, forneça:
     - SMTP Host (ex: smtp.gmail.com)
     - SMTP Port (ex: 587)
     - SMTP User (seu e-mail)
     - SMTP Password

### Passo 5: Aguardar Conclusão

O script irá:
- ✅ Atualizar sistema
- ✅ Instalar Docker
- ✅ Configurar firewall
- ✅ Gerar senhas seguras
- ✅ Build das imagens
- ✅ Iniciar serviços

**Tempo estimado**: 5-10 minutos

### Passo 6: Acessar Sistema

```
URL: http://SEU_IP_VPS
E-mail: admin@cocris.org
Senha: admin123
```

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

---

## 🛠️ MÉTODO 2: INSTALAÇÃO MANUAL

### Passo 1: Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### Passo 2: Instalar Docker

```bash
# Instalar dependências
sudo apt install -y ca-certificates curl gnupg lsb-release

# Adicionar chave GPG
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
```

### Passo 3: Clonar Repositório

```bash
git clone https://github.com/vml-arquivos/conexa.git
cd conexa
```

### Passo 4: Configurar .env

```bash
# Copiar exemplo
cp .env.example .env

# Gerar senhas
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)

# Editar .env
nano .env

# Atualizar:
# - JWT_SECRET=$JWT_SECRET
# - SESSION_SECRET=$SESSION_SECRET
# - POSTGRES_PASSWORD=$DB_PASSWORD
# - DATABASE_URL (atualizar senha)
```

### Passo 5: Criar Diretórios

```bash
mkdir -p pgdata uploads logs backups nginx/ssl
```

### Passo 6: Build e Iniciar

```bash
# Build
docker compose -f docker-compose.prod.yml build

# Iniciar
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🔒 PÓS-INSTALAÇÃO (SEGURANÇA)

### 1. Configurar Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar status
sudo ufw status
```

### 2. Configurar SSL/HTTPS

```bash
# Instalar Certbot
sudo apt install -y certbot

# Obter certificado (substitua seu domínio)
sudo certbot certonly --standalone -d conexa.cocris.org

# Copiar certificados
sudo cp /etc/letsencrypt/live/conexa.cocris.org/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/conexa.cocris.org/privkey.pem nginx/ssl/

# Descomentar seção HTTPS no nginx.conf
nano nginx/nginx.conf

# Reiniciar frontend
docker compose -f docker-compose.prod.yml restart frontend
```

### 3. Configurar Backup Automático

```bash
# Criar script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec conexa_db_prod pg_dump -U conexa_admin conexa_prod | gzip > backups/backup_$DATE.sql.gz
find backups/ -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Adicionar ao cron (diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/conexa/conexa/backup.sh") | crontab -
```

### 4. Alterar Senha Padrão

1. Acesse: http://SEU_IP_VPS
2. Login: admin@cocris.org / admin123
3. Vá em: Perfil → Alterar Senha
4. Defina uma senha forte (mínimo 12 caracteres)

---

## 📊 VERIFICAÇÃO DE SAÚDE

### Comandos Úteis:

```bash
# Ver status dos serviços
docker compose -f docker-compose.prod.yml ps

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs -f backend

# Verificar health checks
curl http://localhost:3001/health
curl http://localhost:3001/ready
curl http://localhost:3001/live

# Verificar uso de recursos
docker stats

# Reiniciar serviços
docker compose -f docker-compose.prod.yml restart

# Parar sistema
docker compose -f docker-compose.prod.yml down

# Iniciar sistema
docker compose -f docker-compose.prod.yml up -d
```

### Health Endpoints:

| Endpoint | Descrição | Status Esperado |
|----------|-----------|-----------------|
| `/health` | Status geral da API | 200 OK |
| `/ready` | Sistema pronto para requisições | 200 OK |
| `/live` | Processo está vivo | 200 OK |

---

## 🐛 TROUBLESHOOTING

### Problema: Backend não inicia

**Sintoma**: `docker compose ps` mostra backend como "unhealthy"

**Solução**:
```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs backend

# Verificar se banco está pronto
docker exec conexa_db_prod pg_isready -U conexa_admin

# Reiniciar backend
docker compose -f docker-compose.prod.yml restart backend
```

### Problema: Migrations falham

**Sintoma**: Erro "relation does not exist"

**Solução**:
```bash
# Entrar no container
docker exec -it conexa_api_prod sh

# Executar migrations manualmente
npx prisma migrate deploy

# Executar seed (se necessário)
npx prisma db seed
```

### Problema: Frontend não carrega

**Sintoma**: Página em branco ou erro 502

**Solução**:
```bash
# Verificar se backend está respondendo
curl http://localhost:3001/health

# Verificar logs do Nginx
docker compose -f docker-compose.prod.yml logs frontend

# Reiniciar frontend
docker compose -f docker-compose.prod.yml restart frontend
```

### Problema: Banco de dados corrompido

**Sintoma**: Erros de conexão ou dados inconsistentes

**Solução**:
```bash
# Parar sistema
docker compose -f docker-compose.prod.yml down

# Fazer backup (se possível)
cp -r pgdata pgdata_backup

# Remover dados corrompidos
rm -rf pgdata

# Reiniciar (irá criar banco novo)
docker compose -f docker-compose.prod.yml up -d
```

---

## 📈 MONITORAMENTO

### Logs:

```bash
# Logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Últimas 100 linhas
docker compose -f docker-compose.prod.yml logs --tail=100

# Logs de um período específico
docker compose -f docker-compose.prod.yml logs --since 1h
```

### Métricas:

```bash
# Uso de recursos
docker stats

# Espaço em disco
df -h

# Uso de memória
free -h

# Processos
htop
```

### Alertas:

Configure monitoramento externo:
- **Uptime Robot**: https://uptimerobot.com
- **Pingdom**: https://www.pingdom.com
- **StatusCake**: https://www.statuscake.com

---

## 🔄 ATUALIZAÇÕES

### Atualizar Sistema:

```bash
# Entrar no diretório
cd conexa

# Fazer backup
./backup.sh

# Baixar atualizações
git pull origin main

# Rebuild
docker compose -f docker-compose.prod.yml build

# Reiniciar
docker compose -f docker-compose.prod.yml up -d

# Verificar logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 📞 SUPORTE

### Documentação:
- **README.md**: Visão geral
- **PRE_FLIGHT_AUDIT_REPORT.md**: Auditoria técnica
- **INFRA_PRODUCTION_READY.md**: Detalhes de infraestrutura

### Repositório:
- **GitHub**: https://github.com/vml-arquivos/conexa

### Contato:
- **E-mail**: contato@cocris.org
- **Telefone**: (61) 3575-4125

---

## ✅ CHECKLIST DE DEPLOY

### Pré-Deploy:
- [ ] VPS provisionado (Ubuntu 24.04)
- [ ] Acesso SSH configurado
- [ ] Domínio apontado para IP (opcional)

### Durante Deploy:
- [ ] Script setup_vps.sh executado
- [ ] Senhas geradas automaticamente
- [ ] Serviços iniciados com sucesso
- [ ] Health checks passando

### Pós-Deploy:
- [ ] Senha padrão alterada
- [ ] Firewall configurado
- [ ] SSL/HTTPS configurado (produção)
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Testes de smoke realizados

---

## 🎉 CONCLUSÃO

Após seguir este guia, o **SISTEMA CONEXA v1.0** estará:

✅ Instalado e rodando  
✅ Acessível via navegador  
✅ Seguro (firewall + fail2ban)  
✅ Pronto para uso em produção

**Tempo total**: ~10 minutos

**"Conectando Vidas com Tecnologia e Dignidade"** ❤️

---

**Data**: 31 de Janeiro de 2026  
**Versão**: 1.0  
**Status**: ✅ **PRODUCTION READY**
