import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCatalogue from './ProductCatalogue';
import DataDictionary from './DataDictionary';
import AnimatedStatCard from '../AnimatedStatCard';
import IntentPieChart from './IntentPieChart';
import RenewalDashboard from './RenewalDashboard';
import TechnographicsDashboard from './TechnographicsDashboard';
import NTPDashboard from './NTPDashboard';
import proplusDataLogo from '../../assets/Proplus Data Logo - Horizontal Transparent (1).png';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import '../../styles/home.css';

console.log('[Home] NTPDashboard imported:', NTPDashboard);

const YOUTUBE_VIDEO_ID = 'A3BCRSjS0C0';

const Home = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProductCatalogue, setShowProductCatalogue] = useState(false);
  const [showDataDictionary, setShowDataDictionary] = useState(false);
  const [activeView, setActiveView] = useState('summary');
  const [intentData, setIntentData] = useState([]);
  const [intentLoading, setIntentLoading] = useState(false);
  const dropdownRef = useRef(null);

  console.log('[Home] render, activeView=', activeView);

  const fetchIntentData = () => {
    setIntentLoading(true);
    const fakeStatusCounts = { High: 1240, 'High-Medium': 870, Medium: 2150, Low: 980, Greenfield: 560 };
    const total = Object.values(fakeStatusCounts).reduce((sum, c) => sum + c, 0);
    setIntentData(Object.entries(fakeStatusCounts).map(([name, value]) => ({
      name, value, percentage: ((value / total) * 100).toFixed(1)
    })));
    setIntentLoading(false);
  };

  const handleViewClick = (view) => {
    console.log('[Home] handleViewClick:', view);
    if (activeView === view) {
      setActiveView(null);
    } else {
      setActiveView(view);
      if (view === 'intent' && intentData.length === 0) {
        fetchIntentData();
      }
    }
  };

  useEffect(() => {
    setShowProductCatalogue(false);
    setShowDataDictionary(false);
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <img src={loadingGif} alt="Loading" />
      </div>
    );
  }

  return (
    <>
      <div className="home-container">
        <div className="home-header">
          <div>
            {!showProductCatalogue && !showDataDictionary && (
              <>
                <h1 className="home-title">Welcome to Nexora®</h1>
                <p className="home-subtitle">Your comprehensive B2B intelligence platform</p>
                <div className="home-quick-buttons">
                  <button className={`home-quick-btn home-quick-btn-summary${activeView === 'summary' ? ' active' : ''}`} onClick={() => handleViewClick('summary')}>Overall Summary</button>
                  <button className={`home-quick-btn home-quick-btn-technographics${activeView === 'technographics' ? ' active' : ''}`} onClick={() => handleViewClick('technographics')}>Technographics</button>
                  <button className={`home-quick-btn home-quick-btn-renewal${activeView === 'renewal' ? ' active' : ''}`} onClick={() => handleViewClick('renewal')}>Renewal Intelligence</button>
                  <button className={`home-quick-btn home-quick-btn-intent${activeView === 'intent' ? ' active' : ''}`} onClick={() => handleViewClick('intent')}>Intent</button>
                  <button className={`home-quick-btn home-quick-btn-ntp${activeView === 'ntp' ? ' active' : ''}`} onClick={() => handleViewClick('ntp')}>NTP®</button>
                </div>
              </>
            )}
          </div>
          <div className="home-header-dropdown" ref={dropdownRef}>
            <button className="home-dropdown-btn" onClick={() => setShowDropdown(!showDropdown)}>
              Resources <span className="home-dropdown-arrow">↓</span>
            </button>
            {showDropdown && (
              <div className="home-dropdown-menu">
                <button className="home-dropdown-item" onClick={() => { setShowProductCatalogue(true); setShowDataDictionary(false); setShowDropdown(false); }}>Product Catalogue</button>
                <button className="home-dropdown-item" onClick={() => { setShowDataDictionary(true); setShowProductCatalogue(false); setShowDropdown(false); }}>Data Dictionary</button>
              </div>
            )}
          </div>
        </div>

        {showProductCatalogue ? (
          <ProductCatalogue />
        ) : showDataDictionary ? (
          <DataDictionary />
        ) : (
          <>
            {activeView === 'summary' && (
              <>
                <div className="home-stats-grid">
                  <AnimatedStatCard number="600M+" label="Total Companies"      cardClass="home-stat-card-teal"   numberClass="home-stat-number-teal"   labelClass="home-stat-label-teal"   maxValue={100000} />
                  <AnimatedStatCard number="590M+" label="Technographics"       cardClass="home-stat-card-orange" numberClass="home-stat-number-orange" labelClass="home-stat-label-orange" maxValue={100000} />
                  <AnimatedStatCard number="530M+" label="Renewal Intelligence" cardClass="home-stat-card-pink"   numberClass="home-stat-number-pink"   labelClass="home-stat-label-pink"   maxValue={100000} />
                  <AnimatedStatCard number="530M+" label="Intent"               cardClass="home-stat-card-purple" numberClass="home-stat-number-purple" labelClass="home-stat-label-purple" maxValue={100000} />
                  <AnimatedStatCard number="430M+" label="Buying Group"         cardClass="home-stat-card-yellow" numberClass="home-stat-number-yellow" labelClass="home-stat-label-yellow" maxValue={100000} />
                  <AnimatedStatCard number="530M+" label="Next Tech Purchase®"  cardClass="home-stat-card-blue"   numberClass="home-stat-number-blue"   labelClass="home-stat-label-blue"   maxValue={100000} />
                </div>

                {/* Inline Video Player — always visible */}
                <div className="home-yt-row">
                  <div className="home-yt-tagline">
                    {/* <h2 className="home-yt-tagline-heading">See Nexora in action</h2> */}
                    <div className="home-yt-tagline-words">
                      <span>Identify</span>
                      <span>Prioritize</span>
                      <span>Convert</span>
                    </div>
                  </div>
                  <div className="home-yt-inline">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}`}
                      title="Quick Platform Insights"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </>
            )}

            {activeView === 'intent' && (
              <div className="home-intent-summary">
                {intentLoading
                  ? <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading intent data...</div>
                  : <IntentPieChart data={intentData} />}
              </div>
            )}

            {activeView === 'renewal' && (
              <div className="home-renewal-inline">
                <RenewalDashboard onClose={() => setActiveView(null)} inline />
              </div>
            )}

            {activeView === 'technographics' && (
              <div className="home-technographics-inline">
                <TechnographicsDashboard inline />
              </div>
            )}

            {activeView === 'ntp' && (
              <div className="home-ntp-inline">
                {console.log('[Home] rendering NTPDashboard')}
                <NTPDashboard />
              </div>
            )}
          </>
        )}
      </div>

      <div className="home-powered-by">
        <span>Powered by</span>
        <img src={proplusDataLogo} alt="ProPlus Data" style={{ height: '20px', marginLeft: '6px', objectFit: 'contain' }} />
      </div>
    </>
  );
};

export default Home;
