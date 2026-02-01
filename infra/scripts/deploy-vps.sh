#!/bin/bash
# ========================================
# CONEXA - Script de Deploy DEFINITIVO
# ========================================

set -e

echo "=========================================="
echo "🚀 CONEXA - Deploy Definitivo"
echo "=========================================="

cd /root/conexa

# ==========================================
# 1. LIMPAR TUDO
# ==========================================
echo ""
echo "[1/6] 🧹 Limpando containers e imagens antigas..."
docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
docker rmi conexa-backend:latest conexa-frontend:latest 2>/dev/null || true
docker builder prune -af

# ==========================================
# 2. PULL ATUALIZAÇÕES
# ==========================================
echo ""
echo "[2/6] 📥 Baixando atualizações do GitHub..."
git pull origin master

# ==========================================
# 3. BUILD BACKEND (ISOLADO)
# ==========================================
echo ""
echo "[3/6] 🔨 Buildando Backend..."
docker compose -f docker-compose.prod.yml build backend 2>&1 | tee /tmp/backend-build.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "❌ ERRO NO BUILD DO BACKEND!"
    echo "Veja o log completo em: /tmp/backend-build.log"
    tail -100 /tmp/backend-build.log
    exit 1
fi

echo "✅ Backend buildado com sucesso!"

# ==========================================
# 4. BUILD FRONTEND (ISOLADO)
# ==========================================
echo ""
echo "[4/6] 🎨 Buildando Frontend..."
docker compose -f docker-compose.prod.yml build frontend 2>&1 | tee /tmp/frontend-build.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "❌ ERRO NO BUILD DO FRONTEND!"
    echo "Veja o log completo em: /tmp/frontend-build.log"
    tail -100 /tmp/frontend-build.log
    exit 1
fi

echo "✅ Frontend buildado com sucesso!"

# ==========================================
# 5. SUBIR CONTAINERS
# ==========================================
echo ""
echo "[5/6] 🚀 Subindo containers..."
docker compose -f docker-compose.prod.yml up -d

# ==========================================
# 6. VERIFICAR STATUS
# ==========================================
echo ""
echo "[6/6] 🔍 Verificando status..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo ""
echo "📊 Logs disponíveis:"
echo "  - Backend build: /tmp/backend-build.log"
echo "  - Frontend build: /tmp/frontend-build.log"
echo ""
echo "🔍 Verificar logs dos containers:"
echo "  docker compose -f docker-compose.prod.yml logs -f backend"
echo "  docker compose -f docker-compose.prod.yml logs -f frontend"
echo ""
echo "🌐 Acesse: http://165.227.108.46"
echo ""
