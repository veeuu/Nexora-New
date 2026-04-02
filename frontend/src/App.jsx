// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import './styles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [dashboardNav, setDashboardNav] = useState(null);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });
  const [cursorHidden, setCursorHidden] = useState(() => {
    return localStorage.getItem('cursorHidden') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
    localStorage.setItem('username', username);
  }, [isAuthenticated, username]);

  // Cursor hiding functionality - custom visible cursor for user, invisible to recordings
  useEffect(() => {
    // Create custom cursor SVG (small blue dot - visible to user but not captured by recordings)
    const customCursorSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" fill="#3b82f6" opacity="0.7"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.5"/>
      </svg>
    `;
    
    const customCursorDataURL = `data:image/svg+xml;base64,${btoa(customCursorSVG)}`;
    
    // Create and inject cursor hiding styles
    const style = document.createElement('style');
    style.id = 'cursor-recording-style';
    style.textContent = `
      body.hide-cursor-recording * {
        cursor: url('${customCursorDataURL}') 12 12, auto !important;
      }
      body.hide-cursor-recording {
        cursor: url('${customCursorDataURL}') 12 12, auto !important;
      }
    `;
    document.head.appendChild(style);

    // Apply cursor hiding on load
    if (cursorHidden) {
      document.body.classList.add('hide-cursor-recording');
    }

    // Listen for keyboard shortcut Ctrl+Shift+C
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
        e.preventDefault();
        setCursorHidden(prev => {
          const newState = !prev;
          localStorage.setItem('cursorHidden', newState);
          if (newState) {
            document.body.classList.add('hide-cursor-recording');
          } else {
            document.body.classList.remove('hide-cursor-recording');
          }
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update cursor visibility when state changes
  useEffect(() => {
    if (cursorHidden) {
      document.body.classList.add('hide-cursor-recording');
    } else {
      document.body.classList.remove('hide-cursor-recording');
    }
    localStorage.setItem('cursorHidden', cursorHidden);
  }, [cursorHidden]);

  const handleLogin = (user) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPlan');
  };

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} 
        />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} onNavRef={setDashboardNav} username={username} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  );
}

export default App;