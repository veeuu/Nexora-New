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
import svg1 from '../../video/1.svg';
import svg2 from '../../video/2.svg';
import svg3 from '../../video/3.svg';
import svg4 from '../../video/4.svg';
import svg5 from '../../video/5.svg';
import '../../styles/home.css';

const SLIDES = [svg1, svg2, svg3, svg4, svg5];

const SvgCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(() => Array(SLIDES.length).fill(false));
  const intervalRef = useRef(null);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
    }, 5000);
  };

  // Preload all slides immediately
  useEffect(() => {
    SLIDES.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => setLoaded(prev => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
    });
  }, []);

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleDotClick = (i) => {
    setCurrent(i);
    startInterval(); // reset timer so it doesn't jump immediately
  };

  return (
    <div className="home-svg-carousel">
      <div className="home-svg-carousel-inner">
        {SLIDES.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`slide-${i + 1}`}
            className={`home-svg-slide ${i === current ? 'home-svg-slide-active' : 'home-svg-slide-hidden'}`}
          />
        ))}
      </div>
      <div className="home-svg-dots">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`home-svg-dot${i === current ? ' home-svg-dot-active' : ''}`}
            onClick={() => handleDotClick(i)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </div>
  );
};

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
    const fakeStatusCounts = { High: 113000000, 'High-Medium': 79000000, Medium: 196000000, Low: 89000000, Greenfield: 51000000 };
    const total = Object.values(fakeStatusCounts).reduce((sum, c) => sum + c, 0);
    setIntentData(Object.entries(fakeStatusCounts).map(([name, value]) => ({
      name, value, percentage: ((value / total) * 100).toFixed(1)
    })));
    setIntentLoading(false);
  };

  const handleViewClick = (view) => {
    console.log('[Home] handleViewClick:', view);
    if (activeView === view) return; // already active, do nothing
    setActiveView(view);
    if (view === 'intent' && intentData.length === 0) {
      fetchIntentData();
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
                <p className="home-subtitle"></p>
                <div className="home-quick-buttons">
                  <button className={`home-quick-btn home-quick-btn-summary${activeView === 'summary' ? ' active' : ''}`} onClick={() => handleViewClick('summary')}> Summary</button>
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

                <SvgCarousel />
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
