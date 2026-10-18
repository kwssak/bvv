#!/bin/bash

# ============================================================
# AWEWE PANEL - Xray Core Auto-Updater
# Автоматическое обновление ядра Xray с GitHub (XTLS/Xray-core)
# Без форков, только официальный репозиторий
# ============================================================

set -e

LOG_FILE="/var/log/awewe/xray-updater.log"
XRAY_DIR="/usr/local/bin/xray"
XRAY_BIN="$XRAY_DIR/xray"
BACKUP_DIR="/etc/awewe/backups/xray"
GITHUB_API="https://api.github.com/repos/XTLS/Xray-core/releases/latest"
TEMP_DIR=$(mktemp -d)

# Создаем папки, если их нет
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"
mkdir -p "$XRAY_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

log "=========================================="
log "[INFO] Начало проверки обновлений Xray"

# 1. Получаем текущую версию (если установлена)
CURRENT_VERSION=""
if [ -f "$XRAY_BIN" ]; then
    CURRENT_VERSION=$("$XRAY_BIN" version 2>/dev/null | grep -oP 'Xray \K[0-9.]+' || echo "")
    log "[INFO] Текущая версия: ${CURRENT_VERSION:-не установлена}"
fi

# 2. Получаем последнюю версию с GitHub
log "[INFO] Запрос к GitHub API..."
LATEST_RELEASE=$(curl -s -H "Accept: application/vnd.github.v3+json" "$GITHUB_API")

if [ -z "$LATEST_RELEASE" ]; then
    log "[ERROR] Не удалось получить данные с GitHub"
    exit 1
fi

LATEST_VERSION=$(echo "$LATEST_RELEASE" | grep -oP '"tag_name":\s*"v\K[0-9.]+' | head -1)
DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | grep -oP '"browser_download_url":\s*"\K[^"]+linux-64.zip' | head -1)

if [ -z "$LATEST_VERSION" ] || [ -z "$DOWNLOAD_URL" ]; then
    log "[ERROR] Не удалось распарсить ответ GitHub"
    exit 1
fi

log "[INFO] Последняя версия на GitHub: $LATEST_VERSION"

# 3. Сравниваем версии
if [ "$CURRENT_VERSION" = "$LATEST_VERSION" ]; then
    log "[INFO] Ядро актуально. Обновление не требуется."
    exit 0
fi

log "[INFO] Доступна новая версия: $LATEST_VERSION (текущая: ${CURRENT_VERSION:-none})"
log "[INFO] Начинаем загрузку..."

# 4. Скачиваем архив
cd "$TEMP_DIR"
curl -sL "$DOWNLOAD_URL" -o xray-linux-64.zip

if [ ! -f "xray-linux-64.zip" ]; then
    log "[ERROR] Не удалось скачать архив"
    exit 1
fi

log "[INFO] Архив скачан, распаковка..."
unzip -q xray-linux-64.zip

# 5. Бэкапим текущую версию (на случай отката)
if [ -f "$XRAY_BIN" ]; then
    BACKUP_NAME="xray-backup-${CURRENT_VERSION}-$(date +%s)"
    cp "$XRAY_BIN" "$BACKUP_DIR/$BACKUP_NAME"
    log "[INFO] Старая версия сохранена: $BACKUP_NAME"
    
    # Удаляем старые бэкапы (оставляем только последние 3)
    ls -t "$BACKUP_DIR"/xray-backup-* 2>/dev/null | tail -n +4 | xargs -r rm --
fi

# 6. Останавливаем Xray через systemd (если запущен)
if systemctl is-active --quiet xray 2>/dev/null; then
    log "[INFO] Остановка сервиса Xray..."
    systemctl stop xray
fi

# 7. Устанавливаем новую версию
log "[INFO] Установка новой версии..."
cp xray "$XRAY_BIN"
chmod +x "$XRAY_BIN"

# Копируем геодаты, если они есть в архиве
[ -f "geoip.dat" ] && cp geoip.dat "$XRAY_DIR/"
[ -f "geosite.dat" ] && cp geosite.dat "$XRAY_DIR/"

# 8. Запускаем Xray обратно
log "[INFO] Запуск Xray..."
systemctl start xray

# 9. Проверяем, что всё поднялось
sleep 2
if systemctl is-active --quiet xray; then
    NEW_VERSION=$("$XRAY_BIN" version 2>/dev/null | grep -oP 'Xray \K[0-9.]+' || echo "unknown")
    log "[OK] Успешно обновлено до версии $NEW_VERSION"
else
    log "[ERROR] Xray не запустился после обновления! Откат..."
    # Откат к бэкапу
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/xray-backup-* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        cp "$LATEST_BACKUP" "$XRAY_BIN"
        chmod +x "$XRAY_BIN"
        systemctl start xray
        log "[WARN] Выполнен откат к предыдущей версии"
    fi
    exit 1
fi

log "=========================================="
log "[OK] Обновление завершено успешно"
