#!/bin/bash

# ============================================================
# AWEWE PANEL - Data Backup Script
# Бэкап папки data (клиенты, ноды, ключи, БД)
# ============================================================

set -e

BACKUP_DIR="/etc/awewe/backups"
DATA_DIR="/etc/awewe/data"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/awewe-data-$DATE.tar.gz"
MAX_BACKUPS=10

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Создание бэкапа..."

if [ ! -d "$DATA_DIR" ]; then
    echo "[WARN] Папка $DATA_DIR не найдена"
    exit 0
fi

tar -czf "$BACKUP_FILE" -C "$(dirname "$DATA_DIR")" "$(basename "$DATA_DIR")"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[OK] Бэкап создан: $BACKUP_FILE ($SIZE)"

# Удаляем старые бэкапы, оставляем последние MAX_BACKUPS
BACKUPS_COUNT=$(ls -1 "$BACKUP_DIR"/awewe-data-*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUPS_COUNT" -gt "$MAX_BACKUPS" ]; then
    ls -t "$BACKUP_DIR"/awewe-data-*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
    echo "[INFO] Старые бэкапы удалены (оставлено $MAX_BACKUPS)"
fi
