import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import validateBusinessEmail from '../utils/emailValidator';
import AnimatedCounter from './AnimatedCounter';
import ClientLogosCarousel from './ClientLogosCarousel';
import nexoraLogo2 from '../assets/Nexora Logo 25 May Opt 01.svg';
import proplusLogo from '../assets/unnamed (1).png';
import gdprLogo from '../landing/gdpr-ready-logo 2.svg';
import ccpaLogo from '../landing/ccpa-1.png';
import iso27001Logo from '../landing/ISO27001-2022.svg';
import iso9001Logo from '../landing/ISO9001-2015.svg';
import soc2Logo from '../landing/SOC_2.svg';
import technoSvg from '../landing/TECHNO SS FOR LP.svg';
import intentSvg from '../landing/INtent SS revised.svg';
import riSvg from '../landing/RI SS FOR LP.svg';
import bgSvg from '../landing/UPDATED BG SS FOR LP.svg';
import ntpSvg from '../landing/NTP SS FOR LP.svg';
import heroSvg from '../landing/LP HERO UPDATED.svg';
import '../styles/landingPage.css';
import '../styles/landingPageHero.css';

// ── Enterprise-Grade B2B Intelligence section ────────────────────────────────
const sdata = [
  {
    title: 'Technographics',
    link: 'https://proplusdata.co/technographics',
    badge: '590M+ Companies',
    desc: 'Shows you what technologies companies currently use and the maturity of their technology stack. Identify upgrade opportunities and ideal timing.',
    chips: [{ t: 'Tech Stack Detection', c: 'a' }, { t: 'Vendor Mapping', c: 'b' }, { t: 'Stack Maturity Score', c: 'c' }],
    items: [
      { av: 'AG', name: 'AgileSoft Corp', tag: 'ChatGPT · AWS', badge: 'Q1 2025', bc: 'b' },
      { av: 'BS', name: 'B-Stack Solutions', tag: 'Transformers · GCP', badge: 'Q4 2024', bc: 'b' },
      { av: 'CM', name: 'Cazme', tag: 'Microsoft 365 · GCP', badge: 'Q1 2025', bc: 'y' },
    ],
  },
  {
    title: 'Renewal Intelligence',
    link: 'https://proplusdata.co/renewal-intelligence',
    badge: '530M+ Companies',
    desc: 'Identify when contracts are up for renewal, which customers might switch vendors, and who is at risk of leaving before your competitors do.',
    chips: [{ t: 'Contract Timelines', c: 'a' }, { t: 'Churn Signals', c: 'b' }, { t: 'Vendor Switch Risk', c: 'c' }],
    items: [
      { av: 'JD', name: 'Judge Direct', tag: 'Amazon RDS', badge: 'Q1 2026', bc: 'b' },
      { av: 'SK', name: 'Skin Inc.', tag: 'Google BigQuery', badge: 'Q1 2027', bc: 'y' },
      { av: 'AA', name: 'Actively AI', tag: 'Google BigQuery', badge: 'Q1 2027', bc: 'y' },
    ],
  },
  {
    title: 'Intent',
    link: 'https://proplusdata.co/intent-data',
    badge: '530M+ Companies',
    desc: "Captures behavioral signals indicating a company's interest in specific technologies, helping prioritize outreach and improve conversion efficiency.",
    chips: [{ t: 'Buying Signals', c: 'a' }, { t: 'Topic Surge', c: 'b' }, { t: 'Competitor Research', c: 'c' }],
    items: [
      { av: 'AV', name: 'Apex Ventures', tag: 'Cloud Migration · High', badge: 'Surge +42%', bc: 'b' },
      { av: 'TC', name: 'TechCorp Inc', tag: 'CRM Tools · Med', badge: '+18%', bc: 'y' },
      { av: 'DF', name: 'DataFlow Co', tag: 'Security Ops · High', badge: 'Surge +67%', bc: 'b' },
    ],
  },
  {
    title: 'Buying Group',
    link: 'https://proplusdata.co/account-intelligence-insights',
    badge: '430M+ Companies',
    desc: 'A structured group of executive Decision-Makers and high-impact Influencers within an organization who define technical and business requirements.',
    chips: [{ t: 'Decision Makers', c: 'a' }, { t: 'Influencers', c: 'b' }, { t: 'Org Chart Mapping', c: 'c' }],
    items: [
      { av: 'SC', name: 'Sarah Chen', tag: 'VP Engineering', badge: 'Decision Maker', bc: 'p' },
      { av: 'MT', name: 'Marcus T.', tag: 'IT Director', badge: 'Influencer', bc: 'y' },
      { av: 'PK', name: 'Priya K.', tag: 'CTO', badge: 'Champion', bc: 'b' },
    ],
  },
  {
    title: 'Next Tech Purchase®',
    link: 'https://proplusdata.co/next-tech-purchase',
    badge: '530M+ Companies',
    desc: 'Identifies probable next technology investments using predictive modeling and account-level intelligence signals to time your outreach perfectly.',
    chips: [{ t: 'Predictive Scoring', c: 'a' }, { t: 'Investment Signals', c: 'b' }, { t: 'Pipeline Timing', c: 'c' }],
    items: [
      { av: 'NT', name: 'NovaTech', tag: 'Cloud Security', badge: 'Score 92%', bc: 'b' },
      { av: 'DF', name: 'DataFirst', tag: 'AI/ML Platform', badge: 'Score 88%', bc: 'b' },
      { av: 'SO', name: 'ScaleOps', tag: 'DevOps Tools', badge: 'Score 81%', bc: 'y' },
    ],
  },
];

