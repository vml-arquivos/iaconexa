# 🛡️ SISTEMA VALENTE v1.0

**ERP Educacional para Rede CoCris de Creches (0-4 anos)**

> *"Tecnologia que transforma vidas, educação que inspira"*

---

## 🎯 Sobre o Projeto

O **SISTEMA VALENTE** é um ERP Educacional completo, focado em **dignidade humana**, **proteção à criança** e **automatização de burocracia governamental** para a rede de 7 creches da Associação Coração de Cristo.

### Missão:
- ✅ Garantir que **nenhuma criança fique sem insumos essenciais**
- ✅ **Detectar precocemente** problemas de desenvolvimento
- ✅ **Reduzir 95% da burocracia** com documentos automáticos
- ✅ Proporcionar **educação de qualidade** alinhada à BNCC

---

## 🏗️ Arquitetura

### Stack Tecnológica:

**Backend**:
- Node.js + Express
- Prisma ORM + PostgreSQL
- TypeScript

**Frontend**:
- React + Vite
- TailwindCSS
- TypeScript

**IA e Automação**:
- OpenAI GPT-4
- PDFKit
- Cron Jobs

**Infraestrutura**:
- Docker Compose
- Nginx
- Backup automático

---

## 📦 Módulos Principais

### 🛡️ Módulo ZELO (Gestão de Insumos)
"Não deixar faltar o que é essencial"

- Previsão de consumo
- Alertas automáticos (< 3 dias)
- Recomendação de pedido
- Dashboard completo

### 🧠 Módulo SUPER PEDAGOGO (IA Mentora)
"Educação de qualidade com tecnologia"

- Atividades BNCC com IA
- Análise de desenvolvimento
- Alertas para psicóloga
- Sugestões personalizadas

### 📄 Módulo BUREAUCRACY KILLER (Documentos Oficiais)
"Menos papel, mais tempo com as crianças"

- Diário de Classe (PDF)
- RIA - Relatório Individual (PDF)
- Análises automáticas
- Texto descritivo personalizado

---

## 🚀 Instalação Rápida

### 1. Clonar repositório:
```bash
git clone https://github.com/vml-arquivos/conexa.git
cd conexa
```

### 2. Configurar ambiente:
```bash
cp .env.production.example .env.production
nano .env.production
```

### 3. Iniciar com Docker:
```bash
docker compose -f docker-compose.production.yml up -d --build
```

### 4. Executar migrations:
```bash
docker exec cocris_api npx prisma migrate deploy
docker exec cocris_api npx tsx prisma/seed_cocris.ts
```

### 5. Acessar:
- Landing Page: http://localhost/
- Dashboard: http://localhost/dashboard

---

## 📚 Documentação

### Para Gestores:
- [ENTREGA_FINAL_VALENTE.md](./ENTREGA_FINAL_VALENTE.md) - Visão geral completa
- [RESUMO_ENTREGA.md](./RESUMO_ENTREGA.md) - Resumo executivo

### Para Desenvolvedores:
- [PHASE1_DATABASE_HIERARCHY.md](./PHASE1_DATABASE_HIERARCHY.md) - Backend e RBAC
- [PHASE2_INTELLIGENCE_AUTOMATION.md](./PHASE2_INTELLIGENCE_AUTOMATION.md) - Módulos inteligentes
- [PHASE3_FRONTEND_EXPERIENCE.md](./PHASE3_FRONTEND_EXPERIENCE.md) - Frontend e identidade

### Para DevOps:
- [GUIA_INSTALACAO.md](./GUIA_INSTALACAO.md) - Instalação passo a passo

---

## 🔐 Segurança

### RBAC (Role-Based Access Control):

**NÍVEL 1: MATRIZ** (Poder Total)
- MATRIZ_ADMIN - Gestão completa
- MATRIZ_COORD - Coordenação pedagógica
- MATRIZ_NUTRI - Nutricionista da rede
- MATRIZ_PSYCHO - Psicóloga (prontuários sigilosos)

**NÍVEL 2: UNIDADE** (Gestão Local)
- UNIT_DIRECTOR - Diretor da unidade
- UNIT_SECRETARY - Secretária

**NÍVEL 3: SALA** (Visão Restrita)
- TEACHER - Professor (acesso apenas à sua turma)

---

## 📊 Impacto Esperado

| Métrica | Valor |
|---------|-------|
| Faltas de insumos críticos | **Zero** |
| Redução de burocracia | **95%** |
| Horas economizadas/ano | **24.000** |
| ROI anual | **R$ 480.000** |
| Detecção precoce | **100%** |

---

## 🎨 Identidade Visual

### Cores:
- **Azul** (#2563EB): Confiança
- **Rosa** (#E11D48): Afeto
- **Roxo** (#9333EA): Criatividade

### Logo:
- Coração ❤️ + Gradiente
- Nome "VALENTE" em bold
- Subtítulo "Sistema CoCris"

---

## 📞 Contatos

**Cliente**: Associação Beneficente Coração de Cristo  
**E-mail**: contato@cocris.org  
**Telefone**: (61) 3575-4125  
**Site**: https://cocris.org

**Repositório**: https://github.com/vml-arquivos/conexa

---

## 📝 Licença

Propriedade da Associação Beneficente Coração de Cristo.  
Todos os direitos reservados.

---

## 🎉 Status do Projeto

**Versão**: 1.0  
**Status**: ✅ Completo e Pronto para Deploy  
**Data**: 31 de Janeiro de 2026

---

**"Valente é quem cuida, quem protege, quem transforma"** ❤️
