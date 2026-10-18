import React, { useState } from 'react';

function Telegram() {
  const [instructions, setInstructions] = useState(`[
  {
    "trigger": "/start",
    "response": "Добро пожаловать в Awewe VPN! Выберите тариф ниже.",
    "has_button": true,
    "button_url": "https://t.me/awewe_support"
  },
  {
    "trigger": "оплата",
    "response": "Для оплаты выберите способ: Карта (Platega) или Криптовалюта (CryptoBot)."
  }
]`);

  const handleSave = () => {
    try {
      JSON.parse(instructions); // Валидация JSON
      alert('Инструкции бота успешно сохранены!');
      // Здесь вызов API для сохранения в БД
    } catch (e) {
      alert('Ошибка: Невалидный JSON формат! Проверьте кавычки и запятые.');
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '16px' }}>
          <i className="ph ph-telegram-logo"></i> Настройки Telegram ShopBot
        </h2>
        
        <div className="grid-2">
          <div>
            <div className="form-group">
              <label className="form-label">Bot Token</label>
              <input type="password" className="form-input" placeholder="123456:ABC-DEF..." />
            </div>
            <div className="form-group">
              <label className="form-label">Platega API Key</label>
              <input type="password" className="form-input" placeholder="pk_test_..." />
            </div>
          </div>
          <div>
            <div className="form-group">
              <label className="form-label">Admin Chat ID</label>
              <input type="text" className="form-input" placeholder="123456789" />
            </div>
            <div className="form-group">
              <label className="form-label">Уведомлять об истечении за (дней)</label>
              <input type="number" className="form-input" defaultValue="3" />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '24px' }}>
          <label className="form-label">
            JSON-инструкции для ответов бота 
            <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}> (Определяет, как бот реагирует на команды)</span>
          </label>
          <textarea 
            className="form-textarea" 
            style={{ minHeight: '200px', fontFamily: 'monospace', fontSize: '13px' }}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder='[{"trigger": "/start", "response": "Привет!"}]'
          />
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Бот будет проверять сообщение пользователя на наличие "trigger". Если совпадение найдено, он отправит "response".
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSave}>
          <i className="ph ph-floppy-disk"></i> Сохранить настройки бота
        </button>
      </div>
    </div>
  );
}

export default Telegram;
