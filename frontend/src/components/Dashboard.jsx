import React, { useState, useEffect } from 'react';
import { IndustryProvider } from '../context/IndustryContext';
import Header from './Header';
import Menu from './Menu';
import Home from './martech/Home';
import MartechSummary from './martech/Summary';
import MartechNTP from './martech/NTP';
import Martechintent from './martech/Intent';
import MartechTechnographics from './martech/Technographics';
import RenewalIntelligence from './martech/RenewalIntelligence';
import MartechBuyingGroup from './martech/BuyingGroup';
import ProductCatalogue from './martech/ProductCatalogue';

const Dashboard = ({ onLogout, onNavRef, username }) => {
  const [activeSection, setActiveSection] = useState('Home');

  const handleMenuClick = (section) => {
    setActiveSection(section);
  };

  const handleChatbotNavigation = (page) => {
    if (!page) return;
    
    const sectionMap = {
      'Intent': 'Intent',
      'Technographics': 'Technographics',
      'NTP': 'NTP®',
      'Buying Group': 'Buying Group',
      'Renewal Intelligence': 'Renewal Intelligence',
      'Summary': 'Summary'
    };

    const section = sectionMap[page.page] || 'Summary';
    setActiveSection(section);
  };

  useEffect(() => {
    if (onNavRef) {
      onNavRef(handleChatbotNavigation);
    }
  }, [onNavRef]);

  const getMenuItems = () => {
    return ['Home', 'Technographics', 'Renewal Intelligence', 'Intent', 'Buying Group', 'NTP®', 'Product Catalogue'];
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'Home':
        return <Home />;
      case 'Summary':
        return <MartechSummary />;
      case 'NTP':
      case 'NTP®':
        return <MartechNTP />;
      case 'Intent':
        return <Martechintent />;
      case 'Technographics':
        return <MartechTechnographics />;
      case 'Renewal Intelligence':
        return <RenewalIntelligence />;
      case 'Buying Group':
        return <MartechBuyingGroup />;
      case 'Product Catalogue':
        return <ProductCatalogue />;
      default:
        return <Home />;
    }
  };

  return (
    <IndustryProvider>
      <div className="dashboard">
        <Header username={username} onLogout={onLogout} />
        <div className="dashboard-content">
          <Menu
            activeSection={activeSection}
            onMenuClick={handleMenuClick}
            menuItems={getMenuItems()}
          />
          <main className={activeSection === 'Home' ? 'home-content' : 'main-content'}>
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </IndustryProvider>
  );
};

export default Dashboard;