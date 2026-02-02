# 📋 TAREFA 1: MODELAGEM DE HIERARQUIA E UNIDADES

**Data:** 02 de Fevereiro de 2026  
**Status:** ✅ **CONCLUÍDA**  
**Commit:** `d58aa1b`  
**Migration:** `20260202000000_multi_unit_structure_and_hierarchical_roles`

---

## 🎯 Objetivo

Configurar a estrutura Multi-Unidades e os níveis de acesso (Roles) no Sistema Conexa para suportar hierarquia organizacional completa.

---

## ✅ Ações Realizadas

### 1. SCHEMA: Criação da Tabela `Unit`

**Arquivo:** `prisma/schema.prisma`

#### Novo Enum `UnitType`

```prisma
enum UnitType {
  MATRIZ
  UNIDADE
}
```

#### Novo Model `Unit`

```prisma
model Unit {
  id            String   @id @default(uuid())
  name          String
  code          String   @unique
  address       String?
  phone         String?
  email         String?
  type          UnitType @default(UNIDADE)
  
  associationId String
  association   Association @relation(fields: [associationId], references: [id])
  
  users         User[]
  students      Student[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Características:**
- Identificador único (`id`)
- Código único para cada unidade (`code`)
- Tipo de unidade: `MATRIZ` ou `UNIDADE`
- Relacionamento com `Association` (matriz organizacional)
- Relacionamentos com `User` e `Student`

---

### 2. ROLES: Hierarquia Completa de Papéis

**Enum `UserRole` atualizado:**

```prisma
enum UserRole {
  MATRIZ_ADMIN              // Administrador da Matriz
  COORDENADOR_GERAL         // Coordenador Geral (Matriz)
  DIRETOR_UNIDADE           // Diretor de Unidade
  COORDENADOR_PEDAGOGICO    // Coordenador Pedagógico (Unidade)
  PROFESSOR                 // Professor (Unidade)
  NUTRICIONISTA             // Nutricionista (Matriz/Unidade)
  PSICOLOGO                 // Psicólogo (Matriz/Unidade)
  SECRETARIO                // Secretário (Unidade)
}
```

**Hierarquia Organizacional:**

```
MATRIZ
├── MATRIZ_ADMIN (Administração Geral)
├── COORDENADOR_GERAL (Coordenação Geral)
├── NUTRICIONISTA (Suporte Nutricional)
└── PSICOLOGO (Suporte Psicológico)

UNIDADE
├── DIRETOR_UNIDADE (Gestão da Unidade)
├── COORDENADOR_PEDAGOGICO (Coordenação Pedagógica)
├── SECRETARIO (Secretaria)
└── PROFESSOR (Sala de Aula)
```

---

### 3. VINCULAÇÃO: Relacionamentos User e Student com Unit

#### Model `User` atualizado:

```prisma
model User {
  // ... campos existentes
  
  unitId      String?
  unit        Unit?    @relation(fields: [unitId], references: [id])
  
  // ... outros campos
}
```

#### Model `Student` atualizado:

```prisma
model Student {
  // ... campos existentes
  
  unitId      String?
  unit        Unit?    @relation(fields: [unitId], references: [id])
  
  // ... outros campos
}
```

**Benefícios:**
- Cada usuário e aluno está vinculado a uma unidade específica
- Permite controle de acesso baseado em unidade
- Facilita relatórios e análises por unidade

---

### 4. SEED: Dados Iniciais Completos

**Arquivo:** `prisma/seed.ts`

#### Estrutura Criada:

**1 Associação:**
- Associação Beneficente Coração de Cristo

**3 Unidades:**
1. **Matriz CoCris** (MATRIZ)
   - Código: `MATRIZ-001`
   - Email: matriz@cocris.org

2. **CEPI Arara Canindé** (UNIDADE)
   - Código: `UNIDADE-001`
   - Email: arara@cocris.org

3. **CEPI Beija-Flor** (UNIDADE)
   - Código: `UNIDADE-002`
   - Email: beijaflor@cocris.org

**10 Usuários com Hierarquia:**

| Email | Role | Unidade | Nome |
|-------|------|---------|------|
| admin@cocris.org | MATRIZ_ADMIN | Matriz | Administrador CoCris |
| coordenador.geral@cocris.org | COORDENADOR_GERAL | Matriz | Maria Coordenadora Geral |
| nutri@cocris.org | NUTRICIONISTA | Matriz | Ana Nutricionista |
| psicologo@cocris.org | PSICOLOGO | Matriz | Carlos Psicólogo |
| diretor.unidade1@cocris.org | DIRETOR_UNIDADE | Unidade 1 | João Diretor - Arara Canindé |
| coord.ped.unidade1@cocris.org | COORDENADOR_PEDAGOGICO | Unidade 1 | Beatriz Coordenadora Pedagógica |
| secretario.unidade1@cocris.org | SECRETARIO | Unidade 1 | Paula Secretária - Arara |
| professor.unidade1@cocris.org | PROFESSOR | Unidade 1 | Carla Professora - Arara |
| diretor.unidade2@cocris.org | DIRETOR_UNIDADE | Unidade 2 | Roberto Diretor - Beija-Flor |
| professor.unidade2@cocris.org | PROFESSOR | Unidade 2 | Fernanda Professora - Beija-Flor |

**Senha padrão para todos:** `admin123`

**4 Alunos:**
- 2 alunos na Unidade 1 (Arara Canindé)
  - Miguel Silva (MAT-2026-001)
  - Sofia Santos (MAT-2026-002)
  
- 2 alunos na Unidade 2 (Beija-Flor)
  - Lucas Oliveira (MAT-2026-003)
  - Isabella Costa (MAT-2026-004)

**2 Turmas:**
- Berçário 1 - Arara (0-1 anos, 15 vagas)
- Maternal 1 - Beija-Flor (1-2 anos, 18 vagas)

---

## 🗄️ Migration Gerada

**Nome:** `20260202000000_multi_unit_structure_and_hierarchical_roles`

**Operações SQL:**

1. **Criar enum `UnitType`**
   ```sql
   CREATE TYPE "UnitType" AS ENUM ('MATRIZ', 'UNIDADE');
   ```

2. **Atualizar enum `UserRole`**
   - Remove roles antigos
   - Adiciona nova hierarquia completa
   - Atualiza tabelas `User` e `Employee`

3. **Criar tabela `Unit`**
   - Campos: id, name, code, address, phone, email, type, associationId
   - Índice único em `code`
   - Foreign key para `Association`

4. **Adicionar campos `unitId`**
   - Em `User`
   - Em `Student`
   - Foreign keys para `Unit`

---

## 📊 Estrutura de Dados

### Diagrama de Relacionamentos

```
Association (Matriz Organizacional)
    ↓
    ├── Unit (MATRIZ)
    │   ├── User (MATRIZ_ADMIN)
    │   ├── User (COORDENADOR_GERAL)
    │   ├── User (NUTRICIONISTA)
    │   └── User (PSICOLOGO)
    │
    ├── Unit (UNIDADE 1)
    │   ├── User (DIRETOR_UNIDADE)
    │   ├── User (COORDENADOR_PEDAGOGICO)
    │   ├── User (SECRETARIO)
    │   ├── User (PROFESSOR)
    │   ├── Student (Miguel)
    │   └── Student (Sofia)
    │
    └── Unit (UNIDADE 2)
        ├── User (DIRETOR_UNIDADE)
        ├── User (PROFESSOR)
        ├── Student (Lucas)
        └── Student (Isabella)
