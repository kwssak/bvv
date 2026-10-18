import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Nodes from './pages/Nodes';
import CDN from './pages/CDN';
import Subscription from './pages/Subscription';
import Telegram from './pages/Telegram';
import Domains from './pages/Domains';
import Servers from './pages/Servers';
import Legal from './pages/Legal';
import Backup from './pages/Backup';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dash');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Заглушка авторизации

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h2>Awewe Panel Login</h2>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button onClick={() => setIsAuthenticated(true)}>Login</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dash': return <Dashboard />;
      case 'clients': return <Clients />;
      case 'nodes': return <Nodes />;
      case 'cdn': return <CDN />;
      case 'subscription': return <Subscription />;
      case 'telegram': return <Telegram />;
      case 'domains': return <Domains />;
      case 'servers': return <Servers />;
      case 'legal': return <Legal />;
      case 'backup': return <Backup />;
      case 'logs': return <Logs />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="app-layout">
      <nav className="top-nav">
        <div className="logo-block">
          <div className="logo">Awewe Panel</div>
          <div className="panel-domain" id="current-domain">panel.awewe.site</div>
        </div>
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'dash' ? 'active' : ''}`} 
            onClick={() => handleTabClick('dash')}
          >
            <i className="ph ph-squares-four"></i><span>Обзор</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`} 
            onClick={() => handleTabClick('clients')}
          >
            <i className="ph ph-users"></i><span>Клиенты</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'nodes' ? 'active' : ''}`} 
            onClick={() => handleTabClick('nodes')}
          >
            <i className="ph ph-plugs"></i><span>Ноды</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cdn' ? 'active' : ''}`} 
            onClick={() => handleTabClick('cdn')}
          >
            <i className="ph ph-cloud"></i><span>CDN</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`} 
            onClick={() => handleTabClick('subscription')}
          >
            <i className="ph ph-link"></i><span>Подписка</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'telegram' ? 'active' : ''}`} 
            onClick={() => handleTabClick('telegram')}
          >
            <i className="ph ph-telegram-logo"></i><span>Бот</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'domains' ? 'active' : ''}`} 
            onClick={() => handleTabClick('domains')}
          >
            <i className="ph ph-globe"></i><span>Домены</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'servers' ? 'active' : ''}`} 
            onClick={() => handleTabClick('servers')}
          >
            <i className="ph ph-hard-drives"></i><span>Серверы</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'legal' ? 'active' : ''}`} 
            onClick={() => handleTabClick('legal')}
          >
            <i className="ph ph-file-text"></i><span>ПК и ПС</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`} 
            onClick={() => handleTabClick('backup')}
          >
            <i className="ph ph-database"></i><span>Бэкапы</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} 
            onClick={() => handleTabClick('logs')}
          >
            <i className="ph ph-terminal"></i><span>Логи</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} 
            onClick={() => handleTabClick('settings')}
          >
            <i className="ph ph-gear"></i><span>Настройки</span>
          </button>
        </div>
        <div className="nav-actions">
          <button className="minimal-toggle" id="minimal-btn" onClick={() => document.body.classList.toggle('minimal-mode')} title="Минимализм">
            <i className="ph ph-circle-half-tilt"></i><span>Минимализм</span>
          </button>
          <button className="btn-icon-nav" onClick={() => alert('Смена темы')} title="Сменить тему">
            <i className="ph ph-palette"></i>
          </button>
          <button className="btn-icon-nav" onClick={() => setIsAuthenticated(false)} title="Выход">
            <i className="ph ph-sign-out"></i>
          </button>
        </div>
      </nav>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
