# 🚀 Guia de Deploy - DigitalOcean Droplet

**SISTEMA CONEXA v1.0**  
**Deploy Zero-Touch para DigitalOcean**

---

## 📋 Especificações da Droplet

### Configuração Recomendada:

| Especificação | Valor | Justificativa |
|---------------|-------|---------------|
| **Distribuição** | Ubuntu 24.04 LTS x64 | Estabilidade e suporte de longo prazo |
| **Plano** | Basic Droplet | Suficiente para 50+ usuários |
| **CPU** | 2 vCPUs | Recomendado (mínimo 1 vCPU) |
| **RAM** | 4 GB | Recomendado (mínimo 2 GB) |
| **Storage** | 80 GB SSD | Recomendado (mínimo 40 GB) |
| **Região** | São Paulo (spo1) | Menor latência para Brasil |
| **Backups** | Habilitado | Segurança adicional |
| **IPv6** | Habilitado | Futuro-proof |
| **Monitoring** | Habilitado | Observabilidade |

### Planos DigitalOcean:

**Opção 1: Produção (Recomendado)**
- **$24/mês** - 2 vCPUs, 4 GB RAM, 80 GB SSD
- Suporta 50+ usuários simultâneos
- Performance excelente

**Opção 2: Desenvolvimento/Teste**
- **$12/mês** - 1 vCPU, 2 GB RAM, 50 GB SSD
- Suporta 20 usuários simultâneos
- Funcional mas com limitações

**Opção 3: Escala (Futuro)**
- **$48/mês** - 4 vCPUs, 8 GB RAM, 160 GB SSD
- Suporta 100+ usuários simultâneos
- Preparado para crescimento

---

## 🎯 Checklist de Criação da Droplet

### 1. Criar Droplet no DigitalOcean

1. Acesse: https://cloud.digitalocean.com/droplets/new
2. **Choose an image**: Ubuntu 24.04 LTS x64
3. **Choose a plan**: Basic → $24/mês (2 vCPUs, 4 GB RAM)
4. **Choose a datacenter region**: São Paulo - spo1
5. **Authentication**: 
   - ✅ **SSH Key** (recomendado) ou
   - ⚠️ Password (menos seguro)
6. **Additional options**:
   - ✅ Enable backups
   - ✅ Enable IPv6
   - ✅ Enable monitoring
7. **Hostname**: `conexa-prod` (ou nome de sua escolha)
8. **Tags**: `conexa`, `production`, `erp`
9. Clicar em **Create Droplet**

### 2. Aguardar Criação

- Tempo: ~60 segundos
- Você receberá o **IP público** da Droplet

### 3. Anotar Informações

```
IP Público: ___.___.___.___ (anote aqui)
Usuário: root
Senha/SSH Key: (conforme configurado)
```

---

## 🚀 Deploy em 3 Comandos

### Passo 1: Conectar à Droplet

```bash
ssh root@SEU_IP_AQUI
```

Se usar SSH Key:
```bash
ssh -i ~/.ssh/sua_chave root@SEU_IP_AQUI
```

### Passo 2: Clonar Repositório

```bash
git clone https://github.com/vml-arquivos/conexa.git
cd conexa
```

### Passo 3: Executar Setup

```bash
chmod +x setup_vps.sh
./setup_vps.sh
```

**Tempo total**: ~10 minutos

---

## 🔧 O Que o Script Faz Automaticamente

### ✅ Instalação (Steps 1-3):
1. Atualiza Ubuntu 24.04
2. Instala Docker + Docker Compose
3. Configura firewall (UFW)
4. Instala Fail2Ban (segurança)

### ✅ Configuração (Steps 4-5):
5. Gera arquivo `.env` com senhas seguras
6. Cria diretórios necessários

### ✅ Deploy (Steps 6-8):
7. Executa `docker compose up -d`
8. Aguarda serviços ficarem prontos
9. Verifica health checks

### ✅ Banco de Dados (Automático):
- Cria banco PostgreSQL
- Executa migrations
- Popula dados iniciais (seed):
  - 7 unidades CoCris
  - 5 usuários de teste
  - 1 super admin
  - Campos BNCC
  - Templates pedagógicos

---

