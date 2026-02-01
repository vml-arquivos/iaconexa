#!/bin/bash
# ========================================
# CONEXA - Fix & Deploy DEFINITIVO
# ========================================

set -e

echo "=========================================="
echo "🔧 CONEXA - Correção e Deploy Final"
echo "=========================================="

cd /root/conexa

# ==========================================
# 1. RESETAR ARQUIVOS CORROMPIDOS
# ==========================================
echo ""
echo "[1/7] 🔄 Resetando arquivos corrompidos..."
git checkout HEAD -- server/routes/documents.ts
git checkout HEAD -- server/routes/material-orders.ts
echo "✅ Arquivos resetados do Git"

# ==========================================
# 2. PULL ATUALIZAÇÕES
# ==========================================
echo ""
echo "[2/7] 📥 Baixando atualizações do GitHub..."
git pull origin master

# ==========================================
# 3. LIMPAR TUDO
# ==========================================
echo ""
echo "[3/7] 🧹 Limpando containers e cache..."
docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
docker rmi conexa-backend:latest conexa-frontend:latest 2>/dev/null || true
docker builder prune -af

# ==========================================
# 4. VERIFICAR ARQUIVOS
# ==========================================
echo ""
echo "[4/7] 🔍 Verificando integridade dos arquivos..."
if grep -q "bash /tmp/apply-all-fixes" server/routes/documents.ts 2>/dev/null; then
    echo "❌ ERRO: documents.ts ainda está corrompido!"
    echo "Baixando versão limpa do GitHub..."
    curl -s https://raw.githubusercontent.com/vml-arquivos/conexa/master/server/routes/documents.ts -o server/routes/documents.ts
fi

if grep -q "bash /tmp/apply-all-fixes" server/routes/material-orders.ts 2>/dev/null; then
    echo "❌ ERRO: material-orders.ts ainda está corrompido!"
    echo "Baixando versão limpa do GitHub..."
    curl -s https://raw.githubusercontent.com/vml-arquivos/conexa/master/server/routes/material-orders.ts -o server/routes/material-orders.ts
fi

echo "✅ Arquivos verificados"

# ==========================================
# 5. BUILD BACKEND
# ==========================================
echo ""
echo "[5/7] 🔨 Buildando Backend..."
docker compose -f docker-compose.prod.yml build backend 2>&1 | tee /tmp/backend-build.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "❌ ERRO NO BUILD DO BACKEND!"
    echo "Últimas 50 linhas do log:"
    tail -50 /tmp/backend-build.log
    exit 1
fi

echo "✅ Backend buildado com sucesso!"

# ==========================================
# 6. BUILD FRONTEND
# ==========================================
echo ""
echo "[6/7] 🎨 Buildando Frontend..."
docker compose -f docker-compose.prod.yml build frontend 2>&1 | tee /tmp/frontend-build.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "❌ ERRO NO BUILD DO FRONTEND!"
    echo "Últimas 50 linhas do log:"
    tail -50 /tmp/frontend-build.log
    exit 1
fi

echo "✅ Frontend buildado com sucesso!"

# ==========================================
# 7. SUBIR CONTAINERS
# ==========================================
echo ""
echo "[7/7] 🚀 Subindo containers..."
docker compose -f docker-compose.prod.yml up -d

sleep 5
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo ""
echo "🌐 Acesse: http://165.227.108.46"
echo ""
echo "📊 Logs disponíveis:"
echo "  docker compose -f docker-compose.prod.yml logs -f backend"
echo "  docker compose -f docker-compose.prod.yml logs -f frontend"
echo ""
