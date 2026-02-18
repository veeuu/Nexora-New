import { useState, useEffect, useRef, useContext } from 'react';
import nexoraLogo from '../assets/nexora-white.png';
import { CreditsContext } from '../context/CreditsContext';

const Menu = ({ activeSection, onMenuClick, menuItems, username, onLogout, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [freeCredits, setFreeCredits] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const profileRef = useRef(null);
  const creditsContext = useContext(CreditsContext);

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
    const fetchCredits = async () => {
      if (!userId) {
        console.log('[MENU] No userId provided');
        setCreditsLoading(false);
        return;
      }

      console.log('[MENU] Fetching credits for userId:', userId);
      try {
        const response = await fetch(`/api/user/credits?userId=${userId}`);
        console.log('[MENU] Credits response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[MENU] Credits data:', data);
          setFreeCredits(data.freeCredits || 0);
          if (creditsContext) {
            creditsContext.setCreditsValue(data.freeCredits || 0);
          }
        } else {
          console.error('[MENU] Failed to fetch credits:', response.statusText);
        }
      } catch (error) {
        console.error('[MENU] Error fetching credits:', error);
      } finally {
        setCreditsLoading(false);
      }
    };

    fetchCredits();
    
    // Refresh credits every 5 seconds
    const interval = setInterval(fetchCredits, 5000);
    return () => clearInterval(interval);
  }, [userId, creditsContext]);

  // Listen to context changes
  useEffect(() => {
    if (creditsContext && creditsContext.credits > 0) {
      console.log('[MENU] Credits updated from context:', creditsContext.credits);
      setFreeCredits(creditsContext.credits);
    }
  }, [creditsContext?.creditsUpdated]);

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

  const updateCredits = async (companyName) => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/user/reveal-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, companyName })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFreeCredits(data.freeCredits);
      }
    } catch (error) {
      console.error('Error updating credits:', error);
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
          <span className="menu-credits-count">{creditsLoading ? '...' : `${freeCredits} of 500`}</span>
        </div>
        <div className="menu-credits-bar">
          <div className="menu-credits-fill" style={{ width: `${(freeCredits / 500) * 100}%` }}></div>
        </div>
      </div>
      <div className="menu-profile-section" ref={profileRef}>
        <button
          className="menu-profile-btn"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          title="Profile"
        >
          <div className="menu-profile-avatar">
            {getInitials(username)}
          </div>
          <span className="menu-profile-name">{username}</span>
        </button>

        {showProfileMenu && (
          <div className="menu-profile-dropdown">
            <button
              className="menu-logout-btn"
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
    </nav>
  );
};

export default Menu;
export { Menu };