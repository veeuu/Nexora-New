import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCatalogue from './ProductCatalogue';
import DataDictionary from './DataDictionary';
import AnimatedStatCard from '../AnimatedStatCard';
import nexoraLogo from '../../assets/nexora-logo.png';
import proplusDataLogo from '../../assets/Proplus Data Logo - Horizontal Transparent (1).png';
import loadingGif from '../../assets/Data Loading GIF - Without Starhub.gif';
import '../../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Reset to welcome page when Home component mounts or when navigating back to home
  useEffect(() => {
    setShowProductCatalogue(false);
    setShowDataDictionary(false);
    setLoading(true);
    
    // Show loading gif for 1.5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
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
      {}
      <div className="home-header">
        <div>
          {/* {(showProductCatalogue || showDataDictionary) && (
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
          )} */}
          {!showProductCatalogue && !showDataDictionary && (
            <>
              <h1 className="home-title">
                Welcome to Nexora®
              </h1>
              <p className="home-subtitle">
                Your comprehensive B2B intelligence platform
              </p>
            </>
          )}
        </div>

        {}
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

      {}
      {showProductCatalogue ? (
        <ProductCatalogue />
      ) : showDataDictionary ? (
        <DataDictionary />
      ) : (
        <>
          {}
          <div className="home-stats-grid">
            <AnimatedStatCard
              number="600M+"
              label="Total Companies"
              cardClass="home-stat-card-teal"
              numberClass="home-stat-number-teal"
              labelClass="home-stat-label-teal"
              maxValue={100000}
            />

            <AnimatedStatCard
              number="590M+"
              label="Technographics"
              cardClass="home-stat-card-orange"
              numberClass="home-stat-number-orange"
              labelClass="home-stat-label-orange"
              maxValue={100000}
            />

            <AnimatedStatCard
              number="530M+"
              label="Renewal Intelligence"
              cardClass="home-stat-card-pink"
              numberClass="home-stat-number-pink"
              labelClass="home-stat-label-pink"
              maxValue={100000}
            />

            <AnimatedStatCard
              number="530M+"
              label="Intent"
              cardClass="home-stat-card-purple"
              numberClass="home-stat-number-purple"
              labelClass="home-stat-label-purple"
              maxValue={100000}
            />

            <AnimatedStatCard
              number="430M+"
              label="Buying Group"
              cardClass="home-stat-card-yellow"
              numberClass="home-stat-number-yellow"
              labelClass="home-stat-label-yellow"
              maxValue={100000}
            />

            <AnimatedStatCard
              number="530M+"
              label="Next Tech Purchase®"
              cardClass="home-stat-card-blue"
              numberClass="home-stat-number-blue"
              labelClass="home-stat-label-blue"
              maxValue={100000}
            />
          </div>

          {}
          <div className="home-quick-links-section">
            <h2 className="home-quick-links-title">
              Quick Demo
            </h2>
            <div className="home-quick-links-grid">
              {[
                { name: 'Technographics', desc: 'View company technology stack', route: '/dashboard/technographics' },
                { name: 'Renewal Intelligence', desc: 'Track renewal timelines', route: '/dashboard/renewal-intelligence' },
                { name: 'Intent', desc: 'Monitor buying intent signals', route: '/dashboard/intent' },
                { name: 'Next Tech Purchase®', desc: 'Analyzend  purchase propensity', route: '/dashboard/ntp' },
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

    {/* Powered by ProPlus Data */}
    <div className="home-powered-by">
      <span>Powered by</span>
      <img 
        src={proplusDataLogo} 
        alt="ProPlus Data" 
        style={{
          height: '20px',
          marginLeft: '6px',
          objectFit: 'contain'
        }}
      />
    </div>
    </>
  );
};

export default Home;
