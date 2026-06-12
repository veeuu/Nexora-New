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
import { syncCreditsFromServer } from '../utils/credits';
import { syncRevealedFromServer } from '../utils/revealed';

const Dashboard = ({ onLogout, onNavRef, username, displayName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('Home');
  const [homeResetTrigger, setHomeResetTrigger] = useState(0);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [creditPopup, setCreditPopup] = useState(null); // { section, label } or { section: 'total' }

  // Listen for credit exhausted events from deductCredit
  useEffect(() => {
    const handler = (e) => setCreditPopup(e.detail);
    window.addEventListener('creditExhausted', handler);
    return () => window.removeEventListener('creditExhausted', handler);
  }, []);

const routeToSection = {
    '/dashboard': 'Home',
    '/dashboard/home': 'Home',
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
      'Product Catalogue': '/dashboard/product-catalogue',
      'Data Dictionary': '/dashboard/data-dictionary',
      'Keywords Surge': '/dashboard/keywords',
      'Contact Us': '/dashboard/contact-us'
    };

    const route = sectionToRoute[section] || '/dashboard/home';
    navigate(route);
    
    // Trigger reset for Home component when Home is clicked
    if (section === 'Home') {
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

    const section = sectionMap[page.page] || 'Home';
    handleMenuClick(section);
  };

  useEffect(() => {
    if (onNavRef) {
      onNavRef(handleChatbotNavigation);
    }
  }, [onNavRef]);

  // Sync credits from server on mount
  useEffect(() => {
    syncCreditsFromServer();
    syncRevealedFromServer();
  }, []);

  const getMenuItems = () => {
    return ['Home', 'Technographics', 'Renewal Intelligence', 'Intent', 'Buying Group', 'Next Tech Purchase®', 'Keywords Surge'];
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'Home':
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

        {/* Credit Exhausted Popup */}
        {creditPopup && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
            zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(2px)'
          }} onClick={() => setCreditPopup(null)}>
            <div style={{
              background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden',
              position: 'relative'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />
              <div style={{ padding: '32px 28px 28px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: '#fef2f2', border: '2px solid #fecaca',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px', fontSize: '22px'
                }}>🔒</div>
                <h3 style={{ textAlign: 'center', fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px' }}>
                  {creditPopup.section === 'total' ? 'All Credits Exhausted' : creditPopup.partial ? 'Partial Reveal — Credits Exhausted' : 'Section Credits Exhausted'}
                </h3>
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px' }}>
                  {creditPopup.section === 'total'
                    ? 'You have used all 100 credits. Upgrade your plan to continue revealing data.'
                    : creditPopup.partial
                      ? <>{creditPopup.revealed > 0 ? <><strong>{creditPopup.revealed}</strong> {creditPopup.revealed === 1 ? 'company was' : 'companies were'} revealed. </> : ''}The remaining <strong>{creditPopup.blocked}</strong> could not be revealed you've hit the 50-credit limit for <strong>{creditPopup.label}</strong>. Upgrade to unlock more.</>
                      : <>You have used all <strong>20 credits</strong> for <strong>{creditPopup.label}</strong>. Upgrade your plan to unlock more.</>
                  }
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setCreditPopup(null)}
                    style={{
                      flex: 1, padding: '10px', background: '#f8fafc', color: '#475569',
                      border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px',
                      fontWeight: '500', cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setCreditPopup(null);
                      window.location.href = 'mailto:sales@proplusdata.co?subject=Upgrade%20Plan%20Request';
                    }}
                    style={{
                      flex: 1, padding: '10px',
                      background: 'linear-gradient(135deg, #ef4444, #f97316)',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </IndustryProvider>
  );
};

export default Dashboard;