const chipClass = { a: 'st-chip-a', b: 'st-chip-b', c: 'st-chip-c' };
const badgeClass = { b: 'st-badge-b', y: 'st-badge-y', p: 'st-badge-p' };

const EnterpriseIntel = () => {
  const [cur, setCur] = useState(0);
  const d = sdata[cur];
  return (
    <div className="st-wrap">
      <div className="st-head">
        <h2>
          <span className="st-head-blue">Enterprise-Grade</span><br />
          <span className="st-head-serif">B2B Intelligence</span>
        </h2>
      </div>
      <div className="st-layout">
        {/* Steps sidebar */}
        <div className="st-steps">
          {sdata.map((s, i) => (
            <div
              key={i}
              className={`st-step${cur === i ? ' act' : ''}`}
              onClick={() => setCur(i)}
            >
              <div className="st-num">{i + 1}</div>
              <div className="st-step-text">
                <div className="st-step-name">{s.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content panel */}
        <div className="st-content">
          <div className="st-content-top">
            <div className="st-ct-header">
              <div className="st-ct-title">
                {d.link ? (
                  <a
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid rgba(15,31,61,0.25)' }}
                  >
                    {d.title}
                  </a>
                ) : d.title}
              </div>
            </div>
            <div className="st-ct-desc">{d.desc}</div>
            <div className="st-ct-chips">
              {d.chips.map((c, i) => (
                <span key={i} className={`st-chip ${chipClass[c.c]}`}>{c.t}</span>
              ))}
            </div>
          </div>
          <div className="st-mock-mini">
            <div className="st-mock-head">
              <div className="st-mock-dots2">
                <div className="st-mock-dot2" />
                <div className="st-mock-dot2" />
                <div className="st-mock-dot2" />
              </div>
              <span>{d.title}</span>
            </div>
            {cur === 0 ? (
              <div className="st-table-wrap">
                <table className="st-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Industry</th>
                      <th>Region</th>
                      <th>Employee Size</th>
                      <th>Revenue</th>
                      <th>Technology</th>
                      <th>Previous Detected</th>
                      <th>Latest Detected</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="st-co-name">ABC Corp</span></td>
                      <td>IT Services</td>
                      <td>🇺🇸 USA</td>
                      <td>201–500</td>
                      <td>$43.4 M+</td>
                      <td><span className="st-tech-tag">AWS</span></td>
                      <td><span className="st-badge-sm st-badge-prev">Q4 2023</span></td>
                      <td><span className="st-badge-sm st-badge-b">Q1 2025</span></td>
                    </tr>
                    <tr>
                      <td><span className="st-co-name">XYZ Solutions</span></td>
                      <td>Marketing</td>
                      <td>🇬🇧 UK</td>
                      <td>51–200</td>
                      <td>$16 M</td>
                      <td><span className="st-tech-tag">Azure</span></td>
                      <td><span className="st-badge-sm st-badge-prev">Q2 2023</span></td>
                      <td><span className="st-badge-sm st-badge-y">Q4 2024</span></td>
                    </tr>
                    <tr>
                      <td><span className="st-co-name">DEF Ventures</span></td>
                      <td>Finance</td>
                      <td>🇮🇳 India</td>
                      <td>1001–5000</td>
                      <td>$120 M+</td>
                      <td><span className="st-tech-tag">GCP</span></td>
                      <td><span className="st-badge-sm st-badge-prev">Q3 2023</span></td>
                      <td><span className="st-badge-sm st-badge-b">Q1 2025</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : cur === 1 ? (
              <div className="st-table-wrap">
                <table className="st-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Industry</th>
                      <th>Region</th>
                      <th>Product</th>
                      <th>Renewal Timelines</th>
                      <th>Renewal Tracker</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="st-co-name">ABC Corp</span></td>
                      <td>IT Services</td>
                      <td>🇺🇸 USA</td>
                      <td>Amazon Aurora</td>
                      <td><span className="st-badge-sm st-badge-b">Q2 2026</span></td>
                      <td><span className="st-renewal-tracker">&lt;1 year</span></td>
                    </tr>
                    <tr>
                      <td><span className="st-co-name">XYZ Solutions</span></td>
                      <td>Marketing</td>
                      <td>🇬🇧 UK</td>
                      <td>ChatGPT</td>
                      <td><span className="st-badge-sm st-badge-b">Q2 2026</span></td>
                      <td><span className="st-renewal-tracker">&lt;1 year</span></td>
                    </tr>
                    <tr>
                      <td><span className="st-co-name">DEF Ventures</span></td>
                      <td>Finance</td>
                      <td>🇮🇳 India</td>
                      <td>Microsoft 365</td>
                      <td><span className="st-badge-sm st-badge-y">Q4 2026</span></td>
                      <td><span className="st-renewal-tracker st-renewal-tracker--far">1–2 years</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : cur === 2 ? (
              <div className="st-table-wrap">
                <table className="st-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Industry</th>
                      <th>Region</th>
                      <th>Intent Status</th>
                      <th>Intent Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="st-co-name">ABC Corp</span></td>
                      <td>IT Services</td>
                      <td>🇺🇸 USA</td>
                      <td><span className="st-badge-sm st-badge-b">Active</span></td>
                      <td>
                        <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
                          <rect x="0" y="10" width="5" height="8" rx="1" fill="#10b981"/>
                          <rect x="7" y="6" width="5" height="12" rx="1" fill="#10b981"/>
                          <rect x="14" y="2" width="5" height="16" rx="1" fill="#10b981"/>
                          <rect x="21" y="0" width="5" height="18" rx="1" fill="#10b981"/>
                        </svg>
                      </td>
                    </tr>
                    <tr>
                      <td><span className="st-co-name">XYZ Solutions</span></td>
                      <td>Marketing</td>
                      <td>🇬🇧 UK</td>
                      <td><span className="st-badge-sm st-badge-y">Moderate</span></td>
                      <td>
                        <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
                          <rect x="0" y="10" width="5" height="8" rx="1" fill="#f59e0b"/>
                          <rect x="7" y="6" width="5" height="12" rx="1" fill="#f59e0b"/>
                          <rect x="14" y="2" width="5" height="16" rx="1" fill="#e5e7eb"/>
                          <rect x="21" y="0" width="5" height="18" rx="1" fill="#e5e7eb"/>
                        </svg>
                      </td>
                    </tr>
                    <tr>
                      <td><span className="st-co-name">DEF Ventures</span></td>
                      <td>Finance</td>
                      <td>🇮🇳 India</td>
                      <td><span className="st-badge-sm st-badge-b">Active</span></td>
                      <td>
                        <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
                          <rect x="0" y="10" width="5" height="8" rx="1" fill="#10b981"/>
                          <rect x="7" y="6" width="5" height="12" rx="1" fill="#10b981"/>
                          <rect x="14" y="2" width="5" height="16" rx="1" fill="#10b981"/>
                          <rect x="21" y="0" width="5" height="18" rx="1" fill="#10b981"/>
                        </svg>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : cur === 3 ? (
              <div className="st-org-wrap">
                {/* Root node */}
                <div className="st-org-row st-org-row--top">
                  <div className="st-org-card st-org-card--dm">
                    <div className="st-org-strip st-org-strip--dm" />
                    <div className="st-org-avatar" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>SC</div>
                    <div className="st-org-info">
                      <span className="st-org-badge st-org-badge--dm">Decision Maker</span>
                      <p className="st-org-name">Sarah Chen</p>
                      <p className="st-org-role">CEO</p>
                    </div>
                  </div>
                </div>
                {/* Connector */}
                <div className="st-org-connector">
                  <div className="st-org-line-v" />
                  <div className="st-org-line-h" />
                </div>
                {/* Children */}
                <div className="st-org-row st-org-row--children">
                  <div className="st-org-card st-org-card--dm">
                    <div className="st-org-strip st-org-strip--dm" />
                    <div className="st-org-avatar" style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>MJ</div>
                    <div className="st-org-info">
                      <span className="st-org-badge st-org-badge--dm">DM</span>
                      <p className="st-org-name">Mark J.</p>
                      <p className="st-org-role">CTO</p>
                    </div>
                  </div>
                  <div className="st-org-card st-org-card--inf">
                    <div className="st-org-strip st-org-strip--inf" />
                    <div className="st-org-avatar" style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>LT</div>
                    <div className="st-org-info">
                      <span className="st-org-badge st-org-badge--inf">Inf</span>
                      <p className="st-org-name">Lori T.</p>
                      <p className="st-org-role">CMO</p>
                    </div>
                  </div>
                  <div className="st-org-card st-org-card--inf">
                    <div className="st-org-strip st-org-strip--inf" />
                    <div className="st-org-avatar" style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)' }}>PK</div>
                    <div className="st-org-info">
                      <span className="st-org-badge st-org-badge--inf">Inf</span>
                      <p className="st-org-name">Priya K.</p>
                      <p className="st-org-role">VP Sales</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : cur === 4 ? (
              <div className="st-table-wrap">
                <table className="st-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Industry</th>
                      <th>Region</th>
                      <th>Technology</th>
                      <th>Purchase Prediction</th>
                      <th>Purchase Propensity (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="st-co-name">ABC Corp</span></td>
                      <td>IT Services</td>
                      <td>🇺🇸 USA</td>
                      <td>Google Gemini</td>
                      <td><span className="st-badge-sm st-badge-b">High</span></td>
                      <td><span className="st-propensity">89.73%</span></td>
                    </tr>
                    <tr>
                      <td><span className="st-co-name">XYZ Solutions</span></td>
                      <td>Marketing</td>
                      <td>🇬🇧 UK</td>
                      <td>Snowflake</td>
                      <td><span className="st-badge-sm st-badge-b">High</span></td>
                      <td><span className="st-propensity">86.78%</span></td>
                    </tr>
                    <tr>
                      <td><span className="st-co-name">DEF Ventures</span></td>
                      <td>Finance</td>
                      <td>🇮🇳 India</td>
                      <td>HubSpot</td>
                      <td><span className="st-badge-sm st-badge-y">Medium</span></td>
                      <td><span className="st-propensity st-propensity--med">75.66%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="st-mock-content">
                {d.items.map((it, i) => (
                  <div key={i} className="st-mock-item">
                    <div className="st-mi-left">
                      <div className="st-mi-avatar">{it.av}</div>
                      <div>
                        <div className="st-mi-name">{it.name}</div>
                        <div className="st-mi-tag">{it.tag}</div>
                      </div>
                    </div>
                    <div className="st-mi-right">
                      <span className={`st-badge-sm ${badgeClass[it.bc]}`}>{it.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Scroll-jacked stats section ──────────────────────────────────────────────
const StatsScrollSection = ({ stats }) => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animDir, setAnimDir] = useState('down');
  const [animKey, setAnimKey] = useState(0);
  const prevIndex = useRef(0);
  const isActive = useRef(false); // true when section is fully in viewport

  // Scroll the internal track to the right slide
  const scrollTrackTo = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ top: idx * track.clientHeight, behavior: 'smooth' });
  };

  // Watch internal track scroll → update active index + animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onTrackScroll = () => {
      const idx = Math.round(track.scrollTop / track.clientHeight);
      if (idx !== prevIndex.current) {
        setAnimDir(idx > prevIndex.current ? 'down' : 'up');
        setAnimKey(k => k + 1);
        setActiveIndex(idx);
        prevIndex.current = idx;
      }
    };
    track.addEventListener('scroll', onTrackScroll, { passive: true });
    return () => track.removeEventListener('scroll', onTrackScroll);
  }, []);

  // Intercept wheel when section is in view — feed into internal track
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // IntersectionObserver to know when section fills viewport
    const io = new IntersectionObserver(
      ([entry]) => { isActive.current = entry.intersectionRatio >= 0.99; },
      { threshold: 0.99 }
    );
    io.observe(section);

    const onWheel = (e) => {
      if (!isActive.current) return;
      const atTop = track.scrollTop <= 2;
      const atBottom = track.scrollTop >= track.scrollHeight - track.clientHeight - 10;
      // Only release to page when at the boundary in that direction
      if (e.deltaY < 0 && atTop) return;   // scrolling up at first stat → let page scroll up
      if (e.deltaY > 0 && atBottom) return; // scrolling down at last stat → let page scroll down
      // Otherwise trap the scroll inside the track
      e.preventDefault();
      track.scrollBy({ top: e.deltaY * 2, behavior: 'smooth' });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      io.disconnect();
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  const stat = stats[activeIndex];

  return (
    <section ref={sectionRef} className="stats-scroll-section">
      {/* Watermark */}
      <div className="stats-bg-label">Quality at scale</div>

      {/* Internal scroll track */}
      <div ref={trackRef} className="stats-track">
        {stats.map((s, i) => (
          <div key={i} className="stats-track-slide">
            <div
              className={`stats-slide-content${i === activeIndex ? ' visible' : ''}`}
              style={{
                animation: i === activeIndex
                  ? `${animDir === 'down' ? 'slideFromBottom' : 'slideFromTop'} 0.5s cubic-bezier(0.22,1,0.36,1) both`
                  : 'none'
              }}
            >
              <div className="stats-slide-number">
                <AnimatedCounter value={s.number} duration={700} />
              </div>
              <p className="stats-slide-sub">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Wave decoration */}
      <div className="stats-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 C240,110 480,10 720,60 C960,110 1200,10 1440,60 L1440,120 L0,120 Z" fill="rgba(37,99,235,0.18)" />
          <path d="M0,80 C300,30 600,100 900,60 C1100,35 1300,90 1440,70 L1440,120 L0,120 Z" fill="rgba(37,99,235,0.1)" />
        </svg>
      </div>
    </section>
  );
};

// ── Nexora Copilot animated demo ─────────────────────────────────────────────
const ROWS = [
  { label: 'Domain', value: 'xyztech.com', cls: '' },
  { label: 'Technology', value: 'AWS', cls: 'copilot-intel-val--bold' },
  { label: 'Category', value: 'Cloud', cls: 'copilot-intel-val--bold' },
  { label: 'Purchase Prediction', value: 'High', cls: 'copilot-intel-val--high' },
  { label: 'Probability', value: '72%', cls: 'copilot-intel-val--prob' },
];

const ANALYSIS = 'XYZ Technologies shows strong signals for cloud infrastructure expansion. Recent DevOps hiring and cloud migration case studies indicate active modernization. Multi-cloud strategy signals suggest AWS evaluation alongside existing platforms.';

// step 0 = blank, 1 = user bubble, 2 = card header, 3-7 = rows, 8 = analysis, 9 = 2nd user, 10 = typing
const TOTAL_STEPS = 11;
const DELAYS = [0, 600, 1400, 2000, 2400, 2800, 3200, 3600, 4200, 5200, 6000];

const CopilotDemo = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = DELAYS.map((delay, i) =>
      setTimeout(() => setStep(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="copilot-chat">
      <div className="copilot-chat-header">
        <div className="copilot-chat-dots">
          <span style={{ background: '#ef4444' }} />
          <span style={{ background: '#f59e0b' }} />
          <span style={{ background: '#22c55e' }} />
        </div>
        <span className="copilot-chat-title">Nexora Copilot</span>
        <span className="copilot-chat-badge">AI</span>
      </div>

      <div className="copilot-chat-body">
        {/* Step 1 — user bubble */}
        {step >= 1 && (
          <div className="copilot-msg copilot-msg--user copilot-fade-in">
            Looking at XYZ Technologies...
          </div>
        )}

        {/* Step 2+ — AI card */}
        {step >= 2 && (
          <div className="copilot-msg copilot-msg--ai copilot-fade-in">
            <div className="copilot-ai-label">
              <span className="copilot-ai-dot" />
              Nexora Co-pilot
            </div>
            <div className="copilot-intel-card">
              <div className="copilot-intel-header">
                <span className="copilot-intel-num">1</span>
                <span className="copilot-intel-name">XYZ Technologies</span>
              </div>
              <div className="copilot-intel-divider" />
              <div className="copilot-intel-rows">
                {ROWS.map((row, i) =>
                  step >= i + 3 ? (
                    <div key={row.label} className="copilot-intel-row copilot-fade-in">
                      <span className="copilot-intel-label">{row.label}</span>
                      <span className={`copilot-intel-val ${row.cls}`}>{row.value}</span>
                    </div>
                  ) : (
                    <div key={row.label} className="copilot-intel-row copilot-row-skeleton">
                      <span className="copilot-skeleton-bar" style={{ width: '40%' }} />
                      <span className="copilot-skeleton-bar" style={{ width: '25%' }} />
                    </div>
                  )
                )}
              </div>
              {step >= 8 && (
                <>
                  <div className="copilot-intel-divider" />
                  <div className="copilot-intel-analysis copilot-fade-in">
                    <div className="copilot-intel-analysis-title">📊 Analysis</div>
                    <p className="copilot-intel-analysis-body">{ANALYSIS}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 9 — second user bubble */}
        {step >= 9 && (
          <div className="copilot-msg copilot-msg--user copilot-fade-in" style={{ opacity: 0.7 }}>
            Show renewal risk for XYZ Technologies
          </div>
        )}

        {/* Step 10 — typing */}
        {step >= 10 && (
          <div className="copilot-msg copilot-msg--ai copilot-fade-in">
            <div className="copilot-ai-label">
              <span className="copilot-ai-dot" />
              Nexora Co-pilot
            </div>
            <div className="copilot-typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <div className="copilot-chat-input">
        <span className="copilot-input-placeholder"></span>
        <button className="copilot-send-btn" aria-label="Send">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [emailError, setEmailError] = useState('');

  // Scroll-reveal for stats
  useEffect(() => {
    const items = document.querySelectorAll('.stats-scroll-item');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.3 }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const handleStartFreeTrial = async () => {
    const validation = validateBusinessEmail(email);
    if (!validation.valid) {
      setEmailError(validation.message);
      return;
    }
    setEmailError('');
    setSubmitting(true);
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: email.split('@')[0], source: 'Landing Page - Hero' })
      });
    } catch (err) {
      // show modal regardless
    } finally {
      setSubmitting(false);
      setEmail('');
      setShowModal(true);
    }
  };

  const features = [
    {
      id: 1,
      title: 'Technographics',
      description: 'Shows you what technologies companies currently use, and the maturity of their technology stack. ',
      link: 'https://proplusdata.co/technographics',
      image: technoSvg
    },
    {
      id: 2,
      title: 'Renewal Intelligence',
      description: 'Identify when contracts are up for renewal, which customers might switch vendors, and who is at risk of leaving.',
      link: 'https://proplusdata.co/renewal-intelligence',
      image: riSvg
    },
    {
      id: 3,
      title: 'Intent',
      description: 'Intent data captures behavioral signals that indicate a company\'s interest in specific technologies or solutions, helping prioritize outreach and improve conversion efficiency.',
      link: 'https://proplusdata.co/intent-data',
      image: intentSvg
    },
    {
      id: 4,
      title: 'Buying Group',
      description: 'A structured group of executive Decision-Makers and high-impact Influencers within an organization who define technical and business requirements',
      link: null,
      image: bgSvg
    },
    {
      id: 5,
      title: 'Next Tech Purchase® - NTP®',
      description: 'Identifies probable next technology investments using predictive modeling and account-level intelligence signals.',
      link: 'https://proplusdata.co/next-tech-purchase',
      image: ntpSvg
    }
  ];

  const stats = [
    { number: '600M+', label: 'Total Companies' },
    { number: '590M+', label: 'Technographics' },
    { number: '530M+', label: 'Renewal Intelligence' },
    { number: '530M+', label: 'Intent' },
    { number: '430M+', label: 'Buying Group' },
    { number: '530M+', label: 'Next Tech Purchase®' }
  ];

  const faqs = [
    {
      id: 1,
      question: 'What is Nexora?',
      answer: 'Nexora is a comprehensive AI Powered B2B data platform that provides real-time technographics, intent signals, and buying group intelligence to help you identify high-fit accounts and predict technology adoption.'
    },
    {
      id: 2,
      question: 'Who can use Nexora?',
      answer: 'Nexora is designed for sales, marketing, and revenue operations teams at B2B companies of all sizes. Whether you\'re a startup or an enterprise, Nexora helps you scale your go-to-market motions.'
    },
    {
      id: 3,
      question: 'Is Nexora Free?',
      answer: 'Nexora offers flexible pricing options based on your business needs. You may get free credits to explore the platform initially. After that, pricing depends on factors such as: Credit usage, Data access requirements, Credit score usage, Feature access (Intent, Technographics, etc.). This ensures you only pay for what you actually use.'
    },
    {
      id: 4,
      question: 'Is Nexora Secure?',
      answer: 'Yes, Nexora is built with strong security and data protection standards. Nexora is a product of ProPlus Data, a trusted and certified data solutions company. ProPlus Data follows industry-standard security, compliance, and data protection practices to ensure your information remains safe and secure. This means: Secure data handling, Compliance with data protection standards, Reliable and trusted infrastructure. Your data privacy and security are always a top priority.'
    },
    // {
    //   id: 3,
    //   question: 'Is Nexora an AI-powered platform?',
    //   answer: 'Yes, Nexora leverages advanced AI and machine learning algorithms to analyze vast amounts of data and provide predictive insights about technology adoption and buying signals.'
    // },
    // {
    //   id: 4,
    //   question: 'How does Nexora get its data?',
    //   answer: 'Nexora aggregates data from multiple sources including public records, web signals, technology signals, and proprietary data sources to provide comprehensive B2B intelligence.'
    // },
    // {
    //   id: 5,
    //   question: 'How is Nexora different from other GTM tools?',
    //   answer: 'Nexora combines technographics, intent data, and buying group intelligence in one unified platform. Our AI-powered insights help you identify the right accounts and the right people to reach.'
    // },
    {
      id: 6,
      question: 'Can I try Nexora before buying?',
      answer: 'Absolutely! We offer a free trial so you can explore Nexora\'s features and see how it can help your team. Sign up today to get started.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo-section">
            <img src={nexoraLogo2} alt="Nexora" className="header-logo" style={{ height: '45px' }} />
          </div>
          <a
            href="https://proplusdata.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="header-proplus-link"
          >
            <img src={proplusLogo} alt="ProPlus Data" className="header-proplus-logo" />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" style={{ position: 'relative' }}>
        <button
          className="hero-login-btn"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
        <div className="hero-wrapper">
          <div className="hero-content">
            <h1 className="hero-title">
              The Timing Layer for<br />
              <span className="hero-title-accent">Predictable Revenue</span>
            </h1>
            <p className="hero-subtitle">
              GTM AI platform, makes revenue predictable,revealing what’s next, the right stakeholders to engage, and exactly when to act.
            </p>
            <div className="hero-cta">
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  type="email"
                  placeholder="Enter your business email"
                  className="email-input"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartFreeTrial()}
                  style={emailError ? { borderColor: '#ef4444' } : {}}
                />
                {emailError && (
                  <span style={{ fontSize: '0.78rem', color: '#ef4444', paddingLeft: '4px' }}>
                    {emailError}
                  </span>
                )}
              </div>
              <button
                className="btn-free-trial"
                onClick={handleStartFreeTrial}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Start Free Trial →'}
              </button>
            </div>
            <div className="hero-social-proof">
              <div className="hero-avatars">
                <span className="hero-avatar" style={{ background: '#2563eb' }}>JR</span>
                <span className="hero-avatar" style={{ background: '#16a34a' }}>MK</span>
                <span className="hero-avatar" style={{ background: '#d97706' }}>AL</span>
                <span className="hero-avatar" style={{ background: '#7c3aed' }}>PT</span>
              </div>
              <p className="hero-social-text">
                Data trusted by <strong>2,400+</strong> revenue teams at AWS, Cisco, Siemens, Adobe &amp; more
              </p>
            </div>
          </div>
        </div>

        {/* Top-right nav buttons moved to header */}
      </section>

      {/* Client Logos Carousel */}
      <ClientLogosCarousel />

      {/* Features Section — Enterprise Intel */}
      <section id="features" className="features-section">
        <EnterpriseIntel />
      </section>

      {/* Stats Section — scroll-jacked */}
      <StatsScrollSection stats={stats} />

      {/* What Makes Us Different Section */}
      <section className="difference-section">
        <div className="d1">
          <div className="d1-top">
            <div>
              <div className="d1-eyebrow">Why Nexora</div>
              <div className="d1-h2">Here's what makes<br />us <span>different</span></div>
            </div>
            <div className="d1-desc">
              Find and close your next customer before your competitors do with our all-in-one platform that tells you who to reach and how to reach them. With Nexora, you can unite sales and marketing teams around a single source of truth.
            </div>
          </div>
          <div className="d1-cards">
            <div className="d1-card">
              <div className="d1-icon"><i className="ti ti-shield-check" aria-hidden="true" /></div>
              <h3>Strategic Imperative</h3>
              <p>Build the standard. We are creating the most trusted intelligence engine for enterprise technology decisions.</p>
              <div className="d1-card-num">01</div>
            </div>
            <div className="d1-card">
              <div className="d1-icon"><i className="ti ti-chart-arrows-vertical" aria-hidden="true" /></div>
              <h3>Change how teams sell</h3>
              <p>We help teams stop reacting to the past and start anticipating future revenue with predictive signals.</p>
              <div className="d1-card-num">02</div>
            </div>
            <div className="d1-card">
              <div className="d1-icon"><i className="ti ti-topology-star-3" aria-hidden="true" /></div>
              <h3>Unite your organization</h3>
              <p>We align Revenue teams with one shared view of what comes next.</p>
              <div className="d1-card-num">03</div>
            </div>
          </div>
        </div>
      </section>

      {/* Nexora Co-pilot Section */}
      <section className="copilot-section">
        <div className="copilot-inner">
          {/* Left — text */}
          <div className="copilot-text">
            <div className="copilot-eyebrow">
              <span className="copilot-eyebrow-dot" />
              Introducing
            </div>
            <h2 className="copilot-title">
              Meet your<br />
              <span className="copilot-title-accent">GTM Co-pilot</span>
            </h2>
            <p className="copilot-desc">
              Nexora Co-pilot is your always-on AI assistant built directly into the platform. Type any company name and instantly get their technology stack, purchase prediction, probability score.
            </p>
            <ul className="copilot-bullets">
              <li><span className="copilot-bullet-icon">🔍</span><span>Search any company by name — get domain, tech stack & category instantly</span></li>
              <li><span className="copilot-bullet-icon">🎯</span><span>Purchase prediction (High / Medium / Low) with a probability score</span></li>
              <li><span className="copilot-bullet-icon">📊</span><span>Plain-English AI analysis explaining why the signal is strong</span></li>
              <li><span className="copilot-bullet-icon">🛡️</span><span>Powered by verified technographic data no guesswork, no hallucinations</span></li>
            </ul>
            <button className="copilot-cta" onClick={() => navigate('/login')}>
              Try for free
            </button>
          </div>

          {/* Right — animated demo */}
          <div className="copilot-visual">
            <CopilotDemo />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-glass-container">
          <div className="cta-content">
            <h2>Try Nexora <span className="cta-free-word">free</span>.<br /><span className="cta-sub">No credit card required.</span></h2>
          </div>
        </div>
        <div className="cta-wave">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,100 C240,200 480,0 720,100 C960,200 1200,0 1440,100 L1440,200 L0,200 Z" fill="rgba(37,99,235,0.45)" />
            <path d="M0,130 C300,30 600,180 900,110 C1100,65 1300,160 1440,120 L1440,200 L0,200 Z" fill="rgba(37,99,235,0.28)" />
          </svg>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-header">
          <h2>Testimonals</h2>
          <p>See what GTM leaders are saying about Nexora</p>
        </div>
        <div className="testimonials-track-wrapper">
          <div className="testimonials-track">
            {[
              { name: 'Sarah M.', role: 'VP of Sales', badge: 'G2 Verified', stars: 5, text: 'Nexora completely transformed how we prioritize accounts. The renewal intelligence alone saved us from losing three major contracts last quarter.' },
              { name: 'James R.', role: 'Head of RevOps', badge: 'Verified User', stars: 5, text: 'The technographics data is incredibly accurate. We\'ve been able to target the right buyers at exactly the right time in their buying journey.' },
              { name: 'Priya K.', role: 'Director of Demand Gen', badge: 'G2 Verified', stars: 5, text: 'Intent signals from Nexora are far more actionable than anything we\'ve used before. Our pipeline velocity has increased by 40% since we started.' },
              { name: 'Michael T.', role: 'Chief Revenue Officer', badge: 'Verified User', stars: 5, text: 'Finally a platform that brings together all the data signals we need in one place. The NTP predictions are scarily accurate.' },
              { name: 'Aisha L.', role: 'ABM Manager', badge: 'G2 Verified', stars: 5, text: 'The buying group intelligence helped us identify the full decision-making unit at our top accounts. Game changer for our ABM strategy.' },
              { name: 'David C.', role: 'Sales Operations Lead', badge: 'Verified User', stars: 4, text: 'Nexora\'s data quality is exceptional. Clean, enriched, and always up to date. Our reps spend less time researching and more time selling.' },
            ].concat([
              { name: 'Sarah M.', role: 'VP of Sales', badge: 'G2 Verified', stars: 5, text: 'Nexora completely transformed how we prioritize accounts. The renewal intelligence alone saved us from losing three major contracts last quarter.' },
              { name: 'James R.', role: 'Head of RevOps', badge: 'Verified User', stars: 5, text: 'The technographics data is incredibly accurate. We\'ve been able to target the right buyers at exactly the right time in their buying journey.' },
              { name: 'Priya K.', role: 'Director of Demand Gen', badge: 'G2 Verified', stars: 5, text: 'Intent signals from Nexora are far more actionable than anything we\'ve used before. Our pipeline velocity has increased by 40% since we started.' },
              { name: 'Michael T.', role: 'Chief Revenue Officer', badge: 'Verified User', stars: 5, text: 'Finally a platform that brings together all the data signals we need in one place. The NTP predictions are scarily accurate.' },
              { name: 'Aisha L.', role: 'ABM Manager', badge: 'G2 Verified', stars: 5, text: 'The buying group intelligence helped us identify the full decision-making unit at our top accounts. Game changer for our ABM strategy.' },
              { name: 'David C.', role: 'Sales Operations Lead', badge: 'Verified User', stars: 4, text: 'Nexora\'s data quality is exceptional. Clean, enriched, and always up to date. Our reps spend less time researching and more time selling.' },
            ]).map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-quote">❝</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-footer">
                  <div className="testimonial-avatar">{t.name.split(' ').map(n => n[0]).join('')}</div>
                  <span className="testimonial-badge">{t.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="faq-accordion">
          <div className="accordion-left-faq">
            <div className="faq-header">
              <h2 className="faq-title">
                Frequently<br />
                <span className="faq-title-accent">Asked</span><br />
                Questions
              </h2>
              <p className="faq-subtitle">Find answers about Nexora and how it powers your GTM team.</p>
              <span className="faq-count">0{faqs.length} questions</span>
            </div>
          </div>
          <div className="accordion-right-faq">
            {faqs.map((faq, idx) => (
              <div key={faq.id} className="accordion-item-faq">
                <button
                  className={`accordion-header-faq ${expandedFaq === faq.id ? 'active' : ''}`}
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <span className="accordion-num-faq">0{idx + 1}</span>
                  <span className="accordion-title-faq">{faq.question}</span>
                  <span className="accordion-toggle-faq">
                    {expandedFaq === faq.id ? '−' : '+'}
                  </span>
                </button>
                {expandedFaq === faq.id && (
                  <div className="accordion-content-faq">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo-section">
              <img src={nexoraLogo2} alt="Nexora" className="footer-logo" />
            </div>

            <div className="footer-left">
              <p className="footer-desc">Empowering go-to-market teams with real-time B2B intelligence and predictive insights.</p>
              <div className="footer-socials">
                <a href="https://www.linkedin.com/company/proplus-data/" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-certifications-right">
              <div className="footer-cert-logos">
                <div className="footer-cert-item">
                  <img src={gdprLogo} alt="GDPR Ready" title="GDPR Ready" />
                </div>
                <div className="footer-cert-item">
                  <img src={ccpaLogo} alt="CCPA Compliant" title="CCPA Compliant" />
                </div>
                <div className="footer-cert-item">
                  <img src={iso9001Logo} alt="ISO 9001:2015" title="ISO 9001:2015" />
                </div>
                <div className="footer-cert-item">
                  <img src={iso27001Logo} alt="ISO 27001:2022" title="ISO 27001:2022" />
                </div>
                <div className="footer-cert-item">
                  <img src={soc2Logo} alt="SOC 2 Certified" title="SOC 2 Certified" />
                </div>
              </div>
            </div>
          </div>

          <div className="footer-divider-line"></div>

          <div className="footer-bottom">
            <p className="footer-copyright">&copy; 2026 Nexora. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Thank You Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-simple" 
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="modal-text">
              <h2 className="modal-title">Thank you.</h2>
              <p className="modal-message">
                <strong>Your request is now in motion.</strong><br />
                Our team will reach out shortly with the next steps.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
