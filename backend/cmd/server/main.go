package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"awewe-panel/internal/api"
	"awewe-panel/internal/core"
	"awewe-panel/internal/database"
	"awewe-panel/internal/telegram"
)

func main() {
	log.Println("[INFO] Запуск Awewe Panel...")

	// 1. Инициализация базы данных
	os.MkdirAll("./data", 0755)
	dbPath := "./data/awewe.db"
	
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("[FATAL] Не удалось подключиться к базе данных: %v", err)
	}

	// Автоматическая миграция
	err = db.AutoMigrate(
		&database.Client{},
		&database.Node{},
		&database.BotSettings{},
		&database.LegalSettings{},
	)
	if err != nil {
		log.Fatalf("[FATAL] Ошибка миграции базы данных: %v", err)
	}
	log.Println("[INFO] База данных инициализирована успешно")

	// 2. Инициализация gRPC клиента для Xray
	xrayManager, err := core.NewXrayManager("127.0.0.1:10085")
	if err != nil {
		log.Printf("[WARN] Не удалось подключиться к Xray gRPC: %v", err)
	} else {
		defer xrayManager.Close()
		log.Println("[INFO] Подключение к Xray gRPC установлено")
	}

	// 3. Настройка роутера
	gin.SetMode(gin.DebugMode)
	router := gin.Default()

	// --- ПУБЛИЧНЫЕ РОУТЫ ---
	public := router.Group("/")
	{
		public.GET("/pc", api.GetLegalPage(db))
		public.GET("/ps", api.GetLegalPage(db))
		public.GET("/sub/:path", api.HandleSubscription(db))
	}

	// --- ЗАЩИЩЕННЫЕ РОУТЫ АДМИНКИ ---
	admin := router.Group("/api")
	{
		// Клиенты
		admin.POST("/clients", api.CreateClient(db))
		
		// Ноды и автонастройка
		admin.POST("/nodes/auto", api.AutoSetupNodes(db, xrayManager))
		admin.PUT("/nodes/:id/traffic-rules", api.UpdateTrafficRules(db))
		
		// Юридические настройки
		admin.POST("/legal", api.UpdateLegalSettings(db))
		
		// Бэкапы
		admin.GET("/backups", api.GetBackupList())
		admin.POST("/backups/restore", api.RestoreFromBackup(db))
		
		// Настройки бота
		admin.POST("/bot/settings", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Настройки бота сохранены"})
		})
	}

	// 4. Запуск Telegram бота
	go func() {
		log.Println("[INFO] Запуск Telegram ShopBot...")
		// telegram.StartBot(db)
	}()

	// 5. Запуск HTTP сервера
	port := "2053"
	log.Printf("[INFO] Веб-сервер запущен и слушает порт %s", port)
	
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("[FATAL] Не удалось запустить сервер: %v", err)
	}
}
