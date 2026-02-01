# ✅ Checklist de Deploy - SISTEMA CONEXA v1.0

**Deploy Zero-Touch para DigitalOcean Droplet**

---

## 📋 PRÉ-DEPLOY

### 1. Criar Droplet DigitalOcean

- [ ] Acesse: https://cloud.digitalocean.com/droplets/new
- [ ] Imagem: **Ubuntu 24.04 LTS x64**
- [ ] Plano: **Basic - $24/mês** (2 vCPUs, 4 GB RAM, 80 GB SSD)
- [ ] Região: **São Paulo (spo1)**
- [ ] Autenticação: **SSH Key** (recomendado)
- [ ] Opções adicionais:
  - [ ] ✅ Enable backups
  - [ ] ✅ Enable IPv6
  - [ ] ✅ Enable monitoring
- [ ] Hostname: `conexa-prod`
- [ ] Tags: `conexa`, `production`, `erp`
- [ ] Criar Droplet

### 2. Anotar Informações

```
IP Público: ___.___.___.___ 
Usuário: root
SSH Key: ~/.ssh/___________
```

---

## 🚀 DEPLOY (3 Comandos)

### Passo 1: Conectar

```bash
ssh root@SEU_IP_AQUI
```

- [ ] Conexão SSH estabelecida

### Passo 2: Clonar Repositório

```bash
git clone https://github.com/vml-arquivos/conexa.git
cd conexa
```

- [ ] Repositório clonado
- [ ] Diretório `conexa` criado

### Passo 3: Executar Setup

```bash
chmod +x setup_vps.sh
./setup_vps.sh
```

- [ ] Script iniciado
- [ ] Aguardar ~10 minutos

---

## ⏱️ DURANTE O DEPLOY

O script executará automaticamente:

- [ ] **STEP 1**: Atualizar sistema Ubuntu
- [ ] **STEP 2**: Instalar Docker + Docker Compose
- [ ] **STEP 3**: Configurar firewall (UFW)
- [ ] **STEP 4**: Instalar Fail2Ban
- [ ] **STEP 5**: Gerar arquivo `.env` com senhas seguras
- [ ] **STEP 6**: Criar diretórios necessários
- [ ] **STEP 7**: Executar `docker compose up -d`
- [ ] **STEP 8**: Aguardar serviços ficarem prontos
- [ ] **STEP 9**: Verificar health checks
- [ ] **STEP 10**: Exibir credenciais de acesso

---

## 🎉 PÓS-DEPLOY

### 1. Verificar Serviços

```bash
docker compose -f docker-compose.prod.yml ps
```

Deve mostrar:
- [ ] `conexa_db_prod` - **Up** (healthy)
- [ ] `conexa_api_prod` - **Up** (healthy)
- [ ] `conexa_web_prod` - **Up**

### 2. Acessar Sistema

```
URL: http://SEU_IP_AQUI
E-mail: admin@cocris.org
Senha: admin123
```

- [ ] Sistema acessível via navegador
- [ ] Login realizado com sucesso
- [ ] Dashboard carrega corretamente

### 3. Verificar Dados Iniciais

No sistema, verificar:
- [ ] 7 unidades CoCris aparecem
- [ ] 5 usuários de teste criados
- [ ] Campos BNCC carregados
- [ ] Templates pedagógicos disponíveis

### 4. Alterar Senha Padrão

- [ ] Ir em **Configurações** → **Perfil**
- [ ] Alterar senha de `admin123` para senha forte
- [ ] Confirmar nova senha

---

## 🔒 SEGURANÇA

### 1. Firewall

```bash
sudo ufw status
```

- [ ] UFW ativo
- [ ] Portas 22, 80, 443 abertas
- [ ] Outras portas bloqueadas

### 2. Fail2Ban

```bash
sudo systemctl status fail2ban
```

- [ ] Fail2Ban ativo e rodando

