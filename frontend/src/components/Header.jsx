import { useState, useRef, useEffect } from 'react';
import nexoraLogo from '../assets/nexora-logo.png';

const Header = ({ onRegionChange, username, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-brand-center">
        <div className="brand">
          <img src={nexoraLogo} alt="Nexora" className="nexora-logo" />
        </div>
      </div>
      <div className="header-right">
        <div className="profile-dropdown" ref={profileRef}>
          <button 
            className="profile-avatar-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">{username?.charAt(0).toUpperCase()}</div>
          </button>
          
          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <p className="profile-menu-name">{username}</p>
              </div>
              <button 
                className="logout-btn"
                onClick={() => {
                  onLogout && onLogout();
                  setShowProfileMenu(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
