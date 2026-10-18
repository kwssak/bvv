#!/bin/bash

YELLOW='\033[1;33m'
GREEN='\033[1;32m'
NC='\033[0m'

echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}              AWEWE PANEL INSTALLER             ${NC}"
echo -e "${YELLOW}================================================${NC}"

# 1. Выбор режима установки
echo -e "${YELLOW}1) Download panel with auto node setup${NC}"
echo -e "${YELLOW}2) Download panel (manual setup)${NC}"
echo -e "${YELLOW}3) Back${NC}"
read -p "Enter your choice: " INSTALL_MODE

if [ -z "$INSTALL_MODE" ]; then
    echo -e "${YELLOW}Skip? (1)${NC}"
    read -p "" SKIP
    if [ -z "$SKIP" ]; then
        echo -e "${YELLOW}Confirm Y/N${NC}"
        read -p "Enter your answer: " CONF
        if [[ "$CONF" != "Y" && "$CONF" != "y" ]]; then 
            echo "Installation aborted."
            exit 1
        fi
        INSTALL_MODE=1
    else
        INSTALL_MODE=1
    fi
else
    echo -e "${YELLOW}Confirm Y/N${NC}"
    read -p "Enter your answer: " CONF
    if [[ "$CONF" != "Y" && "$CONF" != "y" ]]; then
        echo "Installation aborted."
        exit 1
    fi
fi

# 2. Выбор домена или IP
echo -e "${YELLOW}Where to create site?${NC}"
echo -e "${YELLOW}1) domain (HTTPS)${NC}"
echo -e "${YELLOW}2) ip (HTTP)${NC}"
read -p "Enter your choice: " HOST_TYPE

if [ -z "$HOST_TYPE" ]; then
    HOST_TYPE=2
    echo -e "${YELLOW}Confirm Y/N (Default: IP)${NC}"
    read -p "Enter your answer: " CONF
    if [[ "$CONF" != "Y" && "$CONF" != "y" ]]; then 
        echo "Installation aborted."
        exit 1
    fi
else
    echo -e "${YELLOW}Confirm Y/N${NC}"
    read -p "Enter your answer: " CONF
    if [[ "$CONF" != "Y" && "$CONF" != "y" ]]; then 
        echo "Installation aborted."
        exit 1
    fi
fi

# 3. Порт
read -p "Enter port (1024 - 60000): " PANEL_PORT
if [[ ! "$PANEL_PORT" =~ ^[0-9]+$ ]] || [ "$PANEL_PORT" -lt 1024 ] || [ "$PANEL_PORT" -gt 60000 ]; then
    PANEL_PORT=2053
    echo -e "${YELLOW}Invalid port. Using default: 2053${NC}"
fi

# 4. Логика Домен/IP
SUB_PATH="awewe"
if [ "$HOST_TYPE" == "1" ]; then
    read -p "Enter your domain (e.g., sub.yourdomain.ru): " HOST_ADDRESS
    PROTOCOL="https"
    echo -e "${YELLOW}Configuring Let's Encrypt SSL for ${HOST_ADDRESS}...${NC}"
else
    HOST_ADDRESS=$(curl -s https://api.ipify.org)
    PROTOCOL="http"
    echo -e "${YELLOW}Using raw IP: ${HOST_ADDRESS} (HTTP mode)${NC}"
fi

# 5. Генерация данных
WEB_PATH=$(tr -dc 'a-zA-Z0-9' < /dev/urandom | fold -w 16 | head -n 1)
API_TOKEN=$(tr -dc 'a-zA-Z0-9' < /dev/urandom | fold -w 32 | head -n 1)
ADMIN_PASS=$(tr -dc 'a-zA-Z0-9' < /dev/urandom | fold -w 12 | head -n 1)

# Создаём директорию
mkdir -p /etc/awewe

# Сохранение конфига для backend
cat <<EOF > /etc/awewe/config.json
{
  "port": "${PANEL_PORT}",
  "host": "${HOST_ADDRESS}",
  "protocol": "${PROTOCOL}",
  "web_path": "/${WEB_PATH}",
  "api_token": "${API_TOKEN}",
  "auto_setup": $([ "$INSTALL_MODE" == "1" ] && echo "true" || echo "false"),
  "sub_base_path": "/sub/${SUB_PATH}"
}
EOF

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}____________Awewe panel__________${NC}"
echo -e "${GREEN}Link: ${PROTOCOL}://${HOST_ADDRESS}:${PANEL_PORT}/${WEB_PATH}${NC}"
echo -e "${GREEN}User name: admin${NC}"
echo -e "${GREEN}Password: ${ADMIN_PASS}${NC}"
echo -e "${GREEN}Web patch: /${WEB_PATH}${NC}"
echo -e "${GREEN}Api token: ${API_TOKEN}${NC}"
echo -e "${GREEN}________________________________${NC}"

echo -e "${YELLOW}Downloading binaries and setting up systemd services...${NC}"

# Здесь должна быть логика скачивания бинарников и установки
# Пока выводим заглушку
echo -e "${YELLOW}Installing Awewe Panel...${NC}"

# Создаём systemd сервис
cat <<EOF > /etc/systemd/system/awewe-panel.service
[Unit]
Description=Awewe Panel - VPN Management System
After=network.target

[Service]
Type=simple
ExecStart=/opt/awewe/backend/bin/awewe-panel
WorkingDirectory=/opt/awewe/backend
Restart=always
RestartSec=5
User=root
Environment="GIN_MODE=release"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable awewe-panel

echo -e "${GREEN}Installation complete!${NC}"
echo -e "${YELLOW}To start the panel run: systemctl start awewe-panel${NC}"
