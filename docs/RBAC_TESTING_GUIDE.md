# Guia de Testes de RBAC - Sistema Conexa v1.0

## 📋 Objetivo

Este documento fornece um roteiro completo para testar todos os níveis de acesso (RBAC) do Sistema Conexa após o deploy.

---

## 🔐 Credenciais de Teste

**Senha padrão para todos os usuários:** `admin123`

### Usuários Criados pelo Seed

| Email | Role | Unidade | Contexto de Teste |
|-------|------|---------|-------------------|
| `admin@cocris.org` | `MATRIZ_ADMIN` | Matriz | Super Admin - Deve ver TUDO |
| `coordenador.geral@cocris.org` | `COORDENADOR_GERAL` | Matriz | Deve ver todas as unidades |
| `nutri@cocris.org` | `NUTRICIONISTA` | Matriz | Acesso a dados de saúde/nutrição |
| `psicologo@cocris.org` | `PSICOLOGO` | Matriz | Acesso a atendimentos psicológicos |
| `diretor.unidade1@cocris.org` | `DIRETOR_UNIDADE` | CEPI Arara Canindé | Gestão completa da Unidade 1 |
| `coord.ped.unidade1@cocris.org` | `COORDENADOR_PEDAGOGICO` | CEPI Arara Canindé | Apoio pedagógico na Unidade 1 |
| `secretario.unidade1@cocris.org` | `SECRETARIO` | CEPI Arara Canindé | Administração da Unidade 1 |
| `professor.unidade1@cocris.org` | `PROFESSOR` | CEPI Arara Canindé | Acesso apenas à turma Berçário 1 |
| `diretor.unidade2@cocris.org` | `DIRETOR_UNIDADE` | CEPI Beija-Flor | Gestão completa da Unidade 2 |
| `professor.unidade2@cocris.org` | `PROFESSOR` | CEPI Beija-Flor | Acesso apenas à turma Maternal 1 |

---

## ✅ Checklist de Testes por Role

### 1. MATRIZ_ADMIN (God Mode)

**Usuário:** `admin@cocris.org`

**Testes:**
- [ ] Login bem-sucedido
- [ ] Vê **TODOS os menus** no sidebar:
  - [ ] Visão Geral
  - [ ] Planejamentos
  - [ ] Tarefas
  - [ ] Turmas
  - [ ] Diário de Bordo
  - [ ] Diário Digital
  - [ ] Diário de Classe
  - [ ] Agenda
  - [ ] Pedidos de Materiais
  - [ ] CRM 360º
  - [ ] Financeiro
- [ ] Consegue acessar dados de **todas as unidades**
- [ ] Consegue **editar** dados operacionais (mesmo sendo nível estratégico)
- [ ] Consegue criar/editar/excluir usuários
- [ ] Consegue criar/editar unidades
- [ ] Consegue ver relatórios globais

**Resultado Esperado:** ✅ Acesso total sem restrições

---

### 2. COORDENADOR_GERAL

**Usuário:** `coordenador.geral@cocris.org`

**Testes:**
- [ ] Login bem-sucedido
- [ ] Vê menus pedagógicos e administrativos
- [ ] Consegue ver dados de **todas as unidades**
- [ ] Consegue ver relatórios consolidados
- [ ] Consegue editar planejamentos pedagógicos
- [ ] **NÃO** consegue acessar módulo financeiro (se não habilitado)

**Resultado Esperado:** ✅ Visão global com foco pedagógico

---

### 3. DIRETOR_UNIDADE

**Usuário:** `diretor.unidade1@cocris.org`

**Testes:**
- [ ] Login bem-sucedido
- [ ] Vê apenas dados da **CEPI Arara Canindé**
- [ ] **NÃO** vê dados da CEPI Beija-Flor
- [ ] Consegue gerenciar funcionários da sua unidade
- [ ] Consegue ver todos os alunos da sua unidade
- [ ] Consegue aprovar pedidos de materiais
- [ ] Consegue ver relatórios da sua unidade

**Resultado Esperado:** ✅ Gestão completa apenas da Unidade 1

---

### 4. COORDENADOR_PEDAGOGICO

**Usuário:** `coord.ped.unidade1@cocris.org`

**Testes:**
- [ ] Login bem-sucedido
- [ ] Vê apenas dados da **CEPI Arara Canindé**
- [ ] Consegue acessar planejamentos pedagógicos
- [ ] Consegue ver diários de classe
- [ ] Consegue acompanhar professores
- [ ] **NÃO** consegue acessar módulo financeiro
- [ ] **NÃO** consegue gerenciar funcionários (RH)

**Resultado Esperado:** ✅ Foco em apoio pedagógico local

---

### 5. SECRETARIO

**Usuário:** `secretario.unidade1@cocris.org`

**Testes:**
- [ ] Login bem-sucedido
- [ ] Vê apenas dados da **CEPI Arara Canindé**
- [ ] Consegue gerenciar matrículas
- [ ] Consegue ver dados de alunos
- [ ] Consegue emitir documentos
- [ ] **NÃO** consegue editar planejamentos pedagógicos
- [ ] **NÃO** consegue acessar módulo financeiro

