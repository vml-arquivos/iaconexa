# 🎓 SISTEMA CONEXA v1.0

**ERP Educacional com IA para Redes de Educação Infantil**

> *"Tecnologia que transforma vidas, educação que inspira"*

---

## 📋 Visão Geral

O **SISTEMA CONEXA** é um ERP Educacional completo, focado em **dignidade humana**, **proteção à criança** e **automatização de processos** para redes de creches e educação infantil.

### 🎯 Objetivos Principais

- ✅ Garantir que nenhuma criança fique sem insumos essenciais
- ✅ Detectar precocemente problemas de desenvolvimento
- ✅ Reduzir 95% da burocracia com documentos automáticos
- ✅ Proporcionar educação de qualidade alinhada à BNCC

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| **Frontend** | React + Vite + TailwindCSS | 19.2 + 7.1 + 4.1 |
| **Backend** | Node.js + Express | 20+ |
| **Linguagem** | TypeScript | 5.6 |
| **Database** | PostgreSQL | 15 |
| **ORM** | Prisma | 5.22 |
| **IA** | OpenAI GPT-4 | - |
| **Container** | Docker + Docker Compose | - |
| **Reverse Proxy** | Nginx | Latest |

### Estrutura de Diretórios

```
conexa/
├── client/                    # Frontend React/Vite
├── server/                    # Backend Node.js/Express
├── prisma/                    # Configuração do banco
├── infra/                     # Infraestrutura (Docker, Nginx, scripts)
├── docs/                      # Documentação
├── shared/                    # Código compartilhado
├── docker-compose.yml        # Ambiente de desenvolvimento
├── setup.sh                  # Script de setup automático
└── README.md
```

---

## 🚀 Quick Start

### Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (opcional, para desenvolvimento local)

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/vml-arquivos/iaconexa.git
cd iaconexa

# 2. Execute o script de setup
chmod +x setup.sh
./setup.sh

# 3. Acesse a aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

---

## 🐳 Docker

### Iniciar Containers

```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose -f infra/docker-compose.prod.yml up -d
```

### Parar Containers

```bash
docker-compose down
```

### Ver Logs

```bash
docker-compose logs -f
```

---

## 🔧 Desenvolvimento

### Instalação Manual

```bash
# Backend
cd server && npm install && npm run dev

# Frontend (novo terminal)
cd client && npm install && npm run dev
```

### Comandos Úteis

```bash
# Backend
npm run build:server           # Build para produção
npm run prisma:generate       # Gerar cliente Prisma
npm run prisma:migrate        # Criar nova migração
npm run prisma:studio         # Abrir Prisma Studio

# Frontend
npm run build                 # Build para produção
npm run check                 # Type checking
```

---

## 🗄️ Database

### Conexão Local

```
Host: localhost
Port: 5432
User: conexa_admin
Password: conexa_dev_password
Database: conexa_dev
```

### Prisma Studio

```bash
cd server && npm run prisma:studio
```

Acessa em: http://localhost:5555

---

## 📚 Documentação Adicional

- [Arquitetura Técnica](docs/ETAPA1_ARQUITETURA_DADOS.md)
- [Lógica de Negócio](docs/ETAPA2_LOGICA_NEGOCIO.md)
- [Frontend e Deploy](docs/ETAPA3_FRONTEND_DEPLOY.md)
- [Guia de Instalação](docs/GUIA_INSTALACAO.md)
- [Deploy em Produção](docs/INFRA_PRODUCTION_READY.md)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

## 📝 Licença

MIT License - veja LICENSE para detalhes

---

## 👥 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através de:
- Issues: https://github.com/vml-arquivos/iaconexa/issues

---

**"Nenhuma criança fica para trás"** ❤️
