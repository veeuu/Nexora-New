import { useState, useEffect, useRef } from 'react';
import nexoraLogo from '../assets/Nexora Powered By PPD [White]-cropped.svg';
import { getCredits, TOTAL_CREDITS } from '../utils/credits';

const Menu = ({ activeSection, onMenuClick, menuItems, username, onLogout, onProfileClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [credits, setCredits] = useState(getCredits);
  const profileRef = useRef(null);
  const resourcesRef = useRef(null);

  useEffect(() => {
    const onUpdate = () => setCredits(getCredits());
    window.addEventListener('creditsUpdated', onUpdate);
    return () => window.removeEventListener('creditsUpdated', onUpdate);
  }, []);

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
      if (resourcesRef.current && !resourcesRef.current.contains(event.target)) {
        setShowResources(false);
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
        {/* Resources inline on mobile */}
        {isMobile && (
          <>
            <li onClick={() => handleMenuItemClick('Product Catalogue')}
              className={activeSection === 'Product Catalogue' ? 'active' : ''}
              style={{ paddingLeft: '2.25rem', fontSize: '0.9rem', opacity: 0.85 }}>
              Product Catalogue
            </li>
            <li onClick={() => handleMenuItemClick('Data Dictionary')}
              className={activeSection === 'Data Dictionary' ? 'active' : ''}
              style={{ paddingLeft: '2.25rem', fontSize: '0.9rem', opacity: 0.85 }}>
              Data Dictionary
            </li>
            <li onClick={() => { onProfileClick && onProfileClick(); setIsOpen(false); }}
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px', paddingTop: '12px' }}>
              👤 Profile
            </li>
          </>
        )}
      </ul>

      {/* Resources dropdown — desktop only */}
      {!isMobile && (
        <div className="menu-resources" ref={resourcesRef}>
          <button
            className={`menu-resources-btn${showResources ? ' open' : ''}`}
            onClick={() => setShowResources(v => !v)}
          >
            <span>Resources</span>
            <span className={`menu-resources-arrow${showResources ? ' up' : ''}`}>▾</span>
          </button>
          {showResources && (
            <div className="menu-resources-dropdown">
              <button className="menu-resources-item" onClick={() => { onMenuClick('Product Catalogue'); setShowResources(false); }}>
                Product Catalogue
              </button>
              <button className="menu-resources-item" onClick={() => { onMenuClick('Data Dictionary'); setShowResources(false); }}>
                Data Dictionary
              </button>
            </div>
          )}
        </div>
      )}

      <div className="menu-contact-us">
        <button
          className={`menu-contact-us-btn${activeSection === 'Contact Us' ? ' active' : ''}`}
          onClick={() => handleMenuItemClick('Contact Us')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Contact Us
        </button>
      </div>
      <div className="menu-credits-section">
        <div className="menu-credits-label">Free Credits</div>
        <div className="menu-credits-info">
          <span className="menu-credits-count">{credits.used} of {TOTAL_CREDITS}</span>
        </div>
        <div className="menu-credits-bar">
          <div className="menu-credits-fill" style={{ width: `${Math.min((credits.used / TOTAL_CREDITS) * 100, 100)}%` }}></div>
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