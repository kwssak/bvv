import React, { useState, useEffect } from 'react';

function Legal() {
  const [pcTitle, setPcTitle] = useState('Пользовательское соглашение');
  const [pcText, setPcText] = useState('1.1. Настоящее Соглашение регулирует отношения между Администрацией сервиса Awewe Panel и Пользователем.\n1.2. Сервис предоставляет инструменты для настройки безопасного соединения.');
  
  const [psTitle, setPsTitle] = useState('Политика конфиденциальности');
  const [psText, setPsText] = useState('2.1. Мы собираем минимально необходимые данные для функционирования сервиса.\n2.2. Email-адреса не передаются третьим лицам.');

  const [serverHost, setServerHost] = useState('panel.svreeroff.site');
  const [protocol, setProtocol] = useState('https');

  useEffect(() => {
    // Здесь должен быть fetch запрос к API для получения текущих настроек
    // setPcText(data.pc_text) и т.д.
    // Для демо используем хардкод хоста
  }, []);

  const handleSave = () => {
    // fetch('/api/legal', { method: 'POST', body: JSON.stringify({ pc_title: pcTitle, pc_text: pcText, ... }) })
    alert('Юридические настройки сохранены');
  };

  const pcLink = `${protocol}://${serverHost}/pc`;
  const psLink = `${protocol}://${serverHost}/ps`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Ссылка скопирована: ' + text);
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '20px' }}>Юридическая информация (ПК и ПС)</h2>
        
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Домен панели (для генерации ссылок)</label>
            <input 
              type="text" 
              className="form-input" 
              value={serverHost} 
              onChange={(e) => setServerHost(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Протокол</label>
            <select className="form-select" value={protocol} onChange={(e) => setProtocol(e.target.value)}>
              <option value="https">HTTPS (для домена)</option>
              <option value="http">HTTP (для IP адреса)</option>
            </select>
          </div>
        </div>

        <div className="grid-2">
          {/* Блок ПК */}
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--accent)' }}>Пользовательское соглашение (ПК)</h3>
            <div className="form-group">
              <label className="form-label">Заголовок</label>
              <input type="text" className="form-input" value={pcTitle} onChange={(e) => setPcTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Текст соглашения</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '200px' }}
                value={pcText}
                onChange={(e) => setPcText(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ссылка для клиентов</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="form-input" value={pcLink} readOnly style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                <button className="btn btn-sm" onClick={() => copyToClipboard(pcLink)}><i className="ph ph-copy"></i></button>
              </div>
            </div>
          </div>

          {/* Блок ПС */}
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--accent)' }}>Политика конфиденциальности (ПС)</h3>
            <div className="form-group">
              <label className="form-label">Заголовок</label>
              <input type="text" className="form-input" value={psTitle} onChange={(e) => setPsTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Текст политики</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '200px' }}
                value={psText}
                onChange={(e) => setPsText(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ссылка для клиентов</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="form-input" value={psLink} readOnly style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                <button className="btn btn-sm" onClick={() => copyToClipboard(psLink)}><i className="ph ph-copy"></i></button>
              </div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '16px' }}>
          <i className="ph ph-floppy-disk"></i> Сохранить юридические настройки
        </button>
      </div>
    </div>
  );
}

export default Legal;
