import { useState, useEffect, useRef } from 'react';
import solutionsImage from '../assets/unnamed (1).png';

const Menu = ({ activeSection, onMenuClick, menuItems, onLogout, username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileOpen]);

  const toggleMenu = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
  };

  const handleMenuItemClick = (item) => {
    onMenuClick(item);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    onLogout();
  };

  const getInitial = () => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className="menu">
      <div className="menu-header" onClick={toggleMenu}>
        <div className={`hamburger-menu ${isOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <img src={solutionsImage} alt="Solutions" className="menu-solutions-image" />
      </div>
      <ul className={`menu-items ${isOpen ? 'open' : ''}`}>
        {menuItems.map((item) => (
          <li 
            key={item} 
            className={activeSection === item ? 'active' : ''}
            onClick={() => handleMenuItemClick(item)}
          >
            {item}
          </li>
        ))}
        <li className="menu-profile-item">
          <div className="profile-section" ref={profileRef}>
            <button 
              className="profile-avatar-btn"
              onClick={toggleProfileMenu}
              title={username}
            >
              <div className="profile-avatar-menu">
                <span className="profile-initial">{getInitial()}</span>
                <span className="profile-username">{username}</span>
              </div>
            </button>
            {isProfileOpen && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <p className="profile-dropdown-name">{username}</p>
                </div>
                <button 
                  className="profile-logout-btn"
                  onClick={handleLogoutClick}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;