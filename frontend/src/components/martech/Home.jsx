import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiFetch from '../../utils/apiFetch';
import AnimatedStatCard from '../AnimatedStatCard';
import IntentPieChart from './IntentPieChart';
import RenewalDashboard from './RenewalDashboard';
import TechnographicsDashboard from './TechnographicsDashboard';
import NTPDashboard from './NTPDashboard';
import BuyingGroupDashboard from './BuyingGroupDashboard';
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

const Home = ({ displayName }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('summary');
  const [intentData, setIntentData] = useState([]);
  const [intentLoading, setIntentLoading] = useState(false);
  const [showOnDemand, setShowOnDemand] = useState(false);
  const [onDemandQuery, setOnDemandQuery] = useState('');
  const [onDemandSubmitting, setOnDemandSubmitting] = useState(false);
  const [onDemandSubmitted, setOnDemandSubmitted] = useState(false);
  const dropdownRef = useRef(null);

  console.log('[Home] render, activeView=', activeView);

  const handleOnDemandSubmit = async (e) => {
    e.preventDefault();
    setOnDemandSubmitting(true);
    try {
      await apiFetch('/api/on-demand-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedName: onDemandQuery, filterType: 'General', searchValue: onDemandQuery, sourcePage: 'Home' })
      });
    } catch (_) {}
    try {
      const existing = JSON.parse(localStorage.getItem('onDemandHistory') || '[]');
      const entry = {
        id: Date.now(),
        query: onDemandQuery,
        filterType: 'General',
        section: 'Home',
        status: 'Pending',
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };
      localStorage.setItem('onDemandHistory', JSON.stringify([entry, ...existing].slice(0, 50)));
    } catch (_) {}
    setOnDemandSubmitting(false);
    setOnDemandSubmitted(true);
  };

  const handleOnDemandClose = () => {
    setShowOnDemand(false);
    setOnDemandQuery('');
    setOnDemandSubmitted(false);
  };

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
    if (activeView === view) {
      setActiveView('summary'); // clicking active tab returns to summary
      return;
    }
    setActiveView(view);
    if (view === 'intent' && intentData.length === 0) {
      fetchIntentData();
    }
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#fff', padding: '40px 20px' }}>
        {/* Blurred skeleton background */}
        <div style={{ position: 'absolute', inset: 0, padding: '40px 20px', filter: 'blur(4px)', opacity: 0.6, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ height: '36px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '12px', width: '280px' }} />
          <div style={{ height: '16px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '24px', width: '200px' }} />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ height: '36px', background: '#f3f4f6', borderRadius: '8px', width: '140px' }} />)}
          </div>
          <div style={{ height: '1px', background: '#e5e7eb', marginBottom: '28px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '28px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '100px', background: '#f3f4f6', borderRadius: '12px' }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '180px', background: '#f3f4f6', borderRadius: '12px' }} />)}
          </div>
        </div>
        {/* Centered loading gif */}
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <img src={loadingGif} alt="Loading" style={{ width: '600px', height: '600px', objectFit: 'contain' }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="home-container">
        <div className="home-header">
          <div>
            <>
              <h1 className="home-title" style={{ color: '#6b7280' }}>
                Welcome, {(displayName || localStorage.getItem('displayName') || 'Nexora').split(' ')[0]} !
              </h1>
              <p className="home-subtitle"></p>
              <div className="home-quick-buttons">
                <button className={`home-quick-btn home-quick-btn-technographics${activeView === 'technographics' ? ' active' : ''}`} onClick={() => handleViewClick('technographics')}>Technographics</button>
                <button className={`home-quick-btn home-quick-btn-renewal${activeView === 'renewal' ? ' active' : ''}`} onClick={() => handleViewClick('renewal')}>Renewal Intelligence</button>
                <button className={`home-quick-btn home-quick-btn-intent${activeView === 'intent' ? ' active' : ''}`} onClick={() => handleViewClick('intent')}>Intent</button>
                <button className={`home-quick-btn home-quick-btn-buyinggroup${activeView === 'buyinggroup' ? ' active' : ''}`} onClick={() => handleViewClick('buyinggroup')}>Buying Group</button>
                <button className={`home-quick-btn home-quick-btn-ntp${activeView === 'ntp' ? ' active' : ''}`} onClick={() => handleViewClick('ntp')}>NTP®</button>
              </div>
            </>
          </div>
          <div className="home-ondemand-wrapper" style={{ flexShrink: 0, alignSelf: 'flex-end', marginBottom: '0' }}>
            <button
              className="home-quick-btn home-ondemand-btn"
              onClick={() => setShowOnDemand(true)}
            >
              Request on Demand
            </button>
            <div className="home-ondemand-tooltip">
              Submit an on-demand request and our team will get back to you within 48 hours.
            </div>
          </div>
        </div>

        <>
          {activeView === 'summary' && (
              <>
                <div className="home-stats-grid">
                  <AnimatedStatCard number="600M+" label="Accounts"      cardClass="home-stat-card-teal"   numberClass="home-stat-number-teal"   labelClass="home-stat-label-teal"   maxValue={100000} />
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

            {activeView === 'buyinggroup' && (
              <div className="home-buyinggroup-inline">
                <BuyingGroupDashboard inline />
              </div>
            )}
          </>
      </div>

      {/* <div className="home-powered-by">
        <span>Powered by</span>
        <img src={proplusDataLogo} alt="ProPlus Data" style={{ height: '20px', marginLeft: '6px', objectFit: 'contain' }} />
      </div> */}

      {/* On Demand Modal */}
      {showOnDemand && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}
          onClick={handleOnDemandClose}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #0891b2)' }} />
            <div style={{ padding: '32px 28px 28px' }}>
              {onDemandSubmitted ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>Request Submitted</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: '1.6' }}>We'll get back to you within <strong>48 hours</strong>.</p>
                  <button onClick={handleOnDemandClose} style={{ padding: '9px 28px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleOnDemandSubmit}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#3b82f6"/></svg>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>Request Data on Demand</h3>
                  </div>
                  <p style={{ margin: '0 0 22px', fontSize: '13px', color: '#64748b', lineHeight: '1.6', paddingLeft: '52px' }}>
                    Enter the company name or domain and our team will reach out within 48 hours.
                  </p>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Company Name or Domain</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. acmecorp.com"
                      value={onDemandQuery}
                      onChange={e => setOnDemandQuery(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', color: '#0f172a', transition: 'border-color 0.15s' }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={handleOnDemandClose} style={{ flex: 1, padding: '10px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={onDemandSubmitting} style={{ flex: 1, padding: '10px', background: onDemandSubmitting ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #0891b2)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: onDemandSubmitting ? 'not-allowed' : 'pointer' }}>
                      {onDemandSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
