package database

import (
	"time"
)

// Client представляет пользователя. 
// Email скрыт из публичных API ответов благодаря тегу json:"-"
type Client struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Email        string    `gorm:"-" json:"-"` // Скрыто из JSON-ответов конфигуратора
	SubPath      string    `gorm:"uniqueIndex;not null" json:"sub_path"` // Уникальный путь: awewe/рандомная-строка
	Protocol     string    `json:"protocol"`
	TrafficLimit int64     `json:"traffic_limit"` // в байтах
	TrafficUsed  int64     `json:"traffic_used"`
	ExpiryDate   time.Time `json:"expiry_date"`
	IPLimit      int       `json:"ip_limit"`
	HWID         string    `json:"hwid"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}

// Node представляет ноду (inbound) для ядра Xray
type Node struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	Name           string `json:"name"`
	Port           int    `json:"port"`
	Protocol       string `json:"protocol"`
	Transport      string `json:"transport"`
	Security       string `json:"security"`
	SNI            string `json:"sni"`
	TrafficRules   string `gorm:"type:text" json:"traffic_rules"` // JSON-массив разрешенных доменов для контроля трафика
	IsCDN          bool   `gorm:"default:false" json:"is_cdn"`
}

// BotSettings хранит настройки телеграм бота, включая JSON-инструкции
type BotSettings struct {
	ID                 uint   `gorm:"primaryKey"`
	Token              string `json:"token"`
	AdminChatID        string `json:"admin_chat_id"`
	PlategaAPIKey      string `json:"platega_api_key"`
	CryptoBotAPI       string `json:"crypto_bot_api"`
	ExpireNotifyDays   int    `json:"expire_notify_days"`
	CustomInstructions string `gorm:"type:text" json:"custom_instructions"` // JSON с логикой ответов и кнопками
}

// LegalSettings хранит тексты для страниц ПК (Пользовательское соглашение) и ПС (Политика конфиденциальности)
type LegalSettings struct {
	ID      uint   `gorm:"primaryKey"`
	PCTitle string `json:"pc_title"`                    // Заголовок ПК
	PCText  string `gorm:"type:text" json:"pc_text"`    // Текст ПК (поддерживает переносы строк)
	PSTitle string `json:"ps_title"`                    // Заголовок ПС
	PSText  string `gorm:"type:text" json:"ps_text"`    // Текст ПС
}
