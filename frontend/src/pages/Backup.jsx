import React, { useState, useEffect } from 'react';

function Backup() {
  const [backups, setBackups] = useState({
    nodes: [],
    clients: [],
    tg: [],
    syslog: []
  });
  const [selectedCategory, setSelectedCategory] = useState('nodes');
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    // Загрузка списка бэкапов
    // fetch('/api/backups').then(res => res.json()).then(setBackups);
    
    // Демо-данные
    setBackups({
      nodes: ['nodes-20261018_120000.json', 'nodes-20261018_060000.json'],
      clients: ['clients-20261018_120000.json', 'clients-20261018_060000.json'],
      tg: ['tg-settings-20261018_120000.json'],
      syslog: ['syslog-20261018_120000.tar.gz']
    });
  }, []);

  const handleRestore = async () => {
    if (!selectedFile) {
      alert('Выберите файл бэкапа');
      return;
    }

    if (!confirm(`Восстановить ${selectedCategory} из ${selectedFile}? Текущие данные будут заменены.`)) {
      return;
    }

    // fetch('/api/backups/restore', { 
    //   method: 'POST', 
    //   body: JSON.stringify({ category: selectedCategory, file_name: selectedFile }) 
    // });

    alert(`Восстановление ${selectedCategory} из ${selectedFile} запущено`);
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '20px' }}>
          <i className="ph ph-database"></i> Восстановление из бэкапов
        </h2>

        <div className="grid-2">
          <div>
            <div className="form-group">
              <label className="form-label">Категория бэкапа</label>
              <select 
                className="form-select" 
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedFile('');
                }}
              >
                <option value="nodes">Ноды (ноды, клиенты, ключи)</option>
                <option value="clients">Клиенты (с трафиком)</option>
                <option value="tg">Telegram бот (настройки)</option>
                <option value="syslog">Система и логи</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Доступные бэкапы</label>
              <select 
                className="form-select" 
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                style={{ minHeight: '200px' }}
              >
                <option value="">Выберите файл...</option>
                {backups[selectedCategory]?.map(file => (
                  <option key={file} value={file}>{file}</option>
                ))}
              </select>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)', marginTop: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <strong style={{ color: 'var(--warning)' }}>Внимание:</strong> Восстановление заменит текущие данные данными из бэкапа. 
                Бэкапы создаются автоматически каждые 6 часов.
              </p>
            </div>
          </div>

          <div>
            <div className="form-group">
              <label className="form-label">Информация о категории</label>
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '13px', lineHeight: '1.6' }}>
                {selectedCategory === 'nodes' && (
                  <>
                    <strong>Ноды:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                      <li>Конфигурации всех нод</li>
                      <li>Публичные и секретные ключи</li>
                      <li>Правила контроля трафика</li>
                      <li>Удаленные ноды также удаляются из бэкапа</li>
                    </ul>
                  </>
                )}
                {selectedCategory === 'clients' && (
                  <>
                    <strong>Клиенты:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                      <li>Все действующие клиенты</li>
                      <li>Остаток и расход трафика</li>
                      <li>Неактивные клиенты помечаются красным</li>
                      <li>Через 3 недели неактивности удаляются</li>
                    </ul>
                  </>
                )}
                {selectedCategory === 'tg' && (
                  <>
                    <strong>Telegram бот:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                      <li>Токен бота</li>
                      <li>ID администратора</li>
                      <li>API ключи Platega и CryptoBot</li>
                      <li>JSON-инструкции для ответов</li>
                    </ul>
                  </>
                )}
                {selectedCategory === 'syslog' && (
                  <>
                    <strong>Система и логи:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                      <li>Конфигурационный файл панели</li>
                      <li>Системные логи</li>
                      <li>Логи обновлений Xray</li>
                      <li>Требует ручного восстановления</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleRestore}
          disabled={!selectedFile}
          style={{ marginTop: '20px' }}
        >
          <i className="ph ph-arrow-counter-clockwise"></i> Восстановить из бэкапа
        </button>
      </div>
    </div>
  );
}

export default Backup;