**Resultado Esperado:** ✅ Administração local sem acesso pedagógico/financeiro

---

### 6. NUTRICIONISTA

**Usuário:** `nutri@cocris.org`

**Testes:**
- [ ] Login bem-sucedido
- [ ] Consegue acessar cardápios
- [ ] Consegue ver dados de saúde dos alunos
- [ ] Consegue registrar informações nutricionais
- [ ] Consegue ver estoque de alimentos
- [ ] **NÃO** consegue acessar dados pedagógicos
- [ ] **NÃO** consegue acessar módulo financeiro

**Resultado Esperado:** ✅ Foco em saúde e alimentação

---

### 7. PSICOLOGO

**Usuário:** `psicologo@cocris.org`

**Testes:**
- [ ] Login bem-sucedido
- [ ] Consegue acessar agenda de atendimentos
- [ ] Consegue ver fichas de acompanhamento
- [ ] Consegue registrar observações psicológicas
- [ ] **NÃO** consegue acessar dados pedagógicos
- [ ] **NÃO** consegue acessar módulo financeiro

**Resultado Esperado:** ✅ Foco em atendimento psicológico

---

### 8. PROFESSOR

**Usuário:** `professor.unidade1@cocris.org`

**Testes:**
- [ ] Login bem-sucedido
- [ ] Vê apenas dados da **turma Berçário 1 - Arara**
- [ ] **NÃO** vê dados de outras turmas
- [ ] Consegue preencher diário de classe
- [ ] Consegue registrar chamada
- [ ] Consegue criar planejamentos para sua turma
- [ ] Consegue fazer pedidos de materiais
- [ ] **NÃO** consegue acessar dados administrativos
- [ ] **NÃO** consegue acessar módulo financeiro

**Resultado Esperado:** ✅ Acesso restrito à própria turma

---

## 🎯 Matriz de Permissões (Resumo)

| Funcionalidade | MATRIZ_ADMIN | COORD_GERAL | DIRETOR | COORD_PED | SECRETARIO | NUTRI | PSICOLOGO | PROFESSOR |
|----------------|--------------|-------------|---------|-----------|------------|-------|-----------|-----------|
| Ver todas unidades | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Editar unidades | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gestão de usuários | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Planejamentos pedagógicos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (própria turma) |
| Diário de classe | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (própria turma) |
| Matrículas | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Cardápios | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Saúde/Nutrição | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Atendimentos | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Financeiro | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CRM 360º | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pedidos de materiais | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🚨 Casos de Teste Críticos

### Teste de Isolamento de Unidades

1. Login como `diretor.unidade1@cocris.org`
2. Tentar acessar aluno da Unidade 2 (Lucas Oliveira - MAT-2026-003)
3. **Resultado Esperado:** ❌ Acesso negado ou aluno não aparece na lista

### Teste de Isolamento de Turmas

1. Login como `professor.unidade1@cocris.org`
2. Tentar acessar turma "Maternal 1 - Beija-Flor"
3. **Resultado Esperado:** ❌ Turma não aparece na lista

### Teste de God Mode

1. Login como `admin@cocris.org`
2. Acessar qualquer módulo, qualquer unidade, qualquer turma
3. **Resultado Esperado:** ✅ Acesso total sem restrições

---

## 📊 Relatório de Testes

Após completar os testes, preencha o relatório:

```
Data do Teste: ___/___/______
Testador: _________________
Ambiente: [ ] Staging [ ] Produção

MATRIZ_ADMIN: [ ] ✅ OK [ ] ❌ Falhou
COORDENADOR_GERAL: [ ] ✅ OK [ ] ❌ Falhou
DIRETOR_UNIDADE: [ ] ✅ OK [ ] ❌ Falhou
COORDENADOR_PEDAGOGICO: [ ] ✅ OK [ ] ❌ Falhou
SECRETARIO: [ ] ✅ OK [ ] ❌ Falhou
NUTRICIONISTA: [ ] ✅ OK [ ] ❌ Falhou
PSICOLOGO: [ ] ✅ OK [ ] ❌ Falhou
PROFESSOR: [ ] ✅ OK [ ] ❌ Falhou

Observações:
_________________________________
_________________________________
```

---

## 🔧 Troubleshooting

### Problema: Usuário não consegue fazer login

**Solução:**
1. Verificar se o seed foi executado: `docker logs <container_id> | grep "seed"`
2. Executar seed manualmente: `docker exec <container_id> npx prisma db seed`

### Problema: Menus não aparecem para MATRIZ_ADMIN

**Solução:**
1. Verificar se o role está correto no banco: `SELECT email, role FROM "User" WHERE email = 'admin@cocris.org';`
2. Fazer logout e login novamente
3. Limpar localStorage do navegador

### Problema: Usuário vê dados de outras unidades

**Solução:**
1. Verificar se o `unitId` está correto no banco
2. Verificar se o middleware RBAC está ativo nas rotas
3. Verificar logs do servidor para erros de permissão

---

## 📞 Suporte

Em caso de problemas, contate o time de desenvolvimento com:
- Email do usuário testado
- Role esperada
- Ação que falhou
- Screenshot do erro (se aplicável)
