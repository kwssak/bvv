package api

import (
	"fmt"
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	"awewe-panel/internal/database"
)

// HandleSubscription обрабатывает запросы на уникальные ссылки подписки
func HandleSubscription(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ожидаем путь вида: /sub/awewe/emsjjxgshkp-gpsh119
		subPath := c.Param("path") // "awewe/emsjjxgshkp-gpsh119"
		
		var client database.Client
		// Ищем клиента по уникальному пути
		if err := db.Where("sub_path = ?", subPath).First(&client).Error; err != nil {
			c.String(http.StatusNotFound, "Subscription not found")
			return
		}

		if !client.IsActive {
			c.String(http.StatusForbidden, "Subscription is inactive or expired")
			return
		}

		// Получаем настройки сервера (IP или Домен, HTTP или HTTPS)
		// Это читается из конфига, здесь упрощенно
		protocol := "http" // По умолчанию для IP
		host := "144.31.164.231"
		port := "2053"
		
		// Если в конфиге указан домен и протокол https, подменяем
		// if config.Protocol == "https" { protocol = "https"; host = config.Host }

		// Генерируем конфиг. ВАЖНО: мы НЕ включаем поле Email клиента в итоговый JSON/Base64
		configData := generateClientConfig(client, protocol, host, port)

		c.Header("Content-Type", "text/plain; charset=utf-8")
		c.Header("subscription-userinfo", fmt.Sprintf("upload=%d; download=%d; total=%d; expire=%d", 
			client.TrafficUsed, 0, client.TrafficLimit, client.ExpiryDate.Unix()))
		
		c.String(http.StatusOK, configData)
	}
}

func generateClientConfig(client database.Client, protocol, host, port string) string {
	// Здесь логика генерации VLESS/Trojan конфига
	// Email намеренно не добавляется в объект outbound/inbound
	return fmt.Sprintf("%s://%s@%s:%s?path=/sub/%s#%s", 
		client.Protocol, "uuid-clienta", host, port, client.SubPath, client.Name)
}
