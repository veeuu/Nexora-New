import React, { useState, useEffect } from 'react';
import '../../styles/renewalDashboard.css';

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
    <div className="kpi-card" style={{ borderTopColor: accentColor }}>
      <div className="kpi-icon" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
        {icon}
      </div>
      <div className="kpi-content">
        <h3 className="kpi-title">{title}</h3>
        <div className="kpi-value">
          <AnimatedCounter end={value} />
        </div>
        <div className="kpi-trend" style={{ color: trend === 'up' ? '#10b981' : '#ef4444' }}>
          <span>{trend === 'up' ? '↑' : '↓'}</span>
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
};

// Renewal Timeline Bar Chart
const RenewalTimelineChart = ({ data, mode = 'quarter' }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.renewals, d.unlocked)));
  
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Renewal Timeline Distribution</h3>
        <p>Opportunities by {mode === 'quarter' ? 'quarter' : 'month'} · 2025–2026</p>
      </div>
      <div className="chart-tabs">
        <button className={`tab-btn ${mode === 'quarter' ? 'active' : ''}`}>By Quarter</button>
        <button className={`tab-btn ${mode === 'month' ? 'active' : ''}`}>By Month</button>
      </div>
      <div className="bar-chart">
        <div className="chart-y-axis">
          <div className="y-label">120</div>
          <div className="y-label">80</div>
          <div className="y-label">40</div>
          <div className="y-label">0</div>
        </div>
        <div className="bars-container">
          {data.map((item, idx) => (
            <div key={idx} className="bar-group">
              <div className="bar-wrapper">
                <div
                  className="bar renewals-bar"
                  style={{
                    height: `${(item.renewals / maxValue) * 100}%`,
                    animation: `slideUp 0.6s ease-out ${idx * 0.05}s both`
                  }}
                >
                  <span className="bar-label">{item.renewals}</span>
                </div>
              </div>
              <div className="bar-wrapper">
                <div
                  className="bar unlocked-bar"
                  style={{
                    height: `${(item.unlocked / maxValue) * 100}%`,
                    animation: `slideUp 0.6s ease-out ${idx * 0.05 + 0.1}s both`
                  }}
                >
                  <span className="bar-label">{item.unlocked}</span>
                </div>
              </div>
              <div className="bar-label-x">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color renewals-color"></div>
          <span>Renewals</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unlocked-color"></div>
          <span>Unlocked</span>
        </div>
      </div>
    </div>
  );
};

// Product Breakdown Donut Chart
const ProductBreakdownChart = ({ data }) => {
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
    <div className="chart-container">
      <div className="chart-header">
        <h3>Product Breakdown</h3>
        <p>Share of renewals by product</p>
      </div>
      <div className="donut-chart-wrapper">
        <svg viewBox="0 0 200 200" className="donut-chart">
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.path}
              fill={slice.color}
              style={{ animation: `fadeIn 0.6s ease-out ${idx * 0.1}s both` }}
            />
          ))}
          <circle cx="100" cy="100" r="50" fill="#0f172a" />
          <text x="100" y="100" textAnchor="middle" dy="0.3em" className="donut-center-text">
            {total}
          </text>
          <text x="100" y="115" textAnchor="middle" className="donut-center-label">
            renewals
          </text>
        </svg>
        <div className="donut-legend">
          {data.map((item, idx) => (
            <div key={idx} className="legend-item-donut">
              <div className="legend-color" style={{ backgroundColor: item.color }}></div>
              <div className="legend-text">
                <span className="legend-product">{item.name}</span>
                <span className="legend-stats">{item.percentage}% · {item.value} cos</span>
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
    <div className="chart-container">
      <div className="chart-header">
        <h3>Urgency Funnel</h3>
        <p>Renewals by time remaining</p>
        <div className="active-indicator">● Active</div>
      </div>
      <div className="funnel-chart">
        {data.map((item, idx) => (
          <div key={idx} className="funnel-item">
            <div className="funnel-label">{item.label}</div>
            <div
              className="funnel-bar"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
                animation: `slideInLeft 0.6s ease-out ${idx * 0.1}s both`
              }}
            >
              <span className="funnel-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Renewal Tracker Component
const RenewalTracker = ({ data }) => {
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
    <div className="chart-container">
      <div className="chart-header">
        <h3>Renewal Tracker</h3>
        <p>Most recent opportunities</p>
        <a href="#" className="view-all-link">View All →</a>
      </div>
      <div className="tracker-list">
        {data.map((item, idx) => (
          <div key={idx} className="tracker-item">
            <div className="tracker-urgency-dot" style={{ backgroundColor: getUrgencyColor(item.urgency) }}></div>
            <div className="tracker-product-icon">{item.icon}</div>
            <div className="tracker-content">
              <div className="tracker-product">{item.product}</div>
              <div className="tracker-company">{item.company}</div>
            </div>
            <div className="tracker-quarter">{item.quarter}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const RenewalDashboard = ({ onClose }) => {
  const [timelineMode, setTimelineMode] = useState('quarter');

  // Sample data - in production, this would come from your API
  const kpiData = [
    { icon: '📊', title: 'Total Renewals Tracked', value: 247, trend: 'up', trendValue: '12% vs last quarter', accentColor: '#3b82f6' },
    { icon: '⚡', title: 'Due This Quarter (Q2)', value: 112, trend: 'up', trendValue: '8 new this week', accentColor: '#f59e0b' },
    { icon: '🔓', title: 'Unlocked Companies', value: 4, trend: 'down', trendValue: '496 still locked', accentColor: '#10b981' },
    { icon: '🔴', title: 'High-Urgency Renewals', value: 23, trend: 'up', trendValue: '3 added this week', accentColor: '#ef4444' }
  ];

  const timelineData = [
    { label: 'Q1 2025', renewals: 38, unlocked: 12 },
    { label: 'Q2 2025', renewals: 66, unlocked: 18 },
    { label: 'Q3 2025', renewals: 52, unlocked: 14 },
    { label: 'Q4 2025', renewals: 88, unlocked: 22 },
    { label: 'Q1 2026', renewals: 112, unlocked: 28 },
    { label: 'Q2 2026', renewals: 93, unlocked: 25 },
    { label: 'Q3 2026', renewals: 74, unlocked: 20 },
    { label: 'Q4 2026', renewals: 67, unlocked: 18 }
  ];

  const productData = [
    { name: 'ChatGPT', value: 77, percentage: 31, color: '#10b981' },
    { name: 'Meta AI', value: 59, percentage: 24, color: '#0ea5e9' },
    { name: 'Amazon Aurora', value: 45, percentage: 18, color: '#f59e0b' },
    { name: 'Replicate', value: 34, percentage: 14, color: '#ef4444' },
    { name: 'Others', value: 32, percentage: 13, color: '#a78bfa' }
  ];

  const urgencyData = [
    { label: '< 1 Month', value: 23, color: '#ef4444' },
    { label: '1–3 Months', value: 58, color: '#f59e0b' },
    { label: '3–6 Months', value: 87, color: '#3b82f6' },
    { label: '6–12 Months', value: 112, color: '#10b981' }
  ];

  const trackerData = [
    { product: 'Amazon Aurora', company: 'Tech Corp', quarter: 'Q2 2026', urgency: 'critical', icon: '☁️' },
    { product: 'ChatGPT', company: 'Innovation Labs', quarter: 'Q2 2026', urgency: 'critical', icon: '🤖' },
    { product: 'ChatGPT', company: 'Digital Solutions', quarter: 'Q2 2026', urgency: 'watch', icon: '🤖' },
    { product: 'Meta AI', company: 'Future Systems', quarter: 'Q2 2026', urgency: 'watch', icon: '🧠' },
    { product: 'Replicate', company: 'Cloud Ventures', quarter: 'Q3 2026', urgency: 'comfortable', icon: '⚙️' },
    { product: 'Meta AI', company: 'Enterprise Plus', quarter: 'Q3 2026', urgency: 'comfortable', icon: '🧠' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dashboard-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-modal-header">
          <div className="dashboard-title-section">
            <h2>Renewal Intelligence Dashboard</h2>
            <p>Dashboard overview · Q2 2026 · Last updated just now</p>
          </div>
          <div className="dashboard-header-actions">
            <div className="live-indicator">● Live</div>
            <button className="filter-btn-dashboard">🔍 Filter</button>
            <button className="download-btn-dashboard">⬇ Download CSV</button>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="renewal-dashboard-content">
          {/* KPI Cards */}
          <div className="kpi-grid">
            {kpiData.map((kpi, idx) => (
              <KPICard key={idx} {...kpi} />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            <div className="chart-half-width">
              <ProductBreakdownChart data={productData} />
            </div>
            <div className="chart-half-width">
              <UrgencyFunnelChart data={urgencyData} />
            </div>
            <div className="chart-full-width">
              <RenewalTimelineChart data={timelineData} mode={timelineMode} />
            </div>
            <div className="chart-full-width">
              <RenewalTracker data={trackerData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewalDashboard;
