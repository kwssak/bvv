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

	// 1. Инициализация базы данных (SQLite в защищенной папке data)
	os.MkdirAll("./data", 0755)
	dbPath := "./data/awewe.db"
	
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("[FATAL] Не удалось подключиться к базе данных: %v", err)
	}

	// Автоматическая миграция: создает таблицы, если их нет, и добавляет новые поля
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

	// 2. Инициализация gRPC клиента для управления ядром Xray
	// Порт 10085 - стандартный порт gRPC API в конфиге Xray
	xrayManager, err := core.NewXrayManager("127.0.0.1:10085")
	if err != nil {
		log.Printf("[WARN] Не удалось подключиться к Xray gRPC (возможно, ядро еще не запущено): %v", err)
	} else {
		defer xrayManager.Close()
		log.Println("[INFO] Подключение к Xray gRPC установлено")
	}

	// 3. Настройка роутера Gin
	// В продакшене используй gin.ReleaseMode
	gin.SetMode(gin.DebugMode)
	router := gin.Default()

	// --- ПУБЛИЧНЫЕ РОУТЫ (Доступны без авторизации для клиентов) ---
	public := router.Group("/")
	{
		// Юридические страницы (ПК и ПС)
		public.GET("/pc", api.GetLegalPage(db))
		public.GET("/ps", api.GetLegalPage(db))
		
		// Уникальные ссылки подписки (например, /sub/awewe/emsjjxgshkp-gpsh119)
		public.GET("/sub/:path", api.HandleSubscription(db))
	}

	// --- ЗАЩИЩЕННЫЕ РОУТЫ АДМИНКИ (API для фронтенда) ---
	// В реальном проекте здесь должен быть middleware.RequireAuth()
	admin := router.Group("/api")
	{
		// Клиенты
		admin.POST("/clients", api.CreateClient(db))
		
		// Ноды и автонастройка
		admin.POST("/nodes/auto", api.AutoSetupNodes(db, xrayManager))
		admin.PUT("/nodes/:id/traffic-rules", api.UpdateTrafficRules(db))
		
		// Юридические настройки
		admin.POST("/legal", api.UpdateLegalSettings(db))
		
		// Настройки бота (заглушка для примера)
		admin.POST("/bot/settings", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Настройки бота сохранены"})
		})
	}

	// 4. Запуск Telegram бота в отдельной горутине (не блокирует веб-сервер)
	// Здесь мы передаем конфиг, чтобы бот мог читать CustomInstructions из БД
	go func() {
		log.Println("[INFO] Запуск Telegram ShopBot...")
		// telegram.StartBot(db) // Раскомментировать при реализации полной логики бота
	}()

	// 5. Запуск HTTP сервера
	port := "2053" // В реальном проекте читается из config.json
	log.Printf("[INFO] Веб-сервер запущен и слушает порт %s", port)
	
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("[FATAL] Не удалось запустить сервер: %v", err)
	}
}
