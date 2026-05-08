import { useEffect, useState } from 'react';
import '../styles/profile.css';

const FEATURES = [
  { label: 'Technographics', icon: '🖥️' },
  { label: 'Intent Data', icon: '🎯' },
  { label: 'Renewal Intelligence', icon: '🔄' },
  { label: 'Buying Group', icon: '👥' },
  { label: 'Next Tech Purchase®', icon: '📊' },
  { label: 'Keywords Surge', icon: '🔍' },
  { label: 'Product Catalogue', icon: '📦' },
];

const PLAN_LABELS = {
  free_trial: 'Free Trial',
  paid: 'Pro',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

// Credit log entries — static for now, replace with API later
const CREDIT_LOG = [
  { id: 1, action: 'Technographics export', credits: 5, date: 'May 7, 2026', section: 'Technographics' },
  { id: 2, action: 'Intent data filter', credits: 3, date: 'May 6, 2026', section: 'Intent' },
  { id: 3, action: 'Buying Group lookup', credits: 2, date: 'May 5, 2026', section: 'Buying Group' },
];

const SECTION_COLORS = {
  Technographics: '#3b82f6',
  Intent: '#8b5cf6',
  'Renewal Intelligence': '#f59e0b',
  'Buying Group': '#10b981',
  'Next Tech Purchase®': '#ef4444',
  'Keywords Surge': '#06b6d4',
  'Product Catalogue': '#f97316',
};

const ProfilePanel = ({ isOpen, onClose, username }) => {
  const [userPlan, setUserPlan] = useState('free_trial');
  const [memberSince, setMemberSince] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [queryHistory, setQueryHistory] = useState([]);

  useEffect(() => {
    const plan = localStorage.getItem('userPlan') || 'free_trial';
    setUserPlan(plan);

    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.iat) {
          const date = new Date(payload.iat * 1000);
          setMemberSince(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
      }
    } catch (_) {}

    // Load on-demand request history from localStorage
    try {
      const history = JSON.parse(localStorage.getItem('onDemandHistory') || '[]');
      setQueryHistory(history);
    } catch (_) {
      setQueryHistory([]);
    }
  }, [isOpen]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const planLabel = PLAN_LABELS[userPlan] || 'Free Trial';
  const isPaid = userPlan === 'paid' || userPlan === 'pro' || userPlan === 'enterprise';
  const creditsUsed = 10;
  const creditsTotal = 50;
  const creditPct = Math.round((creditsUsed / creditsTotal) * 100);

  return (
    <>
      {isOpen && <div className="profile-panel-overlay" onClick={onClose} />}
      <div className={`profile-panel ${isOpen ? 'profile-panel--open' : ''}`}>

        {/* Header */}
        <div className="profile-panel-header">
          <div className="profile-panel-header-identity">
            <div className="profile-panel-avatar-sm">{getInitials(username)}</div>
            <div className="profile-panel-header-text">
              <p className="profile-panel-header-email">{username}</p>
              <span className={`profile-panel-badge ${isPaid ? 'badge--pro' : 'badge--trial'}`}>
                {planLabel}
              </span>
            </div>
          </div>
          <button className="profile-panel-close" onClick={onClose} aria-label="Close profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {['overview', 'credits', 'history'].map((tab) => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? 'Overview' : tab === 'credits' ? 'Credits' : 'Query History'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="profile-panel-body">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              {memberSince && (
                <p className="profile-panel-since">Member since {memberSince}</p>
              )}

              {/* Plan card */}
              <div className={`profile-plan-card ${isPaid ? 'plan-card--pro' : 'plan-card--trial'}`}>
                <div className="plan-card-top">
                  <span className="plan-card-icon">{isPaid ? '⭐' : '🚀'}</span>
                  <div>
                    <p className="plan-card-name">{planLabel} Plan</p>
                    <p className="plan-card-desc">
                      {isPaid ? 'Full access to all Nexora features' : '50 free credits · Limited access'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="profile-panel-divider" />

              {/* Feature access */}
              <p className="profile-panel-section-label">Feature Access</p>
              <ul className="profile-features-list">
                {FEATURES.map((f) => (
                  <li key={f.label} className="profile-feature-item">
                    <span className="feature-icon">{f.icon}</span>
                    <span className="feature-label">{f.label}</span>
                    <span className={`feature-status ${isPaid ? 'status--active' : 'status--limited'}`}>
                      {isPaid ? 'Active' : 'Limited'}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="profile-panel-divider" />

              {/* Data coverage */}
              <p className="profile-panel-section-label">Data Coverage</p>
              <div className="profile-stats-grid">
                {[
                  { value: '50K+', label: 'Companies' },
                  { value: '200+', label: 'Technologies' },
                  { value: '15+', label: 'Industries' },
                  { value: 'Global', label: 'Coverage' },
                ].map((s) => (
                  <div key={s.label} className="profile-stat">
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── CREDITS TAB ── */}
          {activeTab === 'credits' && (
            <>
              {/* Summary card */}
              <div className="credits-summary-card">
                <div className="credits-summary-top">
                  <div>
                    <p className="credits-used-num">{creditsUsed} <span>/ {creditsTotal}</span></p>
                    <p className="credits-used-label">Credits used this cycle</p>
                  </div>
                  <div className="credits-remaining-pill">
                    {creditsTotal - creditsUsed} left
                  </div>
                </div>
                <div className="credits-bar-wrap">
                  <div className="credits-bar-track">
                    <div className="credits-bar-fill" style={{ width: `${creditPct}%` }} />
                  </div>
                  <span className="credits-bar-pct">{creditPct}%</span>
                </div>
                <p className="credits-reset-note">Resets on June 1, 2026</p>
              </div>

              <div className="profile-panel-divider" />

              <p className="profile-panel-section-label">Credit Usage Log</p>
              {CREDIT_LOG.length === 0 ? (
                <p className="empty-state-text">No credits used yet.</p>
              ) : (
                <ul className="credit-log-list">
                  {CREDIT_LOG.map((entry) => (
                    <li key={entry.id} className="credit-log-item">
                      <div className="credit-log-dot" style={{ background: SECTION_COLORS[entry.section] || '#9ca3af' }} />
                      <div className="credit-log-info">
                        <p className="credit-log-action">{entry.action}</p>
                        <p className="credit-log-meta">{entry.section} · {entry.date}</p>
                      </div>
                      <span className="credit-log-cost">−{entry.credits}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <>
              <div className="history-tab-header">
                <p className="profile-panel-section-label" style={{ margin: 0 }}>Request on Demand — Query History</p>
                {queryHistory.length > 0 && (
                  <button
                    className="history-clear-btn"
                    onClick={() => {
                      localStorage.removeItem('onDemandHistory');
                      setQueryHistory([]);
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              {queryHistory.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-state-icon">📋</span>
                  <p className="empty-state-text">No requests submitted yet.</p>
                  <p className="empty-state-hint">
                    When you can't find a company or data point, use the "Request on Demand" button on any page to submit a request. It will appear here.
                  </p>
                </div>
              ) : (
                <ul className="query-history-list">
                  {queryHistory.map((q) => (
                    <li key={q.id} className="query-history-item">
                      <div className="query-history-top">
                        <span
                          className="query-section-tag"
                          style={{ background: `${SECTION_COLORS[q.section] || '#9ca3af'}18`, color: SECTION_COLORS[q.section] || '#9ca3af' }}
                        >
                          {q.section}
                        </span>
                        {q.filterType && (
                          <span className="query-filter-tag">{q.filterType}</span>
                        )}
                        <span className={`query-status-badge ${q.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                          {q.status}
                        </span>
                      </div>
                      <p className="query-text">{q.query}</p>
                      <p className="query-date">{q.date}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default ProfilePanel;