## 🎉 Após o Deploy

### Acessar o Sistema:

```
URL: http://SEU_IP_AQUI
E-mail: admin@cocris.org
Senha: admin123
```

⚠️ **IMPORTANTE**: Altere a senha padrão imediatamente!

### Verificar Status:

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Ver serviços
docker compose -f docker-compose.prod.yml ps

# Verificar health
curl http://localhost:3001/health
```

---

## 🔒 Segurança Pós-Deploy

### 1. Alterar Senha do Admin

1. Fazer login no sistema
2. Ir em **Configurações** → **Perfil**
3. Alterar senha para uma forte

### 2. Configurar Domínio (Opcional)

Se você tem um domínio (ex: `conexa.cocris.org`):

```bash
# 1. Apontar domínio para o IP da Droplet (DNS A Record)
# 2. Aguardar propagação DNS (~5 minutos)
# 3. Configurar SSL/TLS:

cd /home/ubuntu/conexa
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d conexa.cocris.org
```

### 3. Configurar Backup Automático

```bash
# Adicionar ao crontab
crontab -e

# Adicionar linha (backup diário às 2h):
0 2 * * * cd /home/ubuntu/conexa && ./scripts/backup.sh
```

---

## 📊 Monitoramento

### Verificar Recursos:

```bash
# CPU e RAM
htop

# Espaço em disco
df -h

# Logs do Docker
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Métricas no DigitalOcean:

1. Acesse: https://cloud.digitalocean.com/droplets
2. Clique na sua Droplet
3. Aba **Graphs**: CPU, RAM, Disk, Network

---

## 🆘 Troubleshooting

### Problema: Serviço não inicia

```bash
# Ver logs detalhados
docker compose -f docker-compose.prod.yml logs backend

# Reiniciar serviço
docker compose -f docker-compose.prod.yml restart backend
```

### Problema: Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
docker compose -f docker-compose.prod.yml ps db

# Ver logs do banco
docker compose -f docker-compose.prod.yml logs db
```

### Problema: Migrations falham

```bash
# Executar migrations manualmente
docker exec conexa_api_prod npx prisma migrate deploy

# Executar seed manualmente
docker exec conexa_api_prod npx prisma db seed
```

### Problema: Porta 80 já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :80

# Parar serviço conflitante
sudo systemctl stop apache2  # ou nginx
```

---

## 🔄 Atualizar o Sistema

### Quando houver nova versão:

```bash
cd /home/ubuntu/conexa

# 1. Fazer backup
./scripts/backup.sh

# 2. Puxar atualizações
git pull origin master

# 3. Rebuild e restart
docker compose -f docker-compose.prod.yml up -d --build

# 4. Executar migrations (se houver)
docker exec conexa_api_prod npx prisma migrate deploy
```

---

## 📞 Suporte

### Documentação Completa:
- `DEPLOY_READY_FINAL_REPORT.md`
- `QUICK_DEPLOY_GUIDE.md`
- `INFRA_PRODUCTION_READY.md`

### Contato:
- **E-mail**: contato@cocris.org
- **Telefone**: (61) 3575-4125
- **Site**: https://cocris.org

---

## ✅ Checklist Final

Após o deploy, verifique:

- [ ] Sistema acessível via IP
- [ ] Login com admin@cocris.org funciona
- [ ] Senha alterada
- [ ] 7 unidades CoCris aparecem
- [ ] Dashboard carrega corretamente
- [ ] Firewall ativo (UFW)
- [ ] Fail2Ban ativo
- [ ] Backup configurado
- [ ] Monitoramento ativo

---

## 🎯 Resumo dos Comandos

```bash
# 1. Conectar
ssh root@SEU_IP

# 2. Deploy
git clone https://github.com/vml-arquivos/conexa.git
cd conexa
./setup_vps.sh

# 3. Acessar
# http://SEU_IP
# admin@cocris.org / admin123

# 4. Verificar
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3001/health
```

---

**"Conectando Vidas com Tecnologia e Dignidade"** ❤️

**SISTEMA CONEXA v1.0 - Deploy Ready!**

---

**Data**: Janeiro de 2026  
**Versão**: 1.0  
**Status**: ✅ Production Ready
