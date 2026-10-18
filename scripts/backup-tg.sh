#!/bin/bash

# ============================================================
# AWEWE PANEL - Telegram Bot Backup
# Бэкап настроек бота и JSON-инструкций
# ============================================================

set -e

BACKUP_DIR="/etc/awewe/backup/tg"
DB_PATH="/etc/awewe/data/awewe.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tg-settings-$DATE.json"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Создание бэкапа Telegram бота..."

# Экспортируем настройки бота
sqlite3 -json "$DB_PATH" "SELECT * FROM bot_settings;" > "$BACKUP_FILE"

# Удаляем старые бэкапы (оставляем последние 24 = 6 дней при бэкапе каждые 6 часов)
ls -t "$BACKUP_DIR"/tg-settings-*.json 2>/dev/null | tail -n +25 | xargs rm -f

echo "[OK] Бэкап Telegram бота создан: $BACKUP_FILE"
