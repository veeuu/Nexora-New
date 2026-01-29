import React, { useState } from 'react';
import logo from '../assets/Proplus Data Logo - Horizontal Transparent (1).png';
import nexoraLogo from '../assets/nexora-logo.png';
import heroImage from '../assets/ChatGPT_Image_Jan_22__2026__11_00_18_AM-removebg-preview.png';
import '../styles/login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'Nexora' && password === 'Proplus@2025') {
      onLogin(username);
    } else {
      alert('Incorrect username or password');
    }
  };

  return (
    <div className="login-container">
      {/* Left Section - Hero Image */}
      <div className="login-left">
        <div className="hero-content">
          <div className="hero-illustration">
            <img src={heroImage} alt="Nexora Intelligence" className="hero-image" />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-logo">
            <img src={logo} alt="Proplus Data" className="logo-img" />
            <span className="logo-sep">|</span>
            <img src={nexoraLogo} alt="Nexora" className="nexora-logo-img" />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <input
                  id="email"
                  type="text"
                  placeholder="nexora@proplus.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-remember">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
              <span className="remember-text">Save my login details for next time.</span>
            </div>

            <button type="submit" className="btn-signin">
              Sign In
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1rem', color: '#666' }}>
              <a href="https://www.linkedin.com/newsletters/the-proplus-data-newsletter-7419630672841150464/" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#40a9ff'} onMouseLeave={(e) => e.target.style.color = '#1890ff'}>
                Subscribe to our newsletter
              </a>
            </p>

            {/* <p className="form-signup">
              Don't have an account? <a href="#signup">Sign up</a>
            </p> */}
          </form>

          <p className="copyright"></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
