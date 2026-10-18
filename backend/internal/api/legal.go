package api

import (
	"fmt"
	"html/template"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"awewe-panel/internal/database"
)

// GetLegalPage отдает HTML страницу с текстом ПК или ПС
func GetLegalPage(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		pageType := c.Param("type") // "pc" или "ps"
		if pageType != "pc" && pageType != "ps" {
			c.String(http.StatusNotFound, "Страница не найдена")
			return
		}

		var settings database.LegalSettings
		db.First(&settings)

		title := settings.PSTitle
		text := settings.PSText
		if pageType == "pc" {
			title = settings.PCTitle
			text = settings.PCText
		}

		// Если тексты пустые, ставим заглушку
		if title == "" {
			title = "Документ"
		}
		if text == "" {
			text = "Текст документа пока не заполнен администратором."
		}

		// Простой HTML шаблон в черной теме
		htmlContent := fmt.Sprintf(`
		<!DOCTYPE html>
		<html lang="ru">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>%s | Awewe Panel</title>
			<style>
				body { background-color: #000000; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px 20px; max-width: 800px; margin: 0 auto; }
				h1 { color: #3b82f6; border-bottom: 1px solid #333; padding-bottom: 10px; }
				p { color: #a1a1aa; margin-bottom: 15px; white-space: pre-wrap; }
				a { color: #3b82f6; text-decoration: none; }
				a:hover { text-decoration: underline; }
			</style>
		</head>
		<body>
			<a href="/">&larr; Вернуться в панель</a>
			<h1>%s</h1>
			<p>%s</p>
		</body>
		</html>
		`, template.HTMLEscapeString(title), template.HTMLEscapeString(title), template.HTMLEscapeString(text))

		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(htmlContent))
	}
}

// UpdateLegalSettings обновляет тексты из админки
func UpdateLegalSettings(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req database.LegalSettings
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Обновляем или создаем запись (всегда ID 1 для простоты)
		req.ID = 1
		db.Save(&req)

		c.JSON(http.StatusOK, gin.H{"message": "Юридические настройки сохранены"})
	}
}
