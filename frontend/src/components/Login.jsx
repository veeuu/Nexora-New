import React, { useState } from 'react';
import logo from '../assets/Proplus Data Logo - Horizontal Transparent (1).png';
import nexoraLogo from '../assets/nexora-logo.png';
import heroImage from '../assets/ChatGPT_Image_Jan_22__2026__11_00_18_AM-removebg-preview.png';
import '../styles/login.css';

const Login = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(email);
      } else {
        if (data.requiresVerification) {
          setShowOTPVerification(true);
          setError('Please verify your email first. Check your inbox for the OTP.');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, password })
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        setSuccessMessage('Account created! Please check your email for the OTP.');
        setShowOTPVerification(true);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Email verified successfully! You can now login.');
        setShowOTPVerification(false);
        setIsSignup(false);
        setOtp('');
        setPassword('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const endpoint = showResetPassword ? '/api/auth/forgot-password' : '/api/auth/resend-otp';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('OTP resent to your email!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Password reset OTP sent to your email!');
        setShowForgotPassword(false);
        setShowResetPassword(true);
      } else {
        setError(data.message || 'Failed to send reset OTP');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Password reset successfully! You can now login.');
        setShowResetPassword(false);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (showForgotPassword) {
      handleForgotPassword(e);
    } else if (showResetPassword) {
      handleResetPassword(e);
    } else if (showOTPVerification) {
      handleVerifyOTP(e);
    } else if (isSignup) {
      handleSignup(e);
    } else {
      handleLogin(e);
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
          <div className="login-logo-vertical">
            <img src={logo} alt="Proplus Data" className="logo-img-large" />
            <img src={nexoraLogo} alt="Nexora" className="nexora-logo-img-small" />
          </div>

          {/* OTP Verification Screen */}
          {showOTPVerification ? (
            <form onSubmit={handleSubmit} className="login-form">
              <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#333' }}>Verify Your Email</h2>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                We've sent a 6-digit OTP to <strong>{email}</strong>
              </p>

              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="form-input"
                    maxLength="6"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {successMessage && <div className="form-success">{successMessage}</div>}
              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn-signin" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666' }}>
                  Didn't receive the OTP?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      padding: 0
                    }}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowOTPVerification(false);
                    setOtp('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    padding: 0
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : showForgotPassword ? (
            <form onSubmit={handleSubmit} className="login-form">
              <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#333' }}>Forgot Password</h2>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Enter your email address and we'll send you an OTP to reset your password
              </p>

              <div className="form-group">
                <label htmlFor="forgot-email">Email</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {successMessage && <div className="form-success">{successMessage}</div>}
              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn-signin" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset OTP'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setEmail('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    padding: 0
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : showResetPassword ? (
            <form onSubmit={handleSubmit} className="login-form">
              <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#333' }}>Reset Password</h2>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Enter the OTP sent to <strong>{email}</strong> and your new password
              </p>

              <div className="form-group">
                <label htmlFor="reset-otp">Enter OTP</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    id="reset-otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="form-input"
                    maxLength="6"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showNewPassword ? (
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

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showConfirmPassword ? (
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

              {successMessage && <div className="form-success">{successMessage}</div>}
              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn-signin" disabled={loading || otp.length !== 6}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666' }}>
                  Didn't receive the OTP?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      padding: 0
                    }}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    padding: 0
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
            {isSignup && (
              <div className="form-group">
                <label htmlFor="fullname">Full Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            )}

            {isSignup && (
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            )}

            {!isSignup && (
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            )}

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
                  required
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

            {!isSignup && (
              <div className="form-remember">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    padding: 0,
                    marginLeft: 'auto'
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {successMessage && <div className="form-success">{successMessage}</div>}
            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn-signin" disabled={loading}>
              {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Login')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                    setEmail('');
                    setFullName('');
                    setPassword('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    padding: 0
                  }}
                >
                  {isSignup ? 'Login' : 'Create Account'}
                </button>
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.75rem', fontWeight: '500' }}>
                Connect with Us
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                {/* Gmail Icon */}
                <a
                  href="mailto:info@proplusdata.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    color: '#EA4335',
                    transition: 'transform 0.3s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Email us"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-10 5L2 7"></path>
                  </svg>
                </a>

                {/* LinkedIn Icon */}
                <a
                  href="https://www.linkedin.com/company/proplus-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    color: '#0A66C2',
                    transition: 'transform 0.3s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Follow us on LinkedIn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.81 0-9.728h3.554v1.375c.427-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.362v5.586zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.955.77-1.71 1.954-1.71 1.184 0 1.915.755 1.915 1.71 0 .951-.731 1.71-1.954 1.71zm1.575 11.597H3.762V9.624h3.15v10.828zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                  </svg>
                </a>

                {/* Instagram Icon */}
                <a
                  href="https://www.instagram.com/proplusdata/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    color: '#E4405F',
                    transition: 'transform 0.3s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Follow us on Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <circle cx="17.5" cy="6.5" r="1.5"></circle>
                  </svg>
                </a>
              </div>
            </div>

            {/* <p className="form-signup">
              Don't have an account? <a href="#signup">Sign up</a>
            </p> */}
          </form>
          )}

          <p className="copyright"></p>
        </div>
        <div className="powered-by">Powered by ProPlus Data</div>
      </div>
    </div>
  );
};

export default Login;
