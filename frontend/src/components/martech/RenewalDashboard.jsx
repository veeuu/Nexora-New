import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/renewalDashboard.css';
import { getLogoPath } from '../../utils/logoMap';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
};

// KPI Card Component
const KPICard = ({ icon, title, value, accentColor }) => {
  return (
    <div className="renewal-kpi-card" style={{ borderTopColor: accentColor }}>
      {icon && (
        <div className="renewal-kpi-icon" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
          {icon}
        </div>
      )}
      <div className="renewal-kpi-content">
        <h3 className="renewal-kpi-title">{title}</h3>
        <div className="renewal-kpi-value">
          {value}
        </div>
      </div>
    </div>
  );
};

// Renewal Timeline Bar Chart - Redesigned
const RenewalTimelineChart = ({ data, mode = 'quarter' }) => {
  // Fixed range of 200
  const range = 200;
  const increment = 20;
  
  const axisLabels = [];
  for (let i = 0; i <= range; i += increment) {
    axisLabels.push(i);
  }
  
  return (
    <div className="renewal-chart-container">
      <div className="renewal-chart-header">
        <div className="renewal-chart-header-left">
          <h3>Renewal Timeline Distribution</h3>
          <p>Opportunities by {mode === 'quarter' ? 'quarter' : 'month'} · 2026-2029</p>
        </div>
        <div className="renewal-timeline-legend">
          <div className="renewal-timeline-legend-item">
            <div className="renewal-timeline-legend-color renewal-timeline-renewals-color"></div>
            <span>Renewals</span>
          </div>
        </div>
      </div>
      <div className="renewal-timeline-wrapper">
        <div className="renewal-timeline-axis">
          {axisLabels.reverse().map((label, idx) => (
            <div key={idx} className="renewal-timeline-axis-label">{label}</div>
          ))}
        </div>
        <div className="renewal-timeline-bars">
          {data.map((item, idx) => (
            <div key={idx} className="renewal-timeline-bar-group">
              <div className="renewal-timeline-bar-container">
                <div className="renewal-timeline-bar-stack">
                  <div
                    className="renewal-timeline-bar renewal-timeline-renewals"
                    style={{
                      height: `${(item.renewals / range) * 100}%`,
                      animation: `renewal-slideUp 0.6s ease-out ${idx * 0.05}s both`
                    }}
                    title={`Renewals: ${item.renewals}`}
                  >
                    {item.renewals > 5 && <span className="renewal-timeline-bar-value">{item.renewals}</span>}
                  </div>
                </div>
              </div>
              <div className="renewal-timeline-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Product Breakdown Donut Chart
const ProductBreakdownChart = ({ data, isDarkMode = true }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const slices = data.map((item, idx) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { path, color: item.color, percentage: ((item.value / total) * 100).toFixed(1) };
  });

  return (
    <div className="renewal-chart-container">
      <div className="renewal-chart-header">
        <h3>Product Breakdown</h3>
        {/* <p>Share of renewals by product</p> */}
      </div>
      <div className="renewal-donut-chart-wrapper">
        <svg viewBox="0 0 200 200" className="renewal-donut-chart">
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.path}
              fill={slice.color}
              style={{ animation: `renewal-fadeIn 0.6s ease-out ${idx * 0.1}s both` }}
            />
          ))}
          <circle cx="100" cy="100" r="50" fill={isDarkMode ? "#0f172a" : "#ffffff"} />
          <text x="100" y="100" textAnchor="middle" dy="0.3em" className="renewal-donut-center-text">
            {formatM(total)}
          </text>
          <text x="100" y="115" textAnchor="middle" className="renewal-donut-center-label">
            renewals
          </text>
        </svg>
        <div className="renewal-donut-legend">
          {data.map((item, idx) => (
            <div key={idx} className="renewal-legend-item-donut">
              <div className="renewal-legend-color" style={{ backgroundColor: item.color }}></div>
              <div className="renewal-legend-text">
                <span className="renewal-legend-product">{item.name}</span>
                <span className="renewal-legend-stats">{item.percentage}% · {formatM(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Urgency Funnel Chart
const formatM = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v;

const UrgencyFunnelChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="renewal-chart-container">
      <div className="renewal-chart-header">
        <h3>Priority Funnel</h3>
        <p></p>
        <div className="renewal-active-indicator">● Active</div>
      </div>
      <div className="renewal-funnel-chart">
        {data.map((item, idx) => (
          <div key={idx} className="renewal-funnel-item">
            <div className="renewal-funnel-label">{item.label}</div>
            <div className="renewal-funnel-track">
              <div
                className="renewal-funnel-bar"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                  animation: `renewal-slideInLeft 0.6s ease-out ${idx * 0.1}s both`
                }}
              >
                <span className="renewal-funnel-value">{formatM(item.value)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Product Companies Modal
const ProductModal = ({ product, companies, logo, onClose }) => (
  <div className="renewal-product-modal-overlay" onClick={onClose}>
    <div className="renewal-product-modal" onClick={e => e.stopPropagation()}>
      <div className="renewal-product-modal-header">
        {logo && <img src={logo} alt={product} className="renewal-product-modal-logo" />}
        <div>
          <div className="renewal-product-modal-title">{product}</div>
          <div className="renewal-product-modal-sub">{companies.length} companies renewing</div>
        </div>
        <button className="renewal-product-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="renewal-product-modal-list">
        {companies.map((c, i) => (
          <div key={i} className="renewal-product-modal-row">
            <span className="renewal-product-modal-idx">{i + 1}</span>
            <span className="renewal-product-modal-company">{c.company}</span>
            <span className="renewal-product-modal-quarter">{c.quarter}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// All tracker items (full list, not paginated)  used for modal lookup
const ALL_TRACKER_ITEMS = [
  { product: 'Amazon Aurora', company: 'DBS Bank',      quarter: 'Q2 2026' },
  { product: 'ChatGPT',       company: 'Accenture',     quarter: 'Q3 2026' },
  { product: 'Meta AI',       company: 'Singtel',       quarter: 'Q2 2026' },
  { product: 'Replicate',     company: 'Grab',          quarter: 'Q4 2026' },
  { product: 'Google Gemini', company: 'OCBC Bank',     quarter: 'Q2 2026' },
  { product: 'OpenAI',        company: 'UOB',           quarter: 'Q3 2026' },
  { product: 'Snowflake',     company: 'CapitaLand',    quarter: 'Q2 2026' },
  { product: 'Claude',        company: 'SIA',           quarter: 'Q4 2026' },
  { product: 'Chroma',        company: 'Shopee',        quarter: 'Q3 2026' },
  { product: 'Teradata',      company: 'Keppel Corp',   quarter: 'Q2 2026' },
  { product: 'SQL Server',    company: 'StarHub',       quarter: 'Q3 2026' },
  { product: 'Google Gemini', company: 'Lazada',        quarter: 'Q4 2026' },
  { product: 'OpenAI',        company: 'Mediacorp',     quarter: 'Q2 2026' },
  { product: 'Amazon Aurora', company: 'SembCorp',      quarter: 'Q3 2026' },
  { product: 'Snowflake',     company: 'ComfortDelGro', quarter: 'Q2 2026' },
  { product: 'ChatGPT',       company: 'Grab',          quarter: 'Q4 2026' },
  { product: 'Replicate',     company: 'DBS Bank',      quarter: 'Q3 2026' },
  { product: 'Claude',        company: 'Accenture',     quarter: 'Q2 2026' },
  { product: 'Teradata',      company: 'OCBC Bank',     quarter: 'Q4 2026' },
  { product: 'SQL Server',    company: 'Singtel',       quarter: 'Q2 2026' },
];

// Renewal Tracker Component
const RenewalTracker = ({ data, trackerListRef, loading }) => {
  const [modal, setModal] = useState(null);

  const handleProductClick = (item) => {
    const companies = ALL_TRACKER_ITEMS.filter(r => r.product === item.product);
    setModal({ product: item.product, companies, logo: item.logo });
  };

  return (
    <div className="renewal-chart-container">
      <div className="renewal-chart-header">
        <div className="renewal-chart-header-left">
          <h3>Renewal Tracker</h3>
          <p>Click a product to see all renewing companies</p>
        </div>
      </div>
      <div className="renewal-tracker-list" ref={trackerListRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            className="renewal-tracker-item renewal-tracker-item-clickable"
            onClick={() => handleProductClick(item)}
          >
            <div className="renewal-tracker-product-logo">
              {item.logo ? (
                <img src={item.logo} alt={item.product} title={item.product} />
              ) : (
                <span className="renewal-tracker-product-icon">{item.icon}</span>
              )}
            </div>
            <div className="renewal-tracker-content">
              <div className="renewal-tracker-product">{item.product}</div>
              <div className="renewal-tracker-company">{item.company}</div>
            </div>
            <div className="renewal-tracker-quarter">{item.quarter}</div>
          </div>
        ))}
        {loading && <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>Loading more...</div>}
      </div>
      {modal && (
        <ProductModal
          product={modal.product}
          companies={modal.companies}
          logo={modal.logo}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

// Main Dashboard Component
const RenewalDashboard = ({ onClose, inline = false }) => {
  const [timelineMode, setTimelineMode] = useState('quarter');
  const [trackerData, setTrackerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [kpiData, setKpiData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [urgencyData, setUrgencyData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [isDarkMode] = useState(false);
  const [animDot, setAnimDot] = useState(true);
  const trackerListRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setAnimDot(v => !v), 750);
    return () => clearInterval(t);
  }, []);

  // Fake metadata for KPIs and charts
  useEffect(() => {
    const kpis = [
      { title: 'Total Renewals Tracked', value: '530M+',  accentColor: '#3b82f6' },
      { title: 'Due This Quarter (Q2)', value: '134M+',  accentColor: '#f59e0b' },
      { title: 'High-Priority Renewals', value: '53M+',   accentColor: '#ef4444' }
    ];
    setKpiData(kpis);

    const products = [
      { name: 'AI/ML',     value: 205100000, percentage: '38.7', color: '#0ea5e9' },
      { name: 'CRM',       value: 164300000, percentage: '31.0', color: '#3b82f6' },
      { name: 'Database',  value: 160600000, percentage: '30.3', color: '#1e40af' },
    ];
    setProductData(products);

    setUrgencyData([
      { label: '< 1 Month',   value: 53000000,  color: '#0c4a6e' },
      { label: '1–3 Months',  value: 132500000, color: '#1e3a8a' },
      { label: '3–6 Months',  value: 185500000, color: '#3b82f6' },
      { label: '6–12 Months', value: 159000000, color: '#0ea5e9' }
    ]);

    setTimelineData([
      { label: 'Q1 2026', renewals: 82 },
      { label: 'Q2 2026', renewals: 74 },
      { label: 'Q3 2026', renewals: 133 },
      { label: 'Q4 2026', renewals: 107 },
      { label: 'Q1 2027', renewals: 109 },
      { label: 'Q2 2027', renewals: 148 },
      { label: 'Q3 2027', renewals: 107 },
      { label: 'Q4 2027', renewals: 99 },
      { label: 'Q1 2028', renewals: 35 },
      { label: 'Q2 2028', renewals: 71 },
      { label: 'Q3 2028', renewals: 61 },
      { label: 'Q4 2028', renewals: 99 },
      { label: 'Q1 2029', renewals: 148 },
      { label: 'Q2 2029', renewals: 143 },
      { label: 'Q3 2029', renewals: 69 },
      { label: 'Q4 2029', renewals: 146 },
    ]);
  }, []);

  // Fake tracker data with real S3 logos
  const fetchTrackerData = useCallback((pageNum) => {
    setLoading(true);
    const fakeItems = [
      { product: 'Amazon Aurora', company: 'DBS Bank', quarter: 'Q2 2026', urgency: 'critical' },
      { product: 'ChatGPT', company: 'Accenture', quarter: 'Q3 2026', urgency: 'watch' },
      { product: 'Meta AI', company: 'Singtel', quarter: 'Q2 2026', urgency: 'critical' },
      { product: 'Replicate', company: 'Grab', quarter: 'Q4 2026', urgency: 'comfortable' },
      { product: 'Google Gemini', company: 'OCBC Bank', quarter: 'Q2 2026', urgency: 'critical' },
      { product: 'OpenAI', company: 'UOB', quarter: 'Q3 2026', urgency: 'watch' },
      { product: 'Snowflake', company: 'CapitaLand', quarter: 'Q2 2026', urgency: 'critical' },
      { product: 'Claude', company: 'SIA', quarter: 'Q4 2026', urgency: 'comfortable' },
      { product: 'Chroma', company: 'Shopee', quarter: 'Q3 2026', urgency: 'watch' },
      { product: 'Teradata', company: 'Keppel Corp', quarter: 'Q2 2026', urgency: 'critical' },
      { product: 'SQL Server', company: 'StarHub', quarter: 'Q3 2026', urgency: 'watch' },
      { product: 'Google Gemini', company: 'Lazada', quarter: 'Q4 2026', urgency: 'comfortable' },
      { product: 'OpenAI', company: 'Mediacorp', quarter: 'Q2 2026', urgency: 'critical' },
      { product: 'Amazon Aurora', company: 'SembCorp', quarter: 'Q3 2026', urgency: 'watch' },
      { product: 'Snowflake', company: 'ComfortDelGro', quarter: 'Q2 2026', urgency: 'critical' },
      { product: 'ChatGPT', company: 'Grab', quarter: 'Q4 2026', urgency: 'comfortable' },
      { product: 'Replicate', company: 'DBS Bank', quarter: 'Q3 2026', urgency: 'watch' },
      { product: 'Claude', company: 'Accenture', quarter: 'Q2 2026', urgency: 'critical' },
      { product: 'Teradata', company: 'OCBC Bank', quarter: 'Q4 2026', urgency: 'comfortable' },
      { product: 'SQL Server', company: 'Singtel', quarter: 'Q2 2026', urgency: 'critical' }
    ];

    const pageSize = 10;
    const start = (pageNum - 1) * pageSize;
    const slice = fakeItems.slice(start, start + pageSize);

    const newTrackerData = slice.map(item => ({
      product: item.product,
      company: item.company,
      quarter: item.quarter,
      urgency: item.urgency,
      icon: ['☁️', '🤖', '🧠', '⚙️'][Math.floor(Math.random() * 4)],
      logo: getLogoPath(item.product)
    }));

    if (pageNum === 1) {
      setTrackerData(newTrackerData);
    } else {
      setTrackerData(prev => [...prev, ...newTrackerData]);
    }

    setHasMore(start + pageSize < fakeItems.length);
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchTrackerData(1);
  }, [fetchTrackerData]);

  const handleScroll = useCallback(() => {
    if (!trackerListRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = trackerListRef.current;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setPage(prev => {
        const nextPage = prev + 1;
        fetchTrackerData(nextPage);
        return nextPage;
      });
    }
  }, [loading, hasMore, fetchTrackerData]);

  useEffect(() => {
    const ref = trackerListRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div
      className={inline ? 'renewal-dashboard-inline' : 'renewal-modal-overlay'}
      onClick={inline ? undefined : onClose}
    >
      <div
        className={`renewal-dashboard-modal-content ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
        onClick={inline ? undefined : (e) => e.stopPropagation()}
      >
        {/* <div className="renewal-dashboard-modal-header">
          <div className="renewal-dashboard-title-section">
            <h2>Dashboard</h2>
          </div>
          <div className="renewal-dashboard-header-actions">
            <span className="renewal-live-badge">
              <span className={`renewal-live-dot${animDot ? ' renewal-live-dot-on' : ''}`}></span> Last Updated 1 week ago
            </span>
          </div>
        </div> */}

        <div className="renewal-dashboard-content">
          {/* KPI Cards */}
          <div className="renewal-kpi-grid">
            {kpiData.map((kpi) => (
              <KPICard key={kpi.title} {...kpi} />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="renewal-charts-grid">
            <div className="renewal-chart-half-width">
              {productData.length > 0 && <ProductBreakdownChart data={productData} isDarkMode={isDarkMode} />}
            </div>
            <div className="renewal-chart-half-width">
              {urgencyData.length > 0 && <UrgencyFunnelChart data={urgencyData} />}
            </div>
            <div className="renewal-chart-full-width">
              {timelineData.length > 0 && <RenewalTimelineChart data={timelineData} mode={timelineMode} />}
            </div>
            <div className="renewal-chart-full-width">
              <RenewalTracker data={trackerData} trackerListRef={trackerListRef} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewalDashboard;




