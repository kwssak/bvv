package telegram

import (
	"encoding/json"
	"strings"
)

// BotCommand описывает одну инструкцию для бота
type BotCommand struct {
	Trigger        string          `json:"trigger"`         // Например: "/start" или "оплата"
	ResponseText   string          `json:"response_text"`   // Текст, который отправит бот
	InlineButtons  []InlineButton  `json:"inline_buttons"`  // Массив кнопок под сообщением
}

// InlineButton описывает кнопку под сообщением
type InlineButton struct {
	Text string `json:"text"` // Текст на кнопке
	URL  string `json:"url"`  // Ссылка, куда ведет кнопка
}

// ProcessBotMessage ищет совпадение триггера и возвращает готовый ответ с кнопками
func ProcessBotMessage(messageText string, instructionsJSON string) (string, []InlineButton) {
	if instructionsJSON == "" {
		return "Бот настроен. Используйте /start для начала.", nil
	}

	var commands []BotCommand
	if err := json.Unmarshal([]byte(instructionsJSON), &commands); err != nil {
		return "Ошибка в формате JSON инструкций. Обратитесь к администратору.", nil
	}

	messageText = strings.ToLower(strings.TrimSpace(messageText))

	for _, cmd := range commands {
		// Проверяем точное совпадение или вхождение (для гибкости)
		if strings.Contains(messageText, strings.ToLower(cmd.Trigger)) {
			return cmd.ResponseText, cmd.InlineButtons
		}
	}

	return "Команда не распознана. Попробуйте /start", nil
}
