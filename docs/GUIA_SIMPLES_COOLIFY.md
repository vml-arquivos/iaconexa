# 🎯 GUIA SUPER SIMPLES: Como Pegar as Informações do Coolify

**Objetivo:** Descobrir por que o container está reiniciando

**Tempo:** 5 minutos

---

## 📋 PASSO 1: Ver os Logs do Container

**O que são logs?** São as mensagens que o sistema imprime enquanto está rodando. É como um "diário" do que aconteceu.

### Como fazer:

1. **Abra o Coolify** no navegador
2. **Clique no seu projeto** "Conexa" (ou nome que você deu)
3. **Procure a aba "Logs"** (geralmente fica no topo ou na lateral)
4. **Clique em "Logs"**
5. **Role até o final** da página (últimas mensagens)
6. **Copie as últimas 30-50 linhas**

### O que procurar:

Procure por mensagens com esses símbolos:
- ❌ (X vermelho)
- `ERROR`
- `ERRO`
- `Failed`
- `Cannot`

### Exemplo do que você vai ver:

```
✅ Prisma conectado ao banco de dados
🚀 CONEXA Server v1.1 rodando na porta 3001
```

**OU** (se tiver erro):

```
❌ ERRO: PostgreSQL não respondeu em 60 segundos
❌ ERRO ao conectar Prisma: P1001
```

### **👉 COPIE E COLE AQUI AS ÚLTIMAS 30 LINHAS DOS LOGS**

---

## 📋 PASSO 2: Ver as Variáveis de Ambiente

**O que são variáveis de ambiente?** São "configurações secretas" que o sistema precisa para funcionar (como senha do banco de dados).

### Como fazer:

1. **No Coolify**, ainda no seu projeto "Conexa"
2. **Procure a aba "Environment" ou "Environment Variables"**
3. **Clique nela**
4. **Você vai ver uma lista de variáveis**

### O que procurar:

Procure por estas variáveis **IMPORTANTES**:

| Nome da Variável | O que é | Tem que ter? |
|------------------|---------|--------------|
| `DATABASE_URL` | Endereço do banco de dados | ✅ **SIM** (CRÍTICO) |
| `PORT` | Porta do servidor | ⚠️ Recomendado (padrão: 3001) |
| `NODE_ENV` | Ambiente (production/development) | ⚠️ Recomendado |
| `JWT_SECRET` | Chave secreta para login | ⚠️ Recomendado |

### **👉 ME RESPONDA:**

- [ ] A variável `DATABASE_URL` existe? (Sim/Não)
- [ ] Se SIM, ela começa com `postgresql://`? (Sim/Não)
- [ ] A variável `PORT` existe? (Sim/Não)
- [ ] A variável `NODE_ENV` existe? (Sim/Não)

**IMPORTANTE:** NÃO precisa me enviar a senha! Só me diga se as variáveis existem ou não.

---

## 📋 PASSO 3: Ver se o Banco de Dados Está Rodando

**O que é o banco de dados?** É onde ficam guardados todos os dados (usuários, alunos, etc.). Se ele não estiver funcionando, o sistema não sobe.

### Como fazer:

1. **No Coolify**, volte para a **página inicial** (Dashboard)
2. **Procure o recurso "Database" ou "PostgreSQL"** (pode ter um nome diferente)
3. **Olhe o status** ao lado do nome

### O que procurar:

O status pode ser:
- ✅ **"Running"** ou **"Healthy"** → Tudo OK!
- ❌ **"Stopped"** ou **"Exited"** → Problema! O banco não está rodando
- ⚠️ **"Restarting"** → O banco também está com problema

### **👉 ME RESPONDA:**

- [ ] O banco de dados está "Running"? (Sim/Não)
- [ ] Se NÃO, qual é o status que aparece?

---

## 📋 PASSO 4: Executar o Script de Teste (OPCIONAL)

**O que é o script de teste?** É um programa que eu criei que testa se o servidor consegue conectar no banco de dados.

### Como fazer (SE você tiver acesso ao terminal do Coolify):

1. **No Coolify**, no seu projeto "Conexa"
2. **Procure a aba "Terminal" ou "Console"** (nem todos os Coolify têm isso)
3. **Se tiver**, clique nela
4. **Cole este comando** e aperte Enter:

```bash
node /app/server/test-connection.js
```

5. **Copie todo o resultado** que aparecer

### **👉 SE CONSEGUIR EXECUTAR, COPIE E COLE O RESULTADO AQUI**

---

## 🎯 RESUMO: O QUE EU PRECISO

Para eu te dar a solução exata, me envie:

### **OBRIGATÓRIO:**
1. ✅ **Últimas 30-50 linhas dos Logs** (Passo 1)
2. ✅ **Se a variável DATABASE_URL existe** (Passo 2)
3. ✅ **Se o banco de dados está "Running"** (Passo 3)

### **OPCIONAL (se conseguir):**
4. ⚠️ **Resultado do script de teste** (Passo 4)

---

## 💡 DICA RÁPIDA: Problema Mais Comum

**90% das vezes o problema é um destes:**

### **Problema #1: DATABASE_URL não existe**

**Como resolver:**
1. No Coolify, vá em "Environment Variables"
2. Clique em "Add Variable" ou "+"
3. Nome: `DATABASE_URL`
4. Valor: `postgresql://usuario:senha@host:5432/nome_do_banco`
   - ⚠️ **ATENÇÃO:** Você precisa pegar essa URL do seu banco de dados PostgreSQL
5. Salve e reinicie o container

---

### **Problema #2: Banco de dados não está rodando**

**Como resolver:**
1. No Coolify, vá no recurso "Database"
2. Clique em "Start" ou "Restart"
3. Aguarde 1-2 minutos
4. Volte no projeto "Conexa" e veja se parou de reiniciar

---

### **Problema #3: URL do banco está errada**

**Como saber:**
- Nos logs vai aparecer: `❌ ERRO: PostgreSQL não respondeu`

**Como resolver:**
1. Verifique se a URL está no formato correto:
   ```
   postgresql://usuario:senha@host:5432/nome_do_banco
   ```
2. Teste se o host está correto (geralmente é o nome do container do banco)
3. Teste se a porta está correta (padrão: 5432)

---

## 🚀 DEPOIS QUE VOCÊ ME ENVIAR AS INFORMAÇÕES

Eu vou:
1. ✅ Analisar os logs
2. ✅ Identificar o erro exato
3. ✅ Te dar a solução passo a passo
4. ✅ Te ajudar a aplicar a correção

---

**👉 AGORA É SUA VEZ! Siga os passos acima e me envie as informações.** 😊
