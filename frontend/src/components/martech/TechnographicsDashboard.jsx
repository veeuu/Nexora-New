import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import '../../styles/technographicsDashboard.css';

// Animated Counter
const AnimatedCounter = ({ end, duration = 1200 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
};

const KPICard = ({ label, value, prefix = '', suffix = '', accentColor }) => (
  <div className="tg-kpi-card" style={{ borderLeftColor: accentColor }}>
    <div className="tg-kpi-label">{label}</div>
    <div className="tg-kpi-value">
      {prefix}{value}{suffix}
    </div>
  </div>
);

const TECH_DATA = [
  { name: 'AWS',          value: 82100000, fill: '#1e40af' },
  { name: 'Azure',        value: 76300000, fill: '#1d4ed8' },
  { name: 'GCP',          value: 68400000, fill: '#2563eb' },
  { name: 'ChatGPT',      value: 61200000, fill: '#3b82f6' },
  { name: 'Snowflake',    value: 55300000, fill: '#60a5fa' },
  { name: 'LLM',          value: 48200000, fill: '#93c5fd' },
  { name: 'Transformers', value: 43100000, fill: '#0ea5e9' },
  { name: 'BigQuery',     value: 39200000, fill: '#38bdf8' },
  { name: 'Salesforce',   value: 34100000, fill: '#7dd3fc' },
  { name: 'Databricks',   value: 28400000, fill: '#bae6fd' },
];

const INDUSTRY_DATA = [
  { name: 'IT & Services',       value: 283200000 },
  { name: 'Financial Services',  value: 129800000 },
  { name: 'Healthcare',          value: 82600000  },
  { name: 'Retail',              value: 59000000  },
  { name: 'Manufacturing',       value: 35400000  },
];
const INDUSTRY_COLORS = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  color: '#0f172a',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

const formatM = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v;

const TechnographicsDashboard = ({ inline = false }) => {
  const [animDot, setAnimDot] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setAnimDot(v => !v), 750);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={inline ? 'tg-dashboard-inline' : 'tg-modal-overlay'}>
      <div className="tg-dashboard-content">

        {/* Header */}
        {/* <div className="tg-header">
          <div className="tg-header-left">
            <h2>Dashboard</h2>
          </div>
          <div className="tg-header-right">
            <span className="tg-live-badge">
              <span className={`tg-live-dot${animDot ? ' tg-live-dot-on' : ''}`}></span> Last Updated 1 week ago
            </span>
          </div>
        </div> */}

        <div className="tg-body">
          {/* KPI Cards */}
          <div className="tg-kpi-grid">
            <KPICard label="Companies Tracked"     value="590M+"  accentColor="#1e40af" />
            <KPICard label="Technologies Detected"  value="480M+"  accentColor="#2563eb" />
            <KPICard label="Avg. Revenue Band"      value="$47M"   accentColor="#3b82f6" />
            <KPICard label="New Detections Q1 '26"  value="137M+"  accentColor="#60a5fa" />
          </div>

          {/* Row 1: Tech Adoption Bar + Industry Donut */}
          <div className="tg-charts-row">
            <div className="tg-chart-card tg-chart-wide">
              <div className="tg-chart-header">
                <span className="tg-chart-title">Technology Adoption Frequency</span>
                <span className="tg-badge tg-badge-blue">Top 10 Tools</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={TECH_DATA} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatM} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.04)' }} formatter={(v) => [formatM(v), 'Companies']} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {TECH_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="tg-chart-card tg-chart-narrow">
              <div className="tg-chart-header">
                <span className="tg-chart-title">Industry Breakdown</span>
                <span className="tg-badge tg-badge-blue">Top 5</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={INDUSTRY_DATA} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" animationDuration={400}>
                    {INDUSTRY_DATA.map((_, i) => <Cell key={i} fill={INDUSTRY_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>


        </div>

      </div>
    </div>
  );
};

export default TechnographicsDashboard;
