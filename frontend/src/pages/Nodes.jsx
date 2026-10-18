import React, { useState, useEffect } from 'react';

function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [trafficRules, setTrafficRules] = useState([]);
  const [newRule, setNewRule] = useState('');

  // Демо-данные
  useEffect(() => {
    setNodes([
      { id: 1, name: 'Германия 1', port: 443, protocol: 'VLESS', transport: 'XHTTP', security: 'uTLS', rules: ['youtube.com', 'telegram.org'] },
      { id: 2, name: 'Нидерланды 2', port: 8443, protocol: 'Trojan', transport: 'TCP', security: 'TLS', rules: [] }
    ]);
  }, []);

  const handleAutoSetup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      base_name: formData.get('base_name'),
      count: parseInt(formData.get('count')),
      start_port: parseInt(formData.get('start_port')),
      mixed: formData.get('mixed') === 'on'
    };

    // Имитация запроса к backend/internal/api/handlers.go -> AutoSetupNodes
    console.log("Отправка запроса на автонастройку:", payload);
    
    // В реальности: const res = await fetch('/api/nodes/auto', { method: 'POST', body: JSON.stringify(payload) });
    
    alert(`Успешно создано ${payload.count} нод с префиксом "${payload.base_name}"`);
    setShowAutoModal(false);
    // Перезагрузка списка нод...
  };

  const openTrafficControl = (node) => {
    setSelectedNode(node);
    setTrafficRules([...node.rules]);
    setShowTrafficModal(true);
  };

  const addRule = () => {
    if (newRule && !trafficRules.includes(newRule)) {
      setTrafficRules([...trafficRules, newRule]);
      setNewRule('');
    }
  };

  const removeRule = (rule) => {
    setTrafficRules(trafficRules.filter(r => r !== rule));
  };

  const saveTrafficRules = async () => {
    // Имитация запроса к UpdateTrafficRules
    console.log(`Сохранение правил для ноды ${selectedNode.name}:`, trafficRules);
    alert('Правила контроля трафика сохранены и применены к ядру Xray');
    setShowTrafficModal(false);
  };

  return (
    <div className="main-content">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="card-title"><i className="ph ph-plugs"></i> Управление нодами</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary">+ Вручную</button>
            <button className="btn btn-primary" onClick={() => setShowAutoModal(true)}>
              <i className="ph ph-magic-wand"></i> Автонастройка
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Порт</th>
                <th>Протокол</th>
                <th>Транспорт</th>
                <th>Шифрование</th>
                <th>Контроль трафика</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map(node => (
                <tr key={node.id}>
                  <td><strong>{node.name}</strong></td>
                  <td>{node.port}</td>
                  <td>{node.protocol}</td>
                  <td>{node.transport}</td>
                  <td>{node.security}</td>
                  <td>
                    {node.rules.length > 0 ? (
                      <span className="chip info">{node.rules.length} правил</span>
                    ) : (
                      <span className="chip">Нет</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => openTrafficControl(node)} title="Контроль трафика">
                      <i className="ph ph-funnel"></i>
                    </button>
                    <button className="btn btn-sm btn-danger" title="Удалить">
                      <i className="ph ph-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно: Автонастройка */}
      {showAutoModal && (
        <div className="modal-overlay active" onClick={() => setShowAutoModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Автонастройка нод</h3>
            <form onSubmit={handleAutoSetup}>
              <div className="form-group">
                <label className="form-label">Базовое имя</label>
                <input name="base_name" className="form-input" placeholder="Германия" required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Количество</label>
                  <input name="count" type="number" className="form-input" defaultValue="5" min="1" max="100" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Начальный порт</label>
                  <input name="start_port" type="number" className="form-input" defaultValue="443" required />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <input name="mixed" type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)', width: '18px', height: '18px' }} />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>Смешанные протоколы</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Случайная комбинация VLESS/Trojan/VMess + XHTTP/gRPC/WS + uTLS/Reality для максимальной устойчивости.</div>
                  </div>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowAutoModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно: Контроль трафика */}
      {showTrafficModal && selectedNode && (
        <div className="modal-overlay active" onClick={() => setShowTrafficModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title"><i className="ph ph-funnel"></i> Контроль трафика: {selectedNode.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Разрешенный трафик будет проходить только через указанные домены. Все остальные сервисы игнорируются.
            </p>
            
            <div className="form-group">
              <label className="form-label">Быстрый выбор</label>
              <select className="form-select" onChange={(e) => {
                if(e.target.value && !trafficRules.includes(e.target.value)) {
                  setTrafficRules([...trafficRules, e.target.value]);
                  e.target.value = "";
                }
              }}>
                <option value="">Выберите сервис...</option>
                <option value="youtube.com">YouTube</option>
                <option value="telegram.org">Telegram</option>
                <option value="gemini.google.com">Gemini</option>
                <option value="discord.com">Discord</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Разрешенные домены</label>
              {trafficRules.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '8px' }}>Нет разрешенных доменов</div>
              ) : (
                trafficRules.map((rule, idx) => (
                  <div key={idx} className="traffic-rule">
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{rule}</div>
                      <div className="traffic-rule-code">Разрешен трафик</div>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => removeRule(rule)}><i className="ph ph-x"></i></button>
                  </div>
                ))
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="example.com" 
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary btn-sm" onClick={addRule}><i className="ph ph-plus"></i></button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { setTrafficRules([]); }}>Очистить</button>
              <button className="btn btn-primary" onClick={saveTrafficRules}>Сохранить правила</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nodes;
