# 📋 TAREFA 2: PAINEL DE CONTROLE DE MÓDULOS (FEATURE FLAGS)

**Data:** 02 de Fevereiro de 2026  
**Status:** ✅ **CONCLUÍDA**  
**Commit:** `14762bd`  
**Migration:** `20260202000001_add_module_feature_flags`

---

## 🎯 Objetivo

Criar interface para ativar/desativar funções do menu e dashboard através de feature flags, permitindo controle granular dos módulos do sistema por unidade.

---

## ✅ Ações Realizadas

### 1. CONFIG: Campos Booleanos na Tabela `Unit`

**Arquivo:** `prisma/schema.prisma`

#### Campos Adicionados ao Model `Unit`:

```prisma
model Unit {
  // ... campos existentes
  
  // Feature Flags - Controle de Módulos
  moduloPedagogico  Boolean @default(true)
  moduloDiario      Boolean @default(true)
  moduloCRM         Boolean @default(false)
  moduloFinanceiro  Boolean @default(false)
  moduloSuprimentos Boolean @default(true)
  
  // ... relacionamentos
}
```

#### Módulos Implementados:

| Campo | Descrição | Padrão | Funcionalidades |
|-------|-----------|--------|-----------------|
| `moduloPedagogico` | Módulo Pedagógico | `true` | Planejamentos, Tarefas, Turmas |
| `moduloDiario` | Diário de Bordo | `true` | Registro diário de atividades |
| `moduloCRM` | CRM 360º | `false` | Gestão de clientes e alunos |
| `moduloFinanceiro` | Painel Financeiro | `false` | Gestão financeira completa |
| `moduloSuprimentos` | Gestão de Suprimentos | `true` | Estoque e pedidos |

---

### 2. UI: Página de Configurações com Switches

**Arquivo:** `client/src/pages/dashboard/Configuracoes.tsx`

#### Funcionalidades Implementadas:

**Carregamento Dinâmico:**
- Busca configurações da unidade via API ao montar o componente
- Exibe loader durante carregamento
- Mostra informações da unidade atual (nome e tipo)

**Switches Interativos (Radix UI):**
- 5 switches para controlar cada módulo
- Ícones personalizados para cada módulo
- Descrições claras de cada funcionalidade
- Estado de loading durante salvamento

**Integração com API:**
- Atualização em tempo real via `PATCH /api/unit-settings/:unitId`
- Notificações de sucesso/erro usando `sonner`
- Reload automático da página após alteração (aplica mudanças no menu)

**Tratamento de Erros:**
- Captura e exibe erros de API
- Reverte estado do switch em caso de falha
- Feedback visual durante operações

#### Componentes Visuais:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Controle de Módulos</CardTitle>
    <CardDescription>
      Ative ou desative módulos do sistema
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* 5 módulos com switches */}
    <Switch 
      checked={moduloPedagogico}
      onCheckedChange={handleModuloPedagogicoChange}
      disabled={saving}
    />
  </CardContent>
</Card>
```

---

### 3. MENU: Renderização Condicional no DashboardLayout

**Arquivo:** `client/src/layouts/DashboardLayout.tsx`

#### Lógica de Renderização:

**Carregamento de Configurações:**
```tsx
const [unitSettings, setUnitSettings] = useState<UnitSettings>({
  moduloPedagogico: true,
  moduloDiario: true,
  moduloCRM: false,
  moduloFinanceiro: false,
  moduloSuprimentos: true,
});

useEffect(() => {
  loadUnitSettings();
}, []);
```

**Menu Items Condicionais:**
```tsx
const conditionalMenuItems = [
  ...(unitSettings.moduloPedagogico ? [
    { icon: BookOpen, label: "Planejamentos", href: "/dashboard/planejamentos" },
    { icon: CheckSquare, label: "Tarefas", href: "/dashboard/tarefas" },
    { icon: GraduationCap, label: "Turmas", href: "/dashboard/turmas" },
  ] : []),
  ...(unitSettings.moduloDiario ? [
    { icon: FileText, label: "Diário de Bordo", href: "/dashboard/diario-rapido" },
  ] : []),
  ...(unitSettings.moduloSuprimentos ? [
    { icon: Package, label: "Suprimentos", href: "/dashboard/materiais" },
  ] : []),
];
```

**Menu Administrativo Separado:**
```tsx
const adminMenuItems = [
  ...(unitSettings.moduloCRM ? [
    { icon: UserCircle, label: "CRM 360º", href: "/admin/clients" },
  ] : []),
  ...(unitSettings.moduloFinanceiro ? [
    { icon: DollarSign, label: "Financeiro", href: "/admin/financeiro" },
  ] : []),
];
```

**Renderização com Seção Admin:**
- Menu principal sempre visível (Visão Geral + módulos ativos)
- Seção "Administração" aparece apenas se houver módulos admin ativos
- Separador visual entre seções

---

### 4. API: Endpoints de Configurações

**Arquivo:** `server/routes/unit-settings.ts`

#### Endpoints Criados:

**GET /api/unit-settings/:unitId**
- Obter configurações de uma unidade específica
- Retorna apenas campos relevantes (id, name, code, type, módulos)
- Erro 404 se unidade não encontrada

**PATCH /api/unit-settings/:unitId**
- Atualizar configurações de módulos
- Aceita atualização parcial (apenas campos enviados)
- Validação de dados
- Retorna configurações atualizadas
- Erro 404 se unidade não encontrada

**GET /api/unit-settings**
- Listar todas as unidades com configurações
- Ordenado por tipo (MATRIZ primeiro) e nome
- Útil para seleção de unidade

#### Exemplo de Request:

```typescript
// PATCH /api/unit-settings/abc123
{
  "moduloCRM": true,
  "moduloFinanceiro": true
}

