import { useState, useEffect } from 'react';
import ploplusLogo from '../assets/Proplus Data Logo - Horizontal Transparent (1).png';

const Menu = ({ activeSection, onMenuClick, menuItems, onLogout, username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
        <span>Solutions</span>
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
      <div className="menu-footer">
        <a href="https://proplusdata.co/" target="_blank" rel="noopener noreferrer" className="menu-proplus-link">
          <img src={ploplusLogo} alt="Proplus Data" className="menu-proplus-logo" />
        </a>
      </div>
    </nav>
  );
};

export default Menu;