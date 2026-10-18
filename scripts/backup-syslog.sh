#!/bin/bash

# ============================================================
# AWEWE PANEL - System & Logs Backup
# Бэкап системных конфигов и логов
# ============================================================

set -e

BACKUP_DIR="/etc/awewe/backup/syslog"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/syslog-$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Создание бэкапа системы и логов..."

# Архивируем конфиги и логи
tar -czf "$BACKUP_FILE" \
    /etc/awewe/config.json \
    /var/log/awewe/ \
    2>/dev/null || true

# Удаляем старые бэкапы (оставляем последние 24)
ls -t "$BACKUP_DIR"/syslog-*.tar.gz 2>/dev/null | tail -n +25 | xargs rm -f

echo "[OK] Бэкап системы создан: $BACKUP_FILE"
