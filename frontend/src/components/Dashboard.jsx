import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { IndustryProvider } from '../context/IndustryContext';
import { CreditsProvider } from '../context/CreditsContext';
import Menu from './Menu';
import Home from './martech/Home';
import MartechSummary from './martech/Summary';
import MartechNTP from './martech/NTP';
import Martechintent from './martech/Intent';
import MartechTechnographics from './martech/Technographics';
import RenewalIntelligence from './martech/RenewalIntelligence';
import MartechBuyingGroup from './martech/BuyingGroup';
import ProductCatalogue from './martech/ProductCatalogue';

const Dashboard = ({ onLogout, onNavRef, username, userId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('Home');

const routeToSection = {
    '/dashboard': 'Home',
    '/dashboard/home': 'Home',
    '/dashboard/technographics': 'Technographics',
    '/dashboard/renewal-intelligence': 'Renewal Intelligence',
    '/dashboard/intent': 'Intent',
    '/dashboard/buying-group': 'Buying Group',
    '/dashboard/ntp': 'Next Tech Purchase®',
    '/dashboard/product-catalogue': 'Product Catalogue'
  };

useEffect(() => {
    const currentPath = location.pathname;
    const section = routeToSection[currentPath] || 'Home';
    setActiveSection(section);
  }, [location.pathname]);

  const handleMenuClick = (section) => {
    setActiveSection(section);

const sectionToRoute = {
      'Home': '/dashboard/home',
      'Technographics': '/dashboard/technographics',
      'Renewal Intelligence': '/dashboard/renewal-intelligence',
      'Intent': '/dashboard/intent',
      'Buying Group': '/dashboard/buying-group',
      'Next Tech Purchase®': '/dashboard/ntp',
      'Product Catalogue': '/dashboard/product-catalogue'
    };

    const route = sectionToRoute[section] || '/dashboard/home';
    navigate(route);
  };

  const handleChatbotNavigation = (page) => {
    if (!page) return;

    const sectionMap = {
      'Intent': 'Intent',
      'Technographics': 'Technographics',
      'NTP': 'Next Tech Purchase®',
      'Buying Group': 'Buying Group',
      'Renewal Intelligence': 'Renewal Intelligence',
      'Summary': 'Summary'
    };

    const section = sectionMap[page.page] || 'Summary';
    handleMenuClick(section);
  };

  useEffect(() => {
    if (onNavRef) {
      onNavRef(handleChatbotNavigation);
    }
  }, [onNavRef]);

  const getMenuItems = () => {
    return ['Home', 'Technographics', 'Renewal Intelligence', 'Intent', 'Buying Group', 'Next Tech Purchase®'];
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'Home':
        return <Home />;
      case 'Summary':
        return <MartechSummary />;
      case 'NTP':
      case 'Next Tech Purchase®':
        return <MartechNTP />;
      case 'Intent':
        return <Martechintent />;
      case 'Technographics':
        return <MartechTechnographics userId={userId} />;
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
      <CreditsProvider>
        <div className="dashboard">
        <div className="dashboard-content">
          <Menu
            activeSection={activeSection}
            onMenuClick={handleMenuClick}
            menuItems={getMenuItems()}
            username={username}
            userId={userId}
            onLogout={onLogout}
          />
          <main className={activeSection === 'Home' ? 'home-content' : 'main-content'}>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/technographics" element={<MartechTechnographics userId={userId} />} />
              <Route path="/renewal-intelligence" element={<RenewalIntelligence />} />
              <Route path="/intent" element={<Martechintent />} />
              <Route path="/buying-group" element={<MartechBuyingGroup />} />
              <Route path="/ntp" element={<MartechNTP />} />
              <Route path="/product-catalogue" element={<ProductCatalogue />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
        </div>
      </div>
      </CreditsProvider>
    </IndustryProvider>
  );
};

export default Dashboard;