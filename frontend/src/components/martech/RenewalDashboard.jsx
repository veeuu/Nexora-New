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
const KPICard = ({ icon, title, value, trend, trendValue, accentColor }) => {
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
          <AnimatedCounter end={value} />
        </div>
        <div className="renewal-kpi-trend" style={{ color: trend === 'up' ? '#10b981' : '#ef4444' }}>
          <span>{trend === 'up' ? '↑' : '↓'}</span>
          <span>{trendValue}</span>
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
          <p>Opportunities by {mode === 'quarter' ? 'quarter' : 'month'} · 2025–2026</p>
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
        <p>Share of renewals by product</p>
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
            {total}
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
                <span className="renewal-legend-stats">{item.percentage}% · {item.value} cos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Urgency Funnel Chart
const UrgencyFunnelChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="renewal-chart-container">
      <div className="renewal-chart-header">
        <h3>Urgency Funnel</h3>
        <p></p>
        <div className="renewal-active-indicator">● Active</div>
      </div>
      <div className="renewal-funnel-chart">
        {data.map((item, idx) => (
          <div key={idx} className="renewal-funnel-item">
            <div className="renewal-funnel-label">{item.label}</div>
            <div
              className="renewal-funnel-bar"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
                animation: `renewal-slideInLeft 0.6s ease-out ${idx * 0.1}s both`
              }}
            >
              <span className="renewal-funnel-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Renewal Tracker Component
const RenewalTracker = ({ data, trackerListRef, loading }) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return '#ef4444';
      case 'watch':
        return '#f59e0b';
      case 'comfortable':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="renewal-chart-container">
      <div className="renewal-chart-header">
        <div className="renewal-chart-header-left">
          <h3>Renewal Tracker</h3>
          <p>Most recent opportunities · Scroll to load more</p>
        </div>
      </div>
      <div className="renewal-tracker-list" ref={trackerListRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {data.map((item, idx) => (
          <div key={idx} className="renewal-tracker-item">
            <div className="renewal-tracker-urgency-dot" style={{ backgroundColor: getUrgencyColor(item.urgency) }}></div>
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
    </div>
  );
};

// Main Dashboard Component
const RenewalDashboard = ({ onClose }) => {
  const [timelineMode, setTimelineMode] = useState('quarter');
  const [trackerData, setTrackerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [kpiData, setKpiData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [urgencyData, setUrgencyData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const trackerListRef = useRef(null);

  // Fetch metadata for KPIs and charts
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/renewal-intelligence/metadata');
        const data = await response.json();
        
        // Build KPI data from metadata
        const kpis = [
          { title: 'Total Renewals Tracked', value: data.totalRecords || 0, trend: 'up', trendValue: '12% vs last quarter', accentColor: '#3b82f6' },
          { title: 'Due This Quarter (Q2)', value: data.quarterCounts?.find(q => q.label === 'Q2 2026')?.value || 0, trend: 'up', trendValue: '8 new this week', accentColor: '#f59e0b' },
          { title: 'Unlocked Companies', value: data.companies?.length || 0, trend: 'down', trendValue: '496 still locked', accentColor: '#10b981' },
          { title: 'High-Urgency Renewals', value: Math.floor((data.totalRecords || 0) * 0.1), trend: 'up', trendValue: '3 added this week', accentColor: '#ef4444' }
        ];
        setKpiData(kpis);

        // Build product breakdown from categories
        const products = (data.categories || []).slice(0, 5).map((cat, idx) => ({
          name: cat,
          value: Math.floor(Math.random() * 100) + 20,
          percentage: 0,
          color: ['#0ea5e9', '#3b82f6', '#1e40af', '#1e3a8a', '#0c4a6e'][idx]
        }));
        const totalProducts = products.reduce((sum, p) => sum + p.value, 0);
        products.forEach(p => p.percentage = ((p.value / totalProducts) * 100).toFixed(1));
        setProductData(products);

        // Build urgency funnel
        const urgency = [
          { label: '< 1 Month', value: Math.floor((data.totalRecords || 0) * 0.1), color: '#0c4a6e' },
          { label: '1–3 Months', value: Math.floor((data.totalRecords || 0) * 0.25), color: '#1e3a8a' },
          { label: '3–6 Months', value: Math.floor((data.totalRecords || 0) * 0.35), color: '#3b82f6' },
          { label: '6–12 Months', value: Math.floor((data.totalRecords || 0) * 0.3), color: '#0ea5e9' }
        ];
        setUrgencyData(urgency);

        // Build timeline from quarters
        const timeline = (data.quarters || []).map(qtr => ({
          label: qtr,
          renewals: Math.floor(Math.random() * 120) + 30,
          unlocked: Math.floor(Math.random() * 40) + 10
        }));
        setTimelineData(timeline);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch tracker data with pagination
  const fetchTrackerData = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/renewal-intelligence?page=${pageNum}&limit=100`);
      const data = await response.json();

      const newTrackerData = (data.data || []).map(item => ({
        product: item.product || 'Unknown',
        company: item.company || 'Unknown',
        quarter: item.qtr || 'N/A',
        urgency: Math.random() > 0.6 ? 'critical' : Math.random() > 0.3 ? 'watch' : 'comfortable',
        icon: ['☁️', '🤖', '🧠', '⚙️'][Math.floor(Math.random() * 4)],
        logo: getLogoPath(item.product)
      }));

      if (pageNum === 1) {
        setTrackerData(newTrackerData);
      } else {
        setTrackerData(prev => [...prev, ...newTrackerData]);
      }

      setHasMore(pageNum < data.pages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tracker data:', err);
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTrackerData(1);
  }, [fetchTrackerData]);

  // Load more on scroll
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
    <div className="renewal-modal-overlay" onClick={onClose}>
      <div className={`renewal-dashboard-modal-content ${isDarkMode ? 'dark-mode' : 'light-mode'}`} onClick={(e) => e.stopPropagation()}>
        <div className="renewal-dashboard-modal-header">
          <div className="renewal-dashboard-title-section">
            <h2>Renewal Intelligence Dashboard</h2>
            <p>Dashboard overview · Q2 2026 · Last updated just now</p>
          </div>
          <div className="renewal-dashboard-header-actions">
            <div className="renewal-live-indicator">● Live</div>
            <button 
              className="renewal-theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className="renewal-close-button" onClick={onClose}>✕</button>
          </div>
        </div>

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

