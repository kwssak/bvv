package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	"awewe-panel/internal/database"
)

// GetBackupList возвращает список доступных бэкапов по категориям
func GetBackupList() gin.HandlerFunc {
	return func(c *gin.Context) {
		backupBase := "/etc/awewe/backup"
		
		categories := map[string]string{
			"nodes":   "nodes",
			"clients": "clients",
			"tg":      "tg",
			"syslog":  "syslog",
		}

		result := make(map[string][]string)

		for cat, dir := range categories {
			dirPath := filepath.Join(backupBase, dir)
			files, err := ioutil.ReadDir(dirPath)
			if err != nil {
				result[cat] = []string{}
				continue
			}

			var backups []string
			for _, f := range files {
				if !f.IsDir() && (strings.HasSuffix(f.Name(), ".json") || strings.HasSuffix(f.Name(), ".tar.gz")) {
					backups = append(backups, f.Name())
				}
			}

			// Сортируем по убыванию (новые первые)
			sort.Sort(sort.Reverse(sort.StringSlice(backups)))
			result[cat] = backups
		}

		c.JSON(http.StatusOK, result)
	}
}

// RestoreFromBackup восстанавливает данные из выбранного бэкапа
func RestoreFromBackup(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Category string `json:"category" binding:"required"` // nodes, clients, tg, syslog
			FileName string `json:"file_name" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		backupBase := "/etc/awewe/backup"
		filePath := filepath.Join(backupBase, req.Category, req.FileName)

		// Проверка существования файла
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Backup file not found"})
			return
		}

		// Читаем JSON файл
		data, err := ioutil.ReadFile(filePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read backup file"})
			return
		}

		// Восстанавливаем в зависимости от категории
		switch req.Category {
		case "nodes":
			var nodes []database.Node
			if err := json.Unmarshal(data, &nodes); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid backup format"})
				return
			}
			
			// Очищаем текущие ноды и восстанавливаем из бэкапа
			db.Where("1 = 1").Delete(&database.Node{})
			for _, node := range nodes {
				db.Create(&node)
			}
			
			c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Restored %d nodes", len(nodes))})

		case "clients":
			var clients []database.Client
			if err := json.Unmarshal(data, &clients); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid backup format"})
				return
			}
			
			db.Where("1 = 1").Delete(&database.Client{})
			for _, client := range clients {
				db.Create(&client)
			}
			
			c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Restored %d clients", len(clients))})

		case "tg":
			var settings []database.BotSettings
			if err := json.Unmarshal(data, &settings); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid backup format"})
				return
			}
			
			db.Where("1 = 1").Delete(&database.BotSettings{})
			for _, s := range settings {
				db.Create(&s)
			}
			
			c.JSON(http.StatusOK, gin.H{"message": "Telegram bot settings restored"})

		case "syslog":
			// Для syslog просто возвращаем успех (восстановление логов не критично)
			c.JSON(http.StatusOK, gin.H{"message": "System logs backup selected (manual restore required)"})

		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		}
	}
}
