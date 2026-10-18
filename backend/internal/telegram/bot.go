package telegram

import (
	"encoding/json"
	"log"
	"strings"
	// "github.com/go-telegram-bot-api/telegram-bot-api/v5" // реальный импорт
)

// BotInstruction определяет структуру JSON-инструкции
type BotInstruction struct {
	Trigger   string `json:"trigger"`   // Например: "/start" или "привет"
	Response  string `json:"response"`  // Текст ответа
	HasButton bool   `json:"has_button"`
	ButtonURL string `json:"button_url"`
}

// ProcessMessage обрабатывает сообщение, сверяясь с JSON-инструкциями
func ProcessMessage(messageText string, customInstructionsJSON string) string {
	if customInstructionsJSON == "" {
		return "Бот настроен. Используйте /start для начала."
	}

	var instructions []BotInstruction
	if err := json.Unmarshal([]byte(customInstructionsJSON), &instructions); err != nil {
		log.Println("Ошибка парсинга JSON инструкций бота:", err)
		return "Произошла ошибка в настройках бота."
	}

	messageText = strings.ToLower(strings.TrimSpace(messageText))

	for _, instr := range instructions {
		if strings.Contains(messageText, strings.ToLower(instr.Trigger)) {
			return instr.Response // В реальном коде здесь будет отправка сообщения с кнопкой
		}
	}

	return "Я не понял команду. Обратитесь к администратору."
}