```

---

## 🔐 Controle de Acesso Hierárquico

### Níveis de Permissão (Sugeridos)

**MATRIZ_ADMIN:**
- Acesso total ao sistema
- Gerenciamento de todas as unidades
- Configurações globais

**COORDENADOR_GERAL:**
- Visão consolidada de todas as unidades
- Relatórios gerenciais
- Coordenação pedagógica geral

**DIRETOR_UNIDADE:**
- Gestão completa da sua unidade
- Acesso a dados de alunos e professores da unidade
- Relatórios da unidade

**COORDENADOR_PEDAGOGICO:**
- Gestão pedagógica da unidade
- Planejamentos e atividades
- Acompanhamento de turmas

**PROFESSOR:**
- Acesso à sua turma
- Diário de bordo
- Frequência e atividades

**NUTRICIONISTA / PSICOLOGO:**
- Acesso transversal (todas as unidades)
- Dados específicos da área
- Relatórios especializados

**SECRETARIO:**
- Gestão administrativa da unidade
- Documentos e matrículas
- Atendimento

---

## ✅ Validações Realizadas

1. **Schema Prisma:** ✅ Validado com `prisma validate`
2. **Migration SQL:** ✅ Criada manualmente
3. **Seed TypeScript:** ✅ Corrigido e validado
4. **Commit:** ✅ Realizado com sucesso
5. **Push:** ✅ Enviado para repositório

---

## 🚀 Próximos Passos

### Para Deploy no Coolify:

1. **Verificar o deploy automático** no Coolify após o push
2. **Aplicar a migration** no banco de produção:
   ```bash
   pnpm prisma migrate deploy
   ```
3. **Executar o seed** (se necessário):
   ```bash
   pnpm prisma db seed
   ```

### Implementações Futuras:

1. **Middleware de Autorização:**
   - Implementar guards baseados em roles
   - Filtros de dados por unidade
   - Validação de permissões

2. **API Endpoints:**
   - CRUD de unidades
   - Listagem hierárquica
   - Transferência de usuários/alunos entre unidades

3. **Interface:**
   - Seletor de unidade no dashboard
   - Filtros por unidade
   - Visualização hierárquica

---

## 📝 Arquivos Modificados

```
prisma/
├── schema.prisma                    (modificado)
├── seed.ts                          (modificado)
└── migrations/
    └── 20260202000000_multi_unit_structure_and_hierarchical_roles/
        └── migration.sql            (criado)
```

---

## 🎉 Resumo Final

✅ **Tabela `Unit` criada** com tipos MATRIZ e UNIDADE  
✅ **8 Roles hierárquicos** implementados  
✅ **Vinculação User-Unit** e **Student-Unit** estabelecida  
✅ **Seed atualizado** com 1 Matriz + 2 Unidades  
✅ **10 usuários** criados com hierarquia completa  
✅ **4 alunos** vinculados às unidades  
✅ **Migration gerada** e validada  
✅ **Commit e Push** realizados com sucesso  

**Commit Hash:** `d58aa1b`  
**Branch:** `main`  
**Status:** Pronto para deploy no Coolify

---

**"Nenhuma criança fica para trás"** ❤️
