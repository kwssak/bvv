import React, { useState, useEffect } from 'react';

function Clients() {
  const [clients, setClients] = useState([]);
  const [serverConfig, setServerConfig] = useState({ protocol: 'http', host: '144.31.164.231', port: '2053' });

  useEffect(() => {
    // Загрузка клиентов и конфига сервера с бэкенда
    // setClients(data); setServerConfig(config);
    // Демо-данные:
    setClients([
      { id: 1, name: 'Клиент 1', sub_path: 'awewe/emsjjxgshkp-gpsh119', traffic: '12 / 50 ГБ', expiry: '15.12.2026', is_active: true },
      { id: 2, name: 'Клиент 2', sub_path: 'awewe/ewwerosnpsbh-wheff638', traffic: '9.5 / 10 ГБ', expiry: '01.11.2026', is_active: true }
    ]);
  }, []);

  const getSubLink = (subPath) => {
    return `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/sub/${subPath}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Ссылка скопирована!');
  };

  return (
    <div className="main-content">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="card-title">Управление клиентами</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => window.open('/legal.html', '_blank')}>
              <i className="ph ph-file-text"></i> ПК и ПС
            </button>
            <button className="btn btn-primary">+ Добавить клиента</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Уникальная ссылка подписки</th>
                <th>Трафик</th>
                <th>Истекает</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td><strong>{client.name}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ fontSize: '11px', color: 'var(--accent)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getSubLink(client.sub_path)}
                      </code>
                      <button className="btn btn-sm" onClick={() => copyToClipboard(getSubLink(client.sub_path))}>
                        <i className="ph ph-copy"></i>
                      </button>
                    </div>
                    {/* Email намеренно НЕ выводится здесь, он скрыт на уровне бэкенда и не нужен в конфигураторе */}
                  </td>
                  <td>{client.traffic}</td>
                  <td>{client.expiry}</td>
                  <td>
                    <span className={`chip ${client.is_active ? 'active' : 'danger'}`}>
                      {client.is_active ? 'Активен' : 'Отключен'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm"><i className="ph ph-pencil"></i></button>
                    <button className="btn btn-sm btn-danger"><i className="ph ph-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Clients;
