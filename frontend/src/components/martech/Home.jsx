import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCatalogue from './ProductCatalogue';
import DataDictionary from './DataDictionary';
import nexoraLogo from '../../assets/nexora-logo.png';
import '../../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalTechnologies: 0,
    totalProducts: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProductCatalogue, setShowProductCatalogue] = useState(false);
  const [showDataDictionary, setShowDataDictionary] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch aggregated stats from single optimized endpoint
        const response = await fetch('/api/dashboard-stats');
        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '600px',
        backgroundColor: '#ffffffff',
        borderRadius: '8px',
        padding: '40px 20px'
      }}>
        <img 
          src={nexoraLogo} 
          alt="Nexora" 
          style={{
            width: '250px',
            height: 'auto',
            marginBottom: '30px',
            opacity: 0.9,
            animation: 'pulse 2s infinite'
          }}
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          width: '100%',
          maxWidth: '1000px',
          marginTop: '40px'
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: '120px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              animation: 'pulse 2s infinite'
            }} />
          ))}
        </div>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center',
          marginTop: '30px'
        }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <div>
          {(showProductCatalogue || showDataDictionary) && (
            <button 
              className="home-back-btn"
              onClick={() => {
                setShowProductCatalogue(false);
                setShowDataDictionary(false);
              }}
              title="Back to Home"
            >
              ← Back
            </button>
          )}
          {!showProductCatalogue && !showDataDictionary && (
            <>
              <h1 className="home-title">
                Welcome to Nexora
              </h1>
              <p className="home-subtitle">
                Your comprehensive B2B intelligence platform
              </p>
            </>
          )}
        </div>
        
        {/* Dropdown in top right */}
        <div className="home-header-dropdown" ref={dropdownRef}>
          <button 
            className="home-dropdown-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Resources <span className="home-dropdown-arrow">↓</span>
          </button>
          {showDropdown && (
            <div className="home-dropdown-menu">
              <button 
                className="home-dropdown-item"
                onClick={() => {
                  setShowProductCatalogue(true);
                  setShowDataDictionary(false);
                  setShowDropdown(false);
                }}
              >
                Product Catalogue
              </button>
              <button 
                className="home-dropdown-item"
                onClick={() => {
                  setShowDataDictionary(true);
                  setShowProductCatalogue(false);
                  setShowDropdown(false);
                }}
              >
                Data Dictionary
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Show Product Catalogue, Data Dictionary or Home Content */}
      {showProductCatalogue ? (
        <ProductCatalogue />
      ) : showDataDictionary ? (
        <DataDictionary />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="home-stats-grid">
            {/* Total Companies Card */}
            <div className="home-stat-card home-stat-card-teal">
              <div className="home-stat-number home-stat-number-teal">
                100K+
              </div>
              <div className="home-stat-label home-stat-label-teal">
                Total Companies
              </div>
              <p className="home-stat-description home-stat-description-teal">
                In our database
              </p>
            </div>

            {/* Technographics Card */}
            <div className="home-stat-card home-stat-card-orange">
              <div className="home-stat-number home-stat-number-orange">
                45K+
              </div>
              <div className="home-stat-label home-stat-label-orange">
                Technographics
              </div>
              <p className="home-stat-description home-stat-description-orange">
                Technology records
              </p>
            </div>

            {/* Renewal Intelligence Card */}
            <div className="home-stat-card home-stat-card-pink">
              <div className="home-stat-number home-stat-number-pink">
                20K+
              </div>
              <div className="home-stat-label home-stat-label-pink">
                Renewal Intelligence
              </div>
              <p className="home-stat-description home-stat-description-pink">
                Renewal records
              </p>
            </div>

            {/* Intent Card */}
            <div className="home-stat-card home-stat-card-purple">
              <div className="home-stat-number home-stat-number-purple">
                20K+
              </div>
              <div className="home-stat-label home-stat-label-purple">
                Intent
              </div>
              <p className="home-stat-description home-stat-description-purple">
                Intent signals tracked
              </p>
            </div>

            {/* Buying Group Card */}
            <div className="home-stat-card home-stat-card-yellow">
              <div className="home-stat-number home-stat-number-yellow">
                20K+
              </div>
              <div className="home-stat-label home-stat-label-yellow">
                Buying Group
              </div>
              <p className="home-stat-description home-stat-description-yellow">
                Companies tracked
              </p>
            </div>

            {/* NTP Card */}
            <div className="home-stat-card home-stat-card-blue">
              <div className="home-stat-number home-stat-number-blue">
                22K+
              </div>
              <div className="home-stat-label home-stat-label-blue">
                NTP
              </div>
              <p className="home-stat-description home-stat-description-blue">
                Purchase propensity scores
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="home-quick-links-section">
            <h2 className="home-quick-links-title">
              Quick Links
            </h2>
            <div className="home-quick-links-grid">
              {[
                { name: 'Technographics', desc: 'View company technology stack', route: '/dashboard/technographics' },
                { name: 'Renewal Intelligence', desc: 'Track renewal timelines', route: '/dashboard/renewal-intelligence' },
                { name: 'Intent', desc: 'Monitor buying intent signals', route: '/dashboard/intent' },
                { name: 'NTP®', desc: 'Analyze purchase propensity', route: '/dashboard/ntp' },
                { name: 'Buying Group', desc: 'Identify decision makers', route: '/dashboard/buying-group' }
              ].map((link, idx) => (
                <div 
                  key={idx} 
                  className="home-quick-link-card"
                  onClick={() => navigate(link.route)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="home-quick-link-name">
                    {link.name}
                  </div>
                  <div className="home-quick-link-description">
                    {link.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default Home;
