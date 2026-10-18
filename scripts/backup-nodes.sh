#!/bin/bash

# ============================================================
# AWEWE PANEL - Nodes Backup
# Бэкап нод, клиентов, публичных и секретных ключей
# Запуск: каждые 6 часов
# ============================================================

set -e

BACKUP_DIR="/etc/awewe/backup/nodes"
DATA_DIR="/etc/awewe/data"
LOG_FILE="/var/log/awewe/backup-nodes.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "[INFO] Начало бэкапа нод и ключей"

# Проверяем наличие исходных данных
if [ ! -d "$DATA_DIR" ]; then
    log "[ERROR] Папка $DATA_DIR не найдена"
    exit 1
fi

# Создаем временную папку для бэкапа
TEMP_DIR=$(mktemp -d)
BACKUP_NAME="nodes-backup-$TIMESTAMP"

# Копируем ноды (JSON конфиги каждой ноды)
if [ -d "$DATA_DIR/nodes" ]; then
    cp -r "$DATA_DIR/nodes" "$TEMP_DIR/"
    NODES_COUNT=$(ls -1 "$DATA_DIR/nodes"/*.json 2>/dev/null | wc -l)
    log "[INFO] Скопировано нод: $NODES_COUNT"
else
    log "[WARN] Папка nodes не найдена"
fi

# Копируем клиентов (SQLite БД)
if [ -f "$DATA_DIR/clients.db" ]; then
    cp "$DATA_DIR/clients.db" "$TEMP_DIR/"
    log "[INFO] Скопирована база клиентов"
else
    log "[WARN] Файл clients.db не найден"
fi

# Копируем ключи (публичные и секретные)
if [ -d "$DATA_DIR/keys" ]; then
    cp -r "$DATA_DIR/keys" "$TEMP_DIR/"
    KEYS_COUNT=$(ls -1 "$DATA_DIR/keys"/* 2>/dev/null | wc -l)
    log "[INFO] Скопировано ключей: $KEYS_COUNT"
else
    log "[WARN] Папка keys не найдена"
fi

# Синхронизация: удаляем из бэкапа ноды, которых больше нет в DATA_DIR
# (Это гарантирует, что удаленные ноды исчезнут из бэкапа)
if [ -d "$BACKUP_DIR/latest/nodes" ] && [ -d "$TEMP_DIR/nodes" ]; then
    log "[INFO] Синхронизация удаленных нод..."
    # Находим файлы в бэкапе, которых нет в текущих данных
    cd "$BACKUP_DIR/latest/nodes"
    for file in *.json; do
        if [ ! -f "$TEMP_DIR/nodes/$file" ]; then
            log "[INFO] Удаленная нода: $file"
            rm -f "$file"
        fi
    done
    cd - > /dev/null
fi

# Создаем архив
cd "$TEMP_DIR"
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" .
cd - > /dev/null

# Обновляем symlink на последний бэкап
rm -f "$BACKUP_DIR/latest"
ln -s "$BACKUP_NAME.tar.gz" "$BACKUP_DIR/latest"

# Удаляем старые бэкапы (оставляем последние 28 = 7 дней * 4 раза в день)
BACKUPS_COUNT=$(ls -1 "$BACKUP_DIR"/nodes-backup-*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUPS_COUNT" -gt 28 ]; then
    ls -t "$BACKUP_DIR"/nodes-backup-*.tar.gz | tail -n +29 | xargs rm -f
    log "[INFO] Старые бэкапы удалены (оставлено 28)"
fi

# Очищаем временную папку
rm -rf "$TEMP_DIR"

SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
log "[OK] Бэкап создан: $BACKUP_NAME.tar.gz ($SIZE)"
log "=========================================="
