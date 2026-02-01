#!/bin/sh
# ========================================
# COCRIS SUPER SYSTEM - RESTORE SCRIPT
# ========================================
# Script para restaurar backup do PostgreSQL

set -e

# Variáveis de ambiente
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
DB_USER=${POSTGRES_USER:-cocris_admin}
DB_PASSWORD=${POSTGRES_PASSWORD}
DB_NAME=${POSTGRES_DB:-cocris_db}
BACKUP_DIR=${BACKUP_DIR:-/backups}

# Verificar se foi passado um arquivo de backup
if [ -z "$1" ]; then
    echo "========================================="
    echo "CoCris Super System - Restaurar Backup"
    echo "========================================="
    echo "Uso: ./restore.sh <arquivo_backup.sql.gz>"
    echo ""
    echo "Backups disponíveis:"
    ls -lh "$BACKUP_DIR"/cocris_backup_*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado"
    echo "========================================="
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erro: Arquivo '$BACKUP_FILE' não encontrado!"
    exit 1
fi

echo "========================================="
echo "CoCris Super System - Restaurar Backup"
echo "========================================="
echo "Data: $(date)"
echo "Banco: $DB_NAME"
echo "Arquivo: $BACKUP_FILE"
echo "========================================="

# Confirmar restauração
echo "⚠️  ATENÇÃO: Esta operação irá SUBSTITUIR todos os dados atuais!"
echo "Pressione CTRL+C para cancelar ou ENTER para continuar..."
read -r

# Restaurar backup
echo "Restaurando backup..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME"

# Verificar sucesso
if [ $? -eq 0 ]; then
    echo "✅ Backup restaurado com sucesso!"
else
    echo "❌ Erro ao restaurar backup!"
    exit 1
fi

echo "========================================="
echo "Restauração concluída em: $(date)"
echo "========================================="

exit 0
