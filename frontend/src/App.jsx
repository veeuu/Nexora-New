// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ChatBot from './components/ChatBot';
import './styles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [dashboardNav, setDashboardNav] = useState(null);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('userId') || '';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);
  }, [isAuthenticated, username, userId]);

  const handleLogin = (user) => {
    setUsername(user.email);
    setUserId(user.id);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setUserId('');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  };

  const handleChatbotNavigate = (page) => {
    if (dashboardNav) {
      dashboardNav(page);
    }
  };

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} onNavRef={setDashboardNav} username={username} userId={userId} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
      </Routes>
      {/* <ChatBot isAuthenticated={isAuthenticated} onNavigate={handleChatbotNavigate} /> */}
    </div>
  );
}

export default App;