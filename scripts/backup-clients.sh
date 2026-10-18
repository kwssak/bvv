#!/bin/bash

# ============================================================
# AWEWE PANEL - Clients Backup
# Бэкап клиентов с трафиком, пометка неактивных, удаление через 3 недели
# ============================================================

set -e

BACKUP_DIR="/etc/awewe/backup/clients"
DB_PATH="/etc/awewe/data/awewe.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/clients-$DATE.json"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Создание бэкапа клиентов..."

# Получаем всех клиентов с трафиком
sqlite3 -json "$DB_PATH" "
SELECT 
    id,
    name,
    email,
    sub_path,
    protocol,
    traffic_limit,
    traffic_used,
    expiry_date,
    ip_limit,
    hwid,
    is_active,
    created_at,
    CASE 
        WHEN is_active = 0 AND julianday('now') - julianday(created_at) > 21 THEN 'delete'
        WHEN is_active = 0 THEN 'inactive'
        ELSE 'active'
    END as status
FROM clients;
" > "$BACKUP_FILE"

# Удаляем клиентов, которые неактивны больше 3 недель
sqlite3 "$DB_PATH" "
DELETE FROM clients 
WHERE is_active = 0 
AND julianday('now') - julianday(created_at) > 21;
"

DELETED_COUNT=$(sqlite3 "$DB_PATH" "SELECT changes();")
if [ "$DELETED_COUNT" -gt 0 ]; then
    echo "[INFO] Удалено $DELETED_COUNT клиентов (неактивны > 3 недель)"
fi

# Удаляем старые бэкапы (оставляем последние 48)
ls -t "$BACKUP_DIR"/clients-*.json 2>/dev/null | tail -n +49 | xargs rm -f

echo "[OK] Бэкап клиентов создан: $BACKUP_FILE"
