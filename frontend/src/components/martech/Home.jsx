import { useState, useEffect } from 'react';
import nexoraLogo from '../../assets/nexora-logo.png';
import '../../styles/home.css';

const Home = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalTechnologies: 0,
    totalProducts: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch data from all endpoints to calculate stats
        const [techResponse, ntpResponse, renewalResponse, productResponse] = await Promise.all([
          fetch('/api/technographics'),
          fetch('/api/ntp'),
          fetch('/api/renewal-intelligence'),
          fetch('/api/product-catalogue')
        ]);

        const techData = await techResponse.json();
        const ntpData = await ntpResponse.json();
        const renewalData = await renewalResponse.json();
        const productData = await productResponse.json();

        // Calculate unique companies
        const uniqueCompanies = new Set();
        techData.forEach(item => uniqueCompanies.add(item.companyName));
        ntpData.forEach(item => uniqueCompanies.add(item.companyName));
        renewalData.forEach(item => uniqueCompanies.add(item.companyName));

        // Calculate unique technologies
        const uniqueTechs = new Set();
        techData.forEach(item => uniqueTechs.add(item.technology));
        ntpData.forEach(item => uniqueTechs.add(item.technology));

        // Calculate unique products
        const uniqueProducts = new Set();
        productData.forEach(item => {
          const prodName = item.prodName || item['Product Name'] || item.product || '';
          if (prodName) uniqueProducts.add(prodName);
        });

        // Calculate unique categories
        const uniqueCategories = new Set();
        productData.forEach(item => {
          const category = item.category || item.Category || 'Other';
          uniqueCategories.add(category);
        });

        setStats({
          totalCompanies: uniqueCompanies.size,
          totalTechnologies: uniqueTechs.size,
          totalProducts: uniqueProducts.size,
          totalCategories: uniqueCategories.size
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
            opacity: 0.9
          }}
        />
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <h1 className="home-title">
          Welcome to Nexora
        </h1>
        <p className="home-subtitle">
          Your comprehensive B2B intelligence platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="home-stats-grid">
        {/* Companies Card */}
        <div className="home-stat-card home-stat-card-blue">
          <div className="home-stat-number home-stat-number-blue">
            {stats.totalCompanies}
          </div>
          <div className="home-stat-label home-stat-label-blue">
            Total Companies
          </div>
          <p className="home-stat-description home-stat-description-blue">
            Across all data sources
          </p>
        </div>

        {/* Technologies Card */}
        <div className="home-stat-card home-stat-card-green">
          <div className="home-stat-number home-stat-number-green">
            {stats.totalTechnologies}
          </div>
          <div className="home-stat-label home-stat-label-green">
            Total Technologies
          </div>
          <p className="home-stat-description home-stat-description-green">
            Tracked and monitored
          </p>
        </div>

        {/* Products Card */}
        <div className="home-stat-card home-stat-card-yellow">
          <div className="home-stat-number home-stat-number-yellow">
            {stats.totalProducts}
          </div>
          <div className="home-stat-label home-stat-label-yellow">
            Total Products
          </div>
          <p className="home-stat-description home-stat-description-yellow">
            In our catalogue
          </p>
        </div>

        {/* Categories Card */}
        <div className="home-stat-card home-stat-card-pink">
          <div className="home-stat-number home-stat-number-pink">
            {stats.totalCategories}
          </div>
          <div className="home-stat-label home-stat-label-pink">
            Product Categories
          </div>
          <p className="home-stat-description home-stat-description-pink">
            Organized and indexed
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
            { name: 'Technographics', desc: 'View company technology stack' },
            { name: 'Renewal Intelligence', desc: 'Track renewal timelines' },
            { name: 'Intent', desc: 'Monitor buying intent signals' },
            { name: 'NTP®', desc: 'Analyze purchase propensity' },
            { name: 'Buying Group', desc: 'Identify decision makers' },
            { name: 'Product Catalogue', desc: 'Browse product database' }
          ].map((link, idx) => (
            <div key={idx} className="home-quick-link-card">
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
    </div>
  );
};

export default Home;