// Response
{
  "id": "abc123",
  "name": "Matriz CoCris",
  "code": "MATRIZ-001",
  "type": "MATRIZ",
  "moduloPedagogico": true,
  "moduloDiario": true,
  "moduloCRM": true,        // ✅ Atualizado
  "moduloFinanceiro": true,  // ✅ Atualizado
  "moduloSuprimentos": true
}
```

---

## 🗄️ Migration Gerada

**Nome:** `20260202000001_add_module_feature_flags`

**SQL:**
```sql
ALTER TABLE "Unit" 
  ADD COLUMN "moduloPedagogico" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "moduloDiario" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "moduloCRM" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "moduloFinanceiro" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "moduloSuprimentos" BOOLEAN NOT NULL DEFAULT true;
```

---

## 📊 Seed Atualizado

**Arquivo:** `prisma/seed.ts`

### Configurações por Unidade:

**Matriz CoCris:**
```typescript
{
  moduloPedagogico: true,
  moduloDiario: true,
  moduloCRM: true,        // ✅ Ativo na Matriz
  moduloFinanceiro: true, // ✅ Ativo na Matriz
  moduloSuprimentos: true,
}
```

**Unidades (CEPI Arara Canindé e Beija-Flor):**
```typescript
{
  moduloPedagogico: true,
  moduloDiario: true,
  moduloCRM: false,        // ❌ Desativado nas Unidades
  moduloFinanceiro: false, // ❌ Desativado nas Unidades
  moduloSuprimentos: true,
}
```

**Lógica:**
- Matriz tem acesso completo (todos os módulos)
- Unidades têm módulos pedagógicos e operacionais
- CRM e Financeiro ficam centralizados na Matriz

---

## 🎨 Experiência do Usuário

### Fluxo de Uso:

1. **Usuário acessa Configurações**
   - Vê lista de módulos disponíveis
   - Identifica quais estão ativos/inativos

2. **Ativa/Desativa Módulo**
   - Clica no switch
   - Sistema salva via API
   - Notificação de sucesso
   - Página recarrega automaticamente

3. **Menu Atualizado**
   - Links aparecem/desaparecem conforme configuração
   - Experiência limpa e focada
   - Sem opções desnecessárias

### Benefícios:

✅ **Personalização por Unidade:** Cada unidade controla seus módulos  
✅ **Interface Limpa:** Menu exibe apenas o necessário  
✅ **Flexibilidade:** Ativar/desativar módulos conforme necessidade  
✅ **Escalabilidade:** Fácil adicionar novos módulos no futuro  
✅ **Controle Centralizado:** Administradores podem gerenciar configurações  

---

## 🔧 Arquivos Criados/Modificados

### Criados:
```
client/src/hooks/use-toast.ts
server/routes/unit-settings.ts
prisma/migrations/20260202000001_add_module_feature_flags/migration.sql
```

### Modificados:
```
prisma/schema.prisma
prisma/seed.ts
server/src/index.ts
client/src/layouts/DashboardLayout.tsx
client/src/pages/dashboard/Configuracoes.tsx
```

---

## 🚀 Próximos Passos

### Para Deploy no Coolify:

1. **Aplicar migration no banco de produção:**
   ```bash
   pnpm prisma migrate deploy
   ```

2. **Executar seed (opcional):**
   ```bash
   pnpm prisma db seed
   ```

3. **Verificar API:**
   - Testar endpoint `/api/unit-settings`
   - Validar resposta e permissões

### Melhorias Futuras:

1. **Autenticação e Autorização:**
   - Integrar com contexto de usuário autenticado
   - Validar permissões por role
   - Apenas MATRIZ_ADMIN pode alterar configurações

2. **Persistência de Estado:**
   - Cache de configurações no localStorage
   - Reduzir chamadas à API
   - Sincronização em tempo real

3. **Novos Módulos:**
   - Módulo de Relatórios
   - Módulo de Comunicação (WhatsApp/Email)
   - Módulo de Transporte
   - Módulo de Saúde

4. **Interface Avançada:**
   - Histórico de alterações
   - Agendamento de ativação/desativação
   - Configurações por role

---

## 📝 Resumo Técnico

| Item | Status | Detalhes |
|------|--------|----------|
| Campos na Tabela Unit | ✅ | 5 campos booleanos |
| Migration Gerada | ✅ | 20260202000001_add_module_feature_flags |
| Seed Atualizado | ✅ | Valores padrão por tipo de unidade |
| API Endpoints | ✅ | GET, PATCH /api/unit-settings |
| Interface de Configuração | ✅ | Switches com Radix UI |
| Renderização Condicional | ✅ | Menu dinâmico baseado em flags |
| Hook de Toast | ✅ | Notificações com sonner |
| Commit e Push | ✅ | 14762bd enviado para main |

---

## 🎉 Resultado Final

✅ **Sistema modular implementado** com controle granular  
✅ **Interface de configuração** completa e funcional  
✅ **Menu dinâmico** que se adapta às configurações  
✅ **API robusta** para gerenciar feature flags  
✅ **Experiência do usuário** otimizada e personalizada  

**Commit Hash:** `14762bd`  
**Branch:** `main`  
**Status:** Pronto para deploy no Coolify

---

**"Flexibilidade e controle para cada unidade"** 🎛️
