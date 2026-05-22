import { useEffect, useState } from 'react';
import '../styles/profile.css';

const FEATURES = [
  { label: 'Technographics' },
  { label: 'Intent Data' },
  { label: 'Renewal Intelligence' },
  { label: 'Buying Group' },
  { label: 'Next Tech Purchase®' },
  { label: 'Keywords Surge' },
  { label: 'Product Catalogue' },
];

const PLAN_LABELS = {
  free_trial: 'Free Trial',
  paid: 'Pro',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const SECTION_COLORS = {
  Technographics: '#3b82f6',
  'Intent Data': '#8b5cf6',
  'Renewal Intelligence': '#f59e0b',
  'Buying Group': '#10b981',
  'Next Tech Purchase®': '#ef4444',
  'Keywords Surge': '#06b6d4',
  'Product Catalogue': '#f97316',
};

const ProfilePanel = ({ isOpen, onClose, username, onLogout }) => {
  const [userPlan, setUserPlan] = useState('free_trial');
  const [memberSince, setMemberSince] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [queryHistory, setQueryHistory] = useState([]);
  const [ticketHistory, setTicketHistory] = useState([]);

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

    // Load ticket history from localStorage
    try {
      const tickets = JSON.parse(localStorage.getItem('ticketHistory') || '[]');
      setTicketHistory(tickets);
    } catch (_) {
      setTicketHistory([]);
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
          {['overview', 'credits', 'history', 'tickets'].map((tab) => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? 'Overview' : tab === 'credits' ? 'Credits' : tab === 'history' ? 'Query History' : 'Tickets'}
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
                    <span className="feature-label">{f.label}</span>
                    <span className={`feature-status ${isPaid ? 'status--active' : 'status--limited'}`}>
                      {isPaid ? 'Active' : 'Limited'}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="profile-panel-divider" />
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

              {/* Upgrade section */}
              <div className="profile-panel-divider" />
              <div className="upgrade-plan-card">
                <div className="upgrade-plan-top">
                  <span className="upgrade-plan-icon">⚡</span>
                  <div>
                    <p className="upgrade-plan-title">Upgrade Your Plan</p>
                    <p className="upgrade-plan-subtitle">Unlock unlimited credits and full feature access</p>
                  </div>
                </div>
                <ul className="upgrade-perks-list">
                  <li>✓ Unlimited credits per cycle</li>
                  <li>✓ Full access to all 7 features</li>
                  <li>✓ Priority data refresh</li>
                  <li>✓ Dedicated support</li>
                </ul>
                <button className="upgrade-cta-btn" onClick={() => window.location.href = 'mailto:sales@nexora.ai?subject=Upgrade%20Plan'}>
                  Talk to Sales
                </button>
              </div>
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

          {/* ── TICKETS TAB ── */}
          {activeTab === 'tickets' && (
            <>
              <div className="history-tab-header">
                <p className="profile-panel-section-label" style={{ margin: 0 }}>Support Tickets</p>
                {ticketHistory.length > 0 && (
                  <button
                    className="history-clear-btn"
                    onClick={() => {
                      localStorage.removeItem('ticketHistory');
                      setTicketHistory([]);
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              {ticketHistory.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-state-icon">🎫</span>
                  <p className="empty-state-text">No tickets submitted yet.</p>
                  <p className="empty-state-hint">
                    Use the "Contact Us" page to raise a support ticket. It will appear here.
                  </p>
                </div>
              ) : (
                <ul className="query-history-list">
                  {ticketHistory.map((t) => (
                    <li key={t.id} className="query-history-item">
                      <div className="query-history-top">
                        <span className="query-filter-tag">{t.category}</span>
                        <span className={`query-status-badge ${t.status === 'Resolved' ? 'status-completed' : 'status-pending'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="query-text" style={{ fontWeight: '600' }}>{t.subject}</p>
                      <p className="query-text" style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{t.message.length > 100 ? t.message.slice(0, 100) + '…' : t.message}</p>
                      <p className="query-date">{t.date}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

        </div>

        {/* Footer — Sign Out */}
        <div className="profile-panel-footer">
          <button
            className="profile-signout-btn"
            onClick={() => { onLogout && onLogout(); onClose(); }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePanel;
