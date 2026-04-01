import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart,
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

const KPICard = ({ label, value, prefix = '', suffix = '', delta, deltaUp, accentColor }) => (
  <div className="tg-kpi-card" style={{ borderLeftColor: accentColor }}>
    <div className="tg-kpi-label">{label}</div>
    <div className="tg-kpi-value">
      {prefix}<AnimatedCounter end={value} />{suffix}
    </div>
    <div className={`tg-kpi-delta ${deltaUp ? 'delta-up' : 'delta-down'}`}>
      {deltaUp ? '↑' : '↓'} {delta}
    </div>
  </div>
);

const TECH_DATA = [
  { name: 'AWS',          value: 82, fill: '#1e40af' },
  { name: 'ChatGPT',      value: 74, fill: '#1d4ed8' },
  { name: 'Snowflake',    value: 61, fill: '#2563eb' },
  { name: 'GCP',          value: 55, fill: '#3b82f6' },
  { name: 'Redis',        value: 48, fill: '#60a5fa' },
  { name: 'LLM',          value: 43, fill: '#93c5fd' },
  { name: 'Transformers', value: 39, fill: '#0ea5e9' },
  { name: 'Azure',        value: 37, fill: '#38bdf8' },
  { name: 'BigQuery',     value: 33, fill: '#7dd3fc' },
  { name: 'Salesforce',   value: 29, fill: '#bae6fd' },
];

const INDUSTRY_DATA = [
  { name: 'IT & Services',       value: 48 },
  { name: 'Financial Services',  value: 22 },
  { name: 'Healthcare',          value: 14 },
  { name: 'Retail',              value: 10 },
  { name: 'Manufacturing',       value: 6  },
];
const INDUSTRY_COLORS = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

const REVENUE_DATA = [
  { name: '<$10M',    value: 18 },
  { name: '$10–30M',  value: 52 },
  { name: '$30–50M',  value: 71 },
  { name: '$50–100M', value: 63 },
  { name: '$100M+',   value: 44 },
];

const TREND_DATA = [
  { q: 'Q1 21', v: 12 }, { q: 'Q2 21', v: 18 }, { q: 'Q3 21', v: 15 },
  { q: 'Q4 21', v: 22 }, { q: 'Q1 22', v: 25 }, { q: 'Q2 22', v: 30 },
  { q: 'Q1 23', v: 38 }, { q: 'Q1 24', v: 45 }, { q: 'Q2 24', v: 52 },
  { q: 'Q3 24', v: 60 }, { q: 'Q4 24', v: 68 }, { q: 'Q1 25', v: 85 },
  { q: 'Q2 25', v: 97 }, { q: 'Q3 25', v: 110 },{ q: 'Q4 25', v: 125 },
  { q: 'Q1 26', v: 137 },
];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  color: '#0f172a',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

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
        <div className="tg-header">
          <div className="tg-header-left">
            <h2>Technographics Dashboard</h2>
            <p>Visualizing technology signals across 248 companies · Q1 2026</p>
          </div>
          <div className="tg-header-right">
            <span className="tg-live-badge">
              <span className={`tg-live-dot${animDot ? ' tg-live-dot-on' : ''}`}></span> Live
            </span>
          </div>
        </div>

        <div className="tg-body">
          {/* KPI Cards */}
          <div className="tg-kpi-grid">
            <KPICard label="Companies Tracked"     value={248} delta="12.4% vs last quarter" deltaUp accentColor="#1e40af" />
            <KPICard label="Technologies Detected"  value={64}  delta="8.7% new signals"       deltaUp accentColor="#2563eb" />
            <KPICard label="Avg. Revenue Band"      value={47}  prefix="$" suffix="M" delta="3.2% median shift" deltaUp accentColor="#3b82f6" />
            <KPICard label="New Detections Q1 '26"  value={137} delta="2.1% vs Q4 '25"         deltaUp={false} accentColor="#60a5fa" />
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
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {TECH_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="tg-chart-card tg-chart-narrow">
              <div className="tg-chart-header">
                <span className="tg-chart-title">Industry Breakdown</span>
                <span className="tg-badge tg-badge-blue">By Sector</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={INDUSTRY_DATA} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {INDUSTRY_DATA.map((_, i) => <Cell key={i} fill={INDUSTRY_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Revenue + Detection Trend */}
          <div className="tg-charts-row tg-charts-row-2">
            <div className="tg-chart-card">
              <div className="tg-chart-header">
                <span className="tg-chart-title">Revenue Distribution</span>
                <span className="tg-badge tg-badge-blue">By Band</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={REVENUE_DATA} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} width={70} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="tg-chart-card">
              <div className="tg-chart-header">
                <span className="tg-chart-title">Detection Trend</span>
                <span className="tg-badge tg-badge-blue">Quarterly</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={TREND_DATA} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tgBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="q" tick={{ fill: '#64748b', fontSize: 9 }} angle={-35} textAnchor="end" height={40} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} fill="url(#tgBlue)" dot={{ r: 3, fill: '#2563eb' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TechnographicsDashboard;
