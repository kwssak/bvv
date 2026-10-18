import React, { useState } from 'react';

function Telegram() {
  // Идеальный пример JSON с командами и кнопками
  const defaultJson = `[
  {
    "trigger": "/start",
    "response_text": "Добро пожаловать в Awewe VPN! Выберите действие ниже.",
    "inline_buttons": [
      { "text": "Купить подписку", "url": "https://t.me/awewe_shop_bot?start=buy" },
      { "text": "Пользовательское соглашение", "url": "https://panel.svreeroff.site/pc" },
      { "text": "Политика конфиденциальности", "url": "https://panel.svreeroff.site/ps" }
    ]
  },
  {
    "trigger": "оплата",
    "response_text": "Мы принимаем оплату банковскими картами (СБП) и криптовалютой. Нажмите кнопку ниже для перехода к оплате.",
    "inline_buttons": [
      { "text": "Оплатить картой (Platega)", "url": "https://pay.platega.io/..." },
      { "text": "Оплатить криптой", "url": "https://t.me/CryptoBot?start=pay..." }
    ]
  },
  {
    "trigger": "поддержка",
    "response_text": "Для связи с администратором нажмите на кнопку ниже.",
    "inline_buttons": [
      { "text": "Написать в поддержку", "url": "https://t.me/awewe_support" }
    ]
  }
]`;

  const [instructions, setInstructions] = useState(defaultJson);
  const [jsonError, setJsonError] = useState('');

  const validateAndSave = () => {
    try {
      JSON.parse(instructions);
      setJsonError('');
      // Здесь вызов API для сохранения
      alert('JSON валиден и настройки бота сохранены!');
    } catch (e) {
      setJsonError('Ошибка JSON: ' + e.message);
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
            JSON-инструкции для бота (Команды и Кнопки)
          </label>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Загрузите или вставьте JSON массив. Поле "trigger" ищет совпадение в сообщении пользователя. 
            Поле "inline_buttons" создает кнопки под текстом ответа.
          </p>
          <textarea 
            className="form-textarea" 
            style={{ minHeight: '300px', fontFamily: 'monospace', fontSize: '13px', borderColor: jsonError ? 'var(--danger)' : 'var(--glass-border)' }}
            value={instructions}
            onChange={(e) => {
              setInstructions(e.target.value);
              setJsonError('');
            }}
          />
          {jsonError && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '6px' }}>
              <i className="ph ph-warning"></i> {jsonError}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={validateAndSave}>
            <i className="ph ph-floppy-disk"></i> Проверить и сохранить
          </button>
          <button className="btn btn-secondary" onClick={() => setInstructions(defaultJson)}>
            <i className="ph ph-arrow-counter-clockwise"></i> Сбросить к примеру
          </button>
        </div>
      </div>
    </div>
  );
}

export default Telegram;