### 3. SSL/TLS (Opcional - Se tiver domínio)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com
```

- [ ] Certificado SSL instalado
- [ ] HTTPS funcionando

---

## 📊 MONITORAMENTO

### 1. Logs do Sistema

```bash
# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver últimas 100 linhas
docker compose -f docker-compose.prod.yml logs --tail=100
```

- [ ] Logs acessíveis
- [ ] Sem erros críticos

### 2. Health Checks

```bash
# API Health
curl http://localhost:3001/health

# API Ready
curl http://localhost:3001/ready

# API Live
curl http://localhost:3001/live
```

- [ ] `/health` retorna 200 OK
- [ ] `/ready` retorna 200 OK
- [ ] `/live` retorna 200 OK

### 3. Recursos do Servidor

```bash
# CPU e RAM
htop

# Espaço em disco
df -h

# Processos Docker
docker stats
```

- [ ] CPU < 80%
- [ ] RAM < 80%
- [ ] Disco < 80%

---

## 🔄 BACKUP

### Configurar Backup Automático

```bash
# Testar backup manual
cd /home/ubuntu/conexa
./scripts/backup.sh
```

- [ ] Backup criado em `./backups/`
- [ ] Arquivo `.sql.gz` gerado

### Agendar Backup Diário

```bash
crontab -e

# Adicionar linha (backup diário às 2h):
0 2 * * * cd /home/ubuntu/conexa && ./scripts/backup.sh
```

- [ ] Cron job configurado
- [ ] Backup automático ativo

---

## 📞 SUPORTE

### Documentação:
- [ ] `DIGITALOCEAN_DEPLOY_GUIDE.md` - Guia completo
- [ ] `DEPLOY_READY_FINAL_REPORT.md` - Relatório técnico
- [ ] `QUICK_DEPLOY_GUIDE.md` - Guia rápido

### Contato:
- **E-mail**: contato@cocris.org
- **Telefone**: (61) 3575-4125
- **Site**: https://cocris.org

---

## ✅ CHECKLIST FINAL

Após completar todos os passos acima:

- [ ] ✅ Droplet criada e configurada
- [ ] ✅ Deploy executado com sucesso
- [ ] ✅ Sistema acessível via IP
- [ ] ✅ Login funcionando
- [ ] ✅ Senha alterada
- [ ] ✅ Dados iniciais carregados
- [ ] ✅ Firewall ativo
- [ ] ✅ Fail2Ban ativo
- [ ] ✅ Logs sem erros
- [ ] ✅ Health checks OK
- [ ] ✅ Backup configurado
- [ ] ✅ Monitoramento ativo

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Conectar
ssh root@SEU_IP

# Deploy
git clone https://github.com/vml-arquivos/conexa.git
cd conexa
./setup_vps.sh

# Verificar
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3001/health

# Logs
docker compose -f docker-compose.prod.yml logs -f

# Restart
docker compose -f docker-compose.prod.yml restart

# Stop
docker compose -f docker-compose.prod.yml down

# Start
docker compose -f docker-compose.prod.yml up -d

# Backup
./scripts/backup.sh

# Restore
./scripts/restore.sh backups/backup_YYYY-MM-DD_HH-MM-SS.sql.gz
```

---

## 🚨 TROUBLESHOOTING RÁPIDO

### Serviço não inicia:
```bash
docker compose -f docker-compose.prod.yml logs NOME_DO_SERVICO
docker compose -f docker-compose.prod.yml restart NOME_DO_SERVICO
```

### Banco não conecta:
```bash
docker compose -f docker-compose.prod.yml logs db
docker compose -f docker-compose.prod.yml restart db
```

### Migrations falham:
```bash
docker exec conexa_api_prod npx prisma migrate deploy
docker exec conexa_api_prod npx prisma db seed
```

### Porta 80 ocupada:
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # ou nginx
```

---

**"Conectando Vidas com Tecnologia e Dignidade"** ❤️

**SISTEMA CONEXA v1.0 - Deploy Checklist**

---

**Data**: Janeiro de 2026  
**Versão**: 1.0  
**Status**: ✅ Ready to Deploy
