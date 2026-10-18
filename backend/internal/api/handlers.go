package api

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"awewe-panel/internal/database"
	"awewe-panel/internal/core"
)

// GenerateUniqueSubPath генерирует путь вида "awewe/emsjjxgshkp-gpsh119"
func GenerateUniqueSubPath() string {
	bytes1 := make([]byte, 8)
	bytes2 := make([]byte, 4)
	rand.Read(bytes1)
	rand.Read(bytes2)
	return fmt.Sprintf("awewe/%s-%s", hex.EncodeToString(bytes1), hex.EncodeToString(bytes2))
}

// CreateClient создает клиента с уникальной ссылкой
func CreateClient(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Name         string `json:"name" binding:"required"`
			Email        string `json:"email"` // Сохраняется в БД, но НЕ попадает в JSON конфиг благодаря тегу `json:"-"` в модели
			TrafficLimit int64  `json:"traffic_limit"`
			ExpiryDate   string `json:"expiry_date"`
			IPLimit      int    `json:"ip_limit"`
			HWID         string `json:"hwid"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		client := database.Client{
			Name:         req.Name,
			Email:        req.Email,
			SubPath:      GenerateUniqueSubPath(), // Уникальный путь для каждого
			TrafficLimit: req.TrafficLimit,
			IPLimit:      req.IPLimit,
			HWID:         req.HWID,
			IsActive:     true,
		}
		
		// Парсинг даты (упрощенно)
		// client.ExpiryDate = ...

		if err := db.Create(&client).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create client"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":  "Client created successfully",
			"sub_path": client.SubPath,
		})
	}
}

// AutoSetupNodes обрабатывает запрос на массовое создание нод со смешанными протоколами
func AutoSetupNodes(db *database.DB, xray *core.XrayManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			BaseName string `json:"base_name"`
			Count    int    `json:"count"`
			StartPort int   `json:"start_port"`
			Mixed    bool   `json:"mixed"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		protocols := []string{"VLESS", "Trojan", "VMess", "Shadowsocks"}
		transports := []string{"XHTTP", "HTTPUpgrade", "WebSocket", "gRPC", "TCP"}
		securities := []string{"TLS", "uTLS", "Reality"}

		var createdNodes []database.Node

		for i := 0; i < req.Count; i++ {
			proto := protocols[0]
			trans := transports[0]
			sec := securities[0]

			if req.Mixed {
				proto = protocols[randInt(len(protocols))]
				trans = transports[randInt(len(transports))]
				sec = securities[randInt(len(securities))]
			}

			node := database.Node{
				Name:      fmt.Sprintf("%s %d", req.BaseName, i+1),
				Port:      req.StartPort + i,
				Protocol:  proto,
				Transport: trans,
				Security:  sec,
				SNI:       "google.com", // Дефолтный fallback SNI для Reality/uTLS
			}

			db.Create(&node)
			createdNodes = append(createdNodes, node)

			// TODO: Здесь вызов xray.AddInbound(ctx, buildXrayConfig(node)) 
			// для мгновенного применения в ядре без перезапуска
		}

		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("Successfully created %d nodes", req.Count),
			"nodes":   createdNodes,
		})
	}
}

// UpdateTrafficRules обновляет правила контроля трафика для конкретной ноды
func UpdateTrafficRules(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		nodeID := c.Param("id")
		var req struct {
			Rules []string `json:"rules"` // ["youtube.com", "telegram.org"]
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Сохраняем как JSON-строку в БД
		rulesJSON, _ := json.Marshal(req.Rules)
		
		db.Model(&database.Node{}).Where("id = ?", nodeID).Update("traffic_rules", string(rulesJSON))

		// TODO: Перезагрузить routing правила в Xray через gRPC
		
		c.JSON(http.StatusOK, gin.H{"message": "Traffic rules updated"})
	}
}

func randInt(max int) int {
	// В реальном коде использовать crypto/rand для безопасности
	return 0 // Заглушка для примера, замените на реальную генерацию
}
