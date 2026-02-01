#!/bin/sh
# ========================================
# COCRIS SUPER SYSTEM - BACKUP SCRIPT
# ========================================
# Script para backup automático do PostgreSQL

set -e

# Variáveis de ambiente
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
DB_USER=${POSTGRES_USER:-cocris_admin}
DB_PASSWORD=${POSTGRES_PASSWORD}
DB_NAME=${POSTGRES_DB:-cocris_db}
BACKUP_DIR=${BACKUP_DIR:-/backups}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Nome do arquivo de backup com timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/cocris_backup_$TIMESTAMP.sql.gz"

echo "========================================="
echo "CoCris Super System - Backup Automático"
echo "========================================="
echo "Data: $(date)"
echo "Banco: $DB_NAME"
echo "Arquivo: $BACKUP_FILE"
echo "========================================="

# Executar backup
echo "Iniciando backup..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    | gzip > "$BACKUP_FILE"

# Verificar se o backup foi criado
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup concluído com sucesso!"
    echo "Tamanho: $BACKUP_SIZE"
else
    echo "❌ Erro: Backup falhou!"
    exit 1
fi

# Remover backups antigos (manter apenas os últimos X dias)
echo "Limpando backups antigos (> $RETENTION_DAYS dias)..."
find "$BACKUP_DIR" -name "cocris_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Listar backups disponíveis
echo "========================================="
echo "Backups disponíveis:"
ls -lh "$BACKUP_DIR"/cocris_backup_*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado"
echo "========================================="

# Log de sucesso
echo "Backup concluído em: $(date)"
echo "========================================="

exit 0
