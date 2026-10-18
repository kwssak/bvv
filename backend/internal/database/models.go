package database

import (
	"time"
	"github.com/google/uuid"
)

// Client представляет пользователя. Email скрыт из публичных API ответов.
type Client struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Email        string    `gorm:"-" json:"-"` // "-" скрывает это поле из JSON ответов API (конфигуратора)
	SubPath      string    `gorm:"uniqueIndex;not null" json:"sub_path"` // Уникальный путь, например: awewe/emsjjxgshkp-gpsh119
	Protocol     string    `json:"protocol"`
	TrafficLimit int64     `json:"traffic_limit"` // в байтах
	TrafficUsed  int64     `json:"traffic_used"`
	ExpiryDate   time.Time `json:"expiry_date"`
	IPLimit      int       `json:"ip_limit"`
	HWID         string    `json:"hwid"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}

// BotSettings хранит настройки телеграм бота, включая JSON-инструкции
type BotSettings struct {
	ID              uint   `gorm:"primaryKey"`
	Token           string `json:"token"`
	AdminChatID     string `json:"admin_chat_id"`
	PlategaAPIKey   string `json:"platega_api_key"`
	CryptoBotAPI    string `json:"crypto_bot_api"`
	ExpireNotifyDays int   `json:"expire_notify_days"`
	// CustomInstructions хранит JSON с логикой ответов бота
	CustomInstructions string `gorm:"type:text" json:"custom_instructions"` 
}

// Node представляет ноду (inbound)
type Node struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	Name           string `json:"name"`
	Port           int    `json:"port"`
	Protocol       string `json:"protocol"`
	Transport      string `json:"transport"`
	Security       string `json:"security"`
	SNI            string `json:"sni"`
	TrafficRules   string `gorm:"type:text" json:"traffic_rules"` // JSON массив разрешенных доменов
	IsCDN          bool   `gorm:"default:false" json:"is_cdn"`
}
