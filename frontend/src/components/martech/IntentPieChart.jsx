import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import '../../styles/intentPieChart.css';

const STATUS_COLORS = {
  High:         '#0f3460',
  'High-Medium':'#1a56b0',
  Medium:       '#2a65a3',
  Low:          '#60a5fa',
  Greenfield:   '#93c5fd',
};

const DEFAULT_COLOR = '#bfdbfe';

// Normalize raw status strings into canonical buckets
const normalizeStatus = (raw) => {
  const s = String(raw || '').trim().toLowerCase();
  if (s === 'high')         return 'High';
  if (s === 'high-medium' || s === 'high medium') return 'High-Medium';
  if (s === 'medium')       return 'Medium';
  if (s === 'low')          return 'Low';
  if (s.includes('green'))  return 'Greenfield';
  return String(raw || '').trim() || 'Unknown';
};

const getColor = (name) => STATUS_COLORS[name] || DEFAULT_COLOR;

// Animated counter — counts up from 0 to `end` over `duration` ms
const AnimatedCounter = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!end) return;
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
  return <span>{count.toLocaleString()}</span>;
};

const formatM = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v;

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="idb-tooltip">
      <span style={{ color: getColor(payload[0].name), fontWeight: 600 }}>{payload[0].name}</span>
      <span>{formatM(payload[0].value)} companies ({payload[0].payload.pct}%)</span>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="idb-tooltip">
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span>{formatM(payload[0].value)} companies</span>
    </div>
  );
};

const IntentPieChart = ({ data }) => {
  const [filter, setFilter]   = useState('All');
  const [animDot, setAnimDot] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setAnimDot(v => !v), 750);
    return () => clearInterval(t);
  }, []);

  // ── Derive everything from real API data ──────────────────────────────────
  // `data` = [{ name: 'High', value: 26, percentage: '61.9' }, ...]
  // already aggregated by Home.jsx before passing in

  const allStatuses = data && data.length > 0 ? data : [];

  // Normalize names in case API returns raw strings
  const normalized = allStatuses.map(d => ({
    ...d,
    name: normalizeStatus(d.name),
  }));

  // Merge duplicates after normalization
  const merged = Object.values(
    normalized.reduce((acc, d) => {
      acc[d.name] = { name: d.name, value: (acc[d.name]?.value || 0) + d.value };
      return acc;
    }, {})
  );

  const totalAll = merged.reduce((s, d) => s + d.value, 0);

  // Add pct for tooltip
  const mergedWithPct = merged.map(d => ({
    ...d,
    pct: totalAll ? ((d.value / totalAll) * 100).toFixed(1) : '0',
  }));

  // Fixed display order
  const STATUS_ORDER = ['Greenfield', 'High', 'High-Medium', 'Medium', 'Low'];

  // Filter chips — only show statuses that exist in data, in fixed order
  const availableStatuses = STATUS_ORDER.filter(s => merged.some(d => d.name === s));
  const filters = ['All', ...availableStatuses];

  // Filtered slice for charts
  const filtered = filter === 'All'
    ? mergedWithPct
    : mergedWithPct.filter(d => d.name === filter);

  const filteredTotal = filtered.reduce((s, d) => s + d.value, 0);
  void filteredTotal; // used for potential future filtering display

  // KPI values — hardcoded display strings (millions scale)
  const highCount       = '113M+';
  const medCount        = '196M+';
  const lowCount        = '89M+';
  const hmCount         = '79M+';
  const gfCount         = '51M+';
  const totalAllDisplay = '530M+';

  // Bar chart — statuses in fixed order
  const barData = [...mergedWithPct].sort(
    (a, b) => STATUS_ORDER.indexOf(a.name) - STATUS_ORDER.indexOf(b.name)
  );

  if (!data || data.length === 0) {
    return (
      <div className="idb-root">
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          No intent data available
        </div>
      </div>
    );
  }

  return (
    <div className="idb-root">
      {/* Header */}
      <div className="idb-header">
        <div className="idb-header-left">
          <div className="idb-title">Dashboard</div>
          {/* <div className="idb-meta">
            <span className="idb-meta-bold">Dashboard overview</span> · Live data · Last updated just now
          </div> */}
        </div>
        <div className="idb-header-actions">
          <span className="idb-badge-live">
            <span className={`idb-dot${animDot ? ' idb-dot-on' : ''}`}></span> Last Updated 1 week ago
          </span>

        </div>
      </div>

      {/* Filter chips */}
      <div className="idb-filter-bar">
        {filters.map(f => (
          <button
            key={f}
            className={`idb-chip${filter === f ? ' idb-chip-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="idb-kpi-grid">
        <div className="idb-kpi-card">
          <div className="idb-kpi-label">Total Companies</div>
          <div className="idb-kpi-value">{totalAllDisplay}</div>
        </div>
        <div className="idb-kpi-card">
          <div className="idb-kpi-label">High</div>
          <div className="idb-kpi-value" style={{ color: '#0f3460' }}>{highCount}</div>
        </div>
        <div className="idb-kpi-card">
          <div className="idb-kpi-label">High-Medium</div>
          <div className="idb-kpi-value" style={{ color: '#1a56b0' }}>{hmCount}</div>
        </div>
        <div className="idb-kpi-card">
          <div className="idb-kpi-label">Medium</div>
          <div className="idb-kpi-value" style={{ color: '#2a65a3' }}>{medCount}</div>
        </div>
        <div className="idb-kpi-card">
          <div className="idb-kpi-label">Low</div>
          <div className="idb-kpi-value" style={{ color: '#60a5fa' }}>{lowCount}</div>
        </div>
        <div className="idb-kpi-card">
          <div className="idb-kpi-label">Greenfield</div>
          <div className="idb-kpi-value" style={{ color: '#93c5fd' }}>{gfCount}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="idb-charts-row">
        {/* Donut */}
        <div className="idb-chart-card">
          <div className="idb-chart-title">Intent status breakdown</div>
          <div className="idb-legend">
            {mergedWithPct.map(d => (
              <span key={d.name} className="idb-leg" style={{ opacity: filter === 'All' || filter === d.name ? 1 : 0.35 }}>
                <span className="idb-leg-sq" style={{ background: getColor(d.name) }}></span>
                {d.name} {d.pct}%
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mergedWithPct}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={2}
                animationDuration={600}
              >
                {mergedWithPct.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={getColor(entry.name)}
                    opacity={filter === 'All' || filter === entry.name ? 1 : 0.2}
                    style={{ transition: 'opacity 0.25s' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar – companies by status */}
        <div className="idb-chart-card idb-chart-card-wide">
          <div className="idb-chart-title">Companies by intent status</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 90, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatM}
                label={{ value: 'Company Count', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
                label={{ value: 'Intent Status', angle: -90, position: 'insideLeft', offset: -5, fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={600}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={getColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IntentPieChart;
