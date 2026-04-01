import { useEffect, useRef, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import '../../styles/ntpDashboard.css';

const leads = [
  { name: 'AgSouth Farm Credit',       cat: 'Cloud', pred: 'Medium', techs: [{ name: 'AWS', pct: 56.66 }, { name: 'ChatGPT', pct: 63.10 }] },
  { name: 'Amla Commerce',             cat: 'Cloud', pred: 'Low',    techs: [{ name: 'Azure DevOps', pct: 32.18 }, { name: 'SQL Server', pct: 38.12 }, { name: 'MongoDB', pct: 47.86 }] },
  { name: 'B-Stock Solutions',         cat: 'AI/ML', pred: 'High',   techs: [{ name: 'Transformers', pct: 76.25 }, { name: 'Machine Learning', pct: 83.36 }, { name: 'AI', pct: 50.97 }] },
  { name: 'Bay Federal Credit Union',  cat: 'Cloud', pred: 'Low',    techs: [{ name: 'Azure', pct: 41.79 }, { name: 'AWS', pct: 79.21 }] },
  { name: 'Blue Federal Credit Union', cat: 'Cloud', pred: 'Medium', techs: [{ name: 'Azure', pct: 71.23 }, { name: 'AI', pct: 22.22 }] },
];

const predColors = { High: '#1a56b0', Medium: '#2a65a3', Low: '#60a5fa' };
const predBadgeClass = { High: 'ntpd-badge-h', Medium: 'ntpd-badge-m', Low: 'ntpd-badge-l' };
const shortName = (n) => n.replace('Federal Credit Union', 'FCU').replace(' Solutions', '').replace('Farm Credit', 'FC');

const ranked = [...leads]
  .map((l) => ({ ...l, avg: l.techs.reduce((a, t) => a + t.pct, 0) / l.techs.length }))
  .sort((a, b) => b.avg - a.avg);

const barColor = (pct) => {
  if (pct >= 80) return '#0f3460';
  if (pct >= 60) return '#1a56b0';
  if (pct >= 40) return '#3b82f6';
  return '#93c5fd';
};

const rankBadge = (i, total) => {
  if (i === 0) return 'High';
  if (i === total - 1) return 'Low';
  return 'Medium';
};

// All data based on total 110,497 companies
const catPieData = [
  { name: 'Cloud',    value: 44199 },
  { name: 'AI/ML',   value: 9945  },
  { name: 'Database', value: 19889 },
  { name: 'CRM',     value: 36464 },
];
const catPieColors = ['#1a56b0', '#3b82f6', '#60a5fa', '#93c5fd'];

const predPieData = [
  { name: 'High',   value: 22099 },
  { name: 'Medium', value: 55249 },
  { name: 'Low',    value: 33149 },
];

const radarData = [
  { subject: 'Cloud infra',     High: 60, Medium: 75, Low: 50 },
  { subject: 'AI readiness',    High: 90, Medium: 55, Low: 40 },
  { subject: 'Data maturity',   High: 80, Medium: 60, Low: 45 },
  { subject: 'Purchase intent', High: 85, Medium: 50, Low: 30 },
  { subject: 'Tech diversity',  High: 70, Medium: 65, Low: 55 },
];

const avgPropensity = Math.round(
  leads.flatMap((l) => l.techs.map((t) => t.pct)).reduce((a, b) => a + b, 0) /
  leads.flatMap((l) => l.techs).length
);

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="ntpd-tooltip">
        <div className="ntpd-tooltip-label">{payload[0].name}</div>
        <div className="ntpd-tooltip-value">{payload[0].value.toLocaleString()} companies</div>
      </div>
    );
  }
  return null;
};

export default function NTPDashboard() {
  const barsRef = useRef(null);
  const [hoveredPred, setHoveredPred] = useState(null);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => {
      if (barsRef.current) {
        barsRef.current.querySelectorAll('[data-w]').forEach((el, i) => {
          setTimeout(() => { el.style.width = el.dataset.w; }, i * 120);
        });
      }
    }, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`ntpd-wrap${visible ? ' ntpd-visible' : ''}`} ref={barsRef}>
      <div className="ntpd-header">
        <div className="ntpd-header-left">
          <div className="ntpd-title">NTP® Dashboard</div>
          {/* <div className="ntpd-meta">
            <span className="ntpd-meta-bold">Dashboard overview</span> · Next-to-Purchase Intelligence® · April 2026
          </div> */}
        </div>
        <div className="ntpd-header-actions">
          <span className="ntpd-badge-live">
            <span className={`ntpd-dot${visible ? ' ntpd-dot-on' : ''}`}></span> Last Updated 1 week ago
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="ntpd-kpi-grid">
        {[
          { label: 'Total Leads',    val: '110,497',  sub: 'companies tracked',  cls: '' },
          { label: 'Avg Propensity', val: `${avgPropensity}%`, sub: 'across all signals', cls: '' },
          { label: 'High Priority',  val: '22,099',   sub: 'immediate outreach', cls: 'ntpd-green' },
          { label: 'Top Category',   val: 'Cloud',    sub: '44,199 companies',   cls: 'ntpd-blue' },
        ].map((k, i) => (
          <div key={k.label} className="ntpd-kpi ntpd-kpi-anim" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="ntpd-kpi-label">{k.label}</div>
            <div className={`ntpd-kpi-val ${k.cls}`}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* 2×2 chart grid */}
      <div className="ntpd-grid4">

        {/* Chart 1: Category breakdown */}
        <div className="ntpd-card ntpd-card-anim" style={{ animationDelay: '100ms' }}>
          <div className="ntpd-card-title">Category breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catPieData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={hoveredCat !== null ? 85 : 78}
                dataKey="value" paddingAngle={3}
                isAnimationActive animationBegin={200} animationDuration={900}
                onMouseEnter={(_, i) => setHoveredCat(i)}
                onMouseLeave={() => setHoveredCat(null)}
                style={{ cursor: 'pointer' }}
              >
                {catPieData.map((entry, i) => (
                  <Cell key={entry.name} fill={catPieColors[i]}
                    opacity={hoveredCat === null || hoveredCat === i ? 1 : 0.4}
                    style={{ transition: 'opacity 0.2s' }} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="ntpd-legend">
            {catPieData.map((entry, i) => {
              const total = catPieData.reduce((s, d) => s + d.value, 0);
              const pct = ((entry.value / total) * 100).toFixed(1);
              return (
                <span key={entry.name} className="ntpd-leg-item">
                  <span className="ntpd-leg-dot" style={{ background: catPieColors[i] }} />
                  {entry.name} ({pct}%)
                </span>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Signal strength radar */}
        <div className="ntpd-card ntpd-card-anim" style={{ animationDelay: '160ms' }}>
          <div className="ntpd-card-title">Signal strength radar</div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#666' }} />
              <Radar name="High"   dataKey="High"   stroke="#1a56b0" fill="#1a56b0" fillOpacity={0.18} dot={{ r: 4, fill: '#1a56b0' }} isAnimationActive animationBegin={500} animationDuration={1000} />
              <Radar name="Medium" dataKey="Medium" stroke="#EF9F27" fill="#EF9F27" fillOpacity={0.14} dot={{ r: 4, fill: '#EF9F27' }} isAnimationActive animationBegin={650} animationDuration={1000} />
              <Radar name="Low"    dataKey="Low"    stroke="#E24B4A" fill="#E24B4A" fillOpacity={0.10} dot={{ r: 4, fill: '#E24B4A' }} isAnimationActive animationBegin={800} animationDuration={1000} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Company propensity ranking */}
        <div className="ntpd-card ntpd-card-anim" style={{ animationDelay: '220ms' }}>
          <div className="ntpd-card-title">Company propensity ranking</div>
          <div className="ntpd-rank-list">
            {ranked.map((l, i) => {
              const pct = Math.round(l.avg);
              const badge = rankBadge(i, ranked.length);
              return (
                <div key={l.name} className="ntpd-rank-row ntpd-rank-anim" style={{ animationDelay: `${300 + i * 80}ms` }}>
                  <span className="ntpd-rank-num">{i + 1}</span>
                  <span className="ntpd-rank-name" title={l.name}>{shortName(l.name)}</span>
                  <div className="ntpd-rank-bar-bg">
                    <div className="ntpd-rank-bar-fill" data-w={`${pct}%`}
                      style={{ width: 0, background: barColor(l.avg) }} />
                  </div>
                  <span className="ntpd-rank-pct">{l.avg.toFixed(1)}%</span>
                  <span className={`ntpd-rank-badge ${predBadgeClass[badge]}`}>{badge}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Purchase prediction split */}
        <div className="ntpd-card ntpd-card-anim" style={{ animationDelay: '280ms' }}>
          <div className="ntpd-card-title">Purchase prediction split</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={predPieData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={hoveredPred !== null ? 85 : 78}
                dataKey="value" paddingAngle={3}
                isAnimationActive animationBegin={300} animationDuration={900}
                onMouseEnter={(_, i) => setHoveredPred(i)}
                onMouseLeave={() => setHoveredPred(null)}
                style={{ cursor: 'pointer' }}
              >
                {predPieData.map((entry) => (
                  <Cell key={entry.name} fill={predColors[entry.name]}
                    opacity={hoveredPred === null || hoveredPred === predPieData.indexOf(entry) ? 1 : 0.4}
                    style={{ transition: 'opacity 0.2s' }} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="ntpd-legend">
            {predPieData.map((entry) => {
              const total = predPieData.reduce((s, d) => s + d.value, 0);
              const pct = ((entry.value / total) * 100).toFixed(1);
              return (
                <span key={entry.name} className="ntpd-leg-item">
                  <span className="ntpd-leg-dot" style={{ background: predColors[entry.name] }} />
                  {entry.name} ({pct}%)
                </span>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
