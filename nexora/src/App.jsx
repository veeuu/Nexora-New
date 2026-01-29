// src/App.jsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ChatBot from './components/ChatBot';
import './styles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardNav, setDashboardNav] = useState(null);
  const [username, setUsername] = useState('');

  const handleLogin = (user) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
  };

  const handleChatbotNavigate = (page) => {
    if (dashboardNav) {
      dashboardNav(page);
    }
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} onNavRef={setDashboardNav} username={username} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      {/* <ChatBot isAuthenticated={isAuthenticated} onNavigate={handleChatbotNavigate} /> */}
    </div>
  );
}

export default App;