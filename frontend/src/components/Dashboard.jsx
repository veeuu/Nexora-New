import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { IndustryProvider } from '../context/IndustryContext';
import Menu from './Menu';
import ProfilePanel from './ProfilePanel';
import Home from './martech/Home';
import MartechNTP from './martech/NTP';
import Martechintent from './martech/Intent';
import MartechTechnographics from './martech/Technographics';
import RenewalIntelligence from './martech/RenewalIntelligence';
import MartechBuyingGroup from './martech/BuyingGroup';
import ProductCatalogue from './martech/ProductCatalogue';
import DataDictionary from './martech/DataDictionary';
import Keywords from './martech/Keywords';
import ContactUs from './ContactUs';

const Dashboard = ({ onLogout, onNavRef, username, displayName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('Insights');
  const [homeResetTrigger, setHomeResetTrigger] = useState(0);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

const routeToSection = {
    '/dashboard': 'Insights',
    '/dashboard/home': 'Insights',
    '/dashboard/technographics': 'Technographics',
    '/dashboard/renewal-intelligence': 'Renewal Intelligence',
    '/dashboard/intent': 'Intent',
    '/dashboard/buying-group': 'Buying Group',
    '/dashboard/ntp': 'Next Tech Purchase®',
    '/dashboard/product-catalogue': 'Product Catalogue',
    '/dashboard/data-dictionary': 'Data Dictionary',
    '/dashboard/keywords': 'Keywords Surge',
    '/dashboard/contact-us': 'Contact Us'
  };

useEffect(() => {
    const currentPath = location.pathname;
    const section = routeToSection[currentPath] || 'Insights';
    setActiveSection(section);
  }, [location.pathname]);

  const handleMenuClick = (section) => {
    setActiveSection(section);

    const sectionToRoute = {
      'Insights': '/dashboard/home',
      'Technographics': '/dashboard/technographics',
      'Renewal Intelligence': '/dashboard/renewal-intelligence',
      'Intent': '/dashboard/intent',
      'Buying Group': '/dashboard/buying-group',
      'Next Tech Purchase®': '/dashboard/ntp',
      'Product Catalogue': '/dashboard/product-catalogue',
      'Data Dictionary': '/dashboard/data-dictionary',
      'Keywords Surge': '/dashboard/keywords',
      'Contact Us': '/dashboard/contact-us'
    };

    const route = sectionToRoute[section] || '/dashboard/home';
    navigate(route);
    
    // Trigger reset for Home component when Insights is clicked
    if (section === 'Insights') {
      setHomeResetTrigger(prev => prev + 1);
    }
  };

  const handleChatbotNavigation = (page) => {
    if (!page) return;

    const sectionMap = {
      'Intent': 'Intent',
      'Technographics': 'Technographics',
      'NTP': 'Next Tech Purchase®',
      'Buying Group': 'Buying Group',
      'Renewal Intelligence': 'Renewal Intelligence'
    };

    const section = sectionMap[page.page] || 'Insights';
    handleMenuClick(section);
  };

  useEffect(() => {
    if (onNavRef) {
      onNavRef(handleChatbotNavigation);
    }
  }, [onNavRef]);

  const getMenuItems = () => {
    return ['Insights', 'Technographics', 'Renewal Intelligence', 'Intent', 'Buying Group', 'Next Tech Purchase®', 'Keywords Surge'];
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'Insights':
        return <Home displayName={displayName} />;
      case 'NTP':
      case 'Next Tech Purchase®':
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
      case 'Keywords Surge':
        return <Keywords />;
      case 'Contact Us':
        return <ContactUs username={username} />;
      default:
        return <Home displayName={displayName} />;
    }
  };

  return (
    <IndustryProvider>
      <div className="dashboard">
        <div className="dashboard-content">
          <Menu
            activeSection={activeSection}
            onMenuClick={handleMenuClick}
            menuItems={getMenuItems()}
            username={username}
            onLogout={onLogout}
            onProfileClick={() => setProfilePanelOpen(true)}
          />
          <main className={activeSection === 'Home' ? 'home-content' : 'main-content'}>
            <Routes>
              <Route path="/home" element={<Home key={homeResetTrigger} displayName={displayName} />} />
              <Route path="/technographics" element={<MartechTechnographics />} />
              <Route path="/renewal-intelligence" element={<RenewalIntelligence />} />
              <Route path="/intent" element={<Martechintent />} />
              <Route path="/buying-group" element={<MartechBuyingGroup />} />
              <Route path="/ntp" element={<MartechNTP />} />
              <Route path="/product-catalogue" element={<ProductCatalogue />} />
              <Route path="/data-dictionary" element={<DataDictionary />} />
              <Route path="/keywords" element={<Keywords />} />
              <Route path="/contact-us" element={<ContactUs username={username} />} />
              <Route path="/" element={<Home key={homeResetTrigger} displayName={displayName} />} />
            </Routes>
          </main>
        </div>
        <ProfilePanel
          isOpen={profilePanelOpen}
          onClose={() => setProfilePanelOpen(false)}
          username={username}
          onLogout={onLogout}
        />
      </div>
    </IndustryProvider>
  );
};

export default Dashboard;