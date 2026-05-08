import { useState, useEffect, useRef } from 'react';
import nexoraLogo from '../assets/Nexora Logo (2)-cropped.svg';

const Menu = ({ activeSection, onMenuClick, menuItems, username, onLogout, onProfileClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  return (
    <nav className="menu">
      <div className="menu-header" onClick={toggleMenu}>
        <div className={`hamburger-menu ${isOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <img src={nexoraLogo} alt="Nexora" className="menu-solutions-image" />
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
      </ul>
      <div className="menu-credits-section">
        <div className="menu-credits-label">Free Credits</div>
        <div className="menu-credits-info">
          <span className="menu-credits-count">0 of 50</span>
        </div>
        <div className="menu-credits-bar">
          <div className="menu-credits-fill" style={{ width: '1%' }}></div>
        </div>
      </div>
      <div className="menu-profile-section" ref={profileRef}>
        <button
          className="menu-profile-btn"
          onClick={() => onProfileClick && onProfileClick()}
          title="View Profile"
        >
          <div className="menu-profile-avatar">
            {getInitials(username)}
          </div>
          <span className="menu-profile-name">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default Menu;