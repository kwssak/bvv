#!/bin/bash

# ============================================================
# AWEWE PANEL - Nodes Backup
# Бэкап нод, клиентов, ключей каждые 6 часов
# ============================================================

set -e

BACKUP_DIR="/etc/awewe/backup/nodes"
DB_PATH="/etc/awewe/data/awewe.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/nodes-$DATE.json"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Создание бэкапа нод..."

# Экспортируем ноды из SQLite в JSON
sqlite3 -json "$DB_PATH" "SELECT * FROM nodes;" > "$BACKUP_FILE"

# Экспортируем ключи (если есть отдельная таблица)
if sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' AND name='keys';" | grep -q "keys"; then
    sqlite3 -json "$DB_PATH" "SELECT * FROM keys;" > "$BACKUP_DIR/keys-$DATE.json"
fi

# Удаляем старые бэкапы (оставляем последние 48 = 12 дней при бэкапе каждые 6 часов)
ls -t "$BACKUP_DIR"/nodes-*.json 2>/dev/null | tail -n +49 | xargs rm -f
ls -t "$BACKUP_DIR"/keys-*.json 2>/dev/null | tail -n +49 | xargs rm -f

echo "[OK] Бэкап нод создан: $BACKUP_FILE"
