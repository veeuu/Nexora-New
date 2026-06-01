import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import '../../styles/buyingGroupDashboard.css';

const formatM = (v) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v;

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  color: '#0f172a',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

// ── Static data ──────────────────────────────────────────────────────────────

const CATEGORY_DATA = [
  { name: 'AI/ML',    value: 107500000, fill: '#1e40af' },
  { name: 'Cloud',    value: 172000000, fill: '#2563eb' },
  { name: 'CRM',      value: 86000000,  fill: '#3b82f6' },
  { name: 'Database', value: 64500000,  fill: '#60a5fa' },
];

const ROLE_DATA = [
  { name: 'Decision Maker',  value: 147000000 },
  { name: 'Influencer',      value: 172000000 },
  { name: 'Direct Reportee', value: 111000000 },
];
const ROLE_COLORS = ['#1e40af', '#2563eb', '#60a5fa'];

// Industries tracked across buying group companies
const INDUSTRY_DATA = [
  { name: 'IT & Services',      value: 86000000,  fill: '#1e40af' },
  { name: 'Financial Services', value: 64500000,  fill: '#2563eb' },
  { name: 'Manufacturing',      value: 21500000,  fill: '#3b82f6' },
  { name: 'Telecom',            value: 18000000,  fill: '#60a5fa' },
  { name: 'Cybersecurity',      value: 32000000,  fill: '#0ea5e9' },
  { name: 'SaaS / FinTech',     value: 27500000,  fill: '#38bdf8' },
];

const KPI_CARDS = [
  { label: 'Total Contacts',    value: '430M+', accent: '#1e40af' },
  { label: 'Companies Covered', value: '215M+', accent: '#2563eb' },
];

// ── Sub-components ───────────────────────────────────────────────────────────

const KPICard = ({ label, value, accent }) => (
  <div className="bgd-kpi" style={{ borderLeftColor: accent }}>
    <div className="bgd-kpi-label">{label}</div>
    <div className="bgd-kpi-value">{value}</div>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────

const BuyingGroupDashboard = ({ inline = false }) => {
  const [visible, setVisible] = useState(false);
  const [hoveredRole, setHoveredRole] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`bgd-wrap${visible ? ' bgd-visible' : ''} ${inline ? 'bgd-inline' : ''}`}>

      {/* KPI row */}
      <div className="bgd-kpi-grid">
        {KPI_CARDS.map((k) => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Row 1: Category bar + Role donut */}
      <div className="bgd-charts-row">
        <div className="bgd-card bgd-card-wide">
          <div className="bgd-card-header">
            <span className="bgd-card-title">Contacts by Category</span>
            <span className="bgd-badge">4 categories</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CATEGORY_DATA} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatM} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatM(v), 'Contacts']} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {CATEGORY_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bgd-card bgd-card-narrow">
          <div className="bgd-card-header">
            <span className="bgd-card-title">Role Distribution</span>
            <span className="bgd-badge">3 roles</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={ROLE_DATA} cx="50%" cy="45%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3} dataKey="value" animationDuration={400}
                onMouseEnter={(_, i) => setHoveredRole(i)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                {ROLE_DATA.map((_, i) => (
                  <Cell key={i} fill={ROLE_COLORS[i]}
                    opacity={hoveredRole === null || hoveredRole === i ? 1 : 0.4}
                    style={{ transition: 'opacity 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatM(v), 'Contacts']} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default BuyingGroupDashboard;
