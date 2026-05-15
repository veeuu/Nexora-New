import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import nexoraLogo2 from '../assets/Nexora Logo (2)-cropped.svg';
import proplusDataLogo from '../assets/unnamed (1).png';
import gdprLogo from '../landing/gdpr-ready-logo 2.svg';
import ccpaLogo from '../landing/ccpa-1.png';
import iso27001Logo from '../landing/ISO27001-2022.svg';
import iso9001Logo from '../landing/ISO9001-2015.svg';
import soc2Logo from '../landing/SOC_2.svg';
import '../styles/landingPage.css';
import '../styles/pricing.css';

const monthlyCredits = [
  { label: '500 Credits / mo', value: 500, price: 0 },
  { label: '1,000 Credits / mo', value: 1000, price: 29 },
  { label: '2,500 Credits / mo', value: 2500, price: 59 },
  { label: '5,000 Credits / mo', value: 5000, price: 99 },
  { label: '10,000 Credits / mo', value: 10000, price: 179 },
];

const addOnCredits = [
  { label: '250 Add-On Credits', value: 250, price: 15 },
  { label: '500 Add-On Credits', value: 500, price: 25 },
  { label: '1,000 Add-On Credits', value: 1000, price: 45 },
  { label: '2,500 Add-On Credits', value: 2500, price: 99 },
];

const enterpriseCredits = [
  { label: '25,000 Credits / mo', value: 25000 },
  { label: '50,000 Credits / mo', value: 50000 },
  { label: '100,000+ Credits / mo', value: 100000 },
  { label: 'Custom Volume', value: 0 },
];

const freeFeatures = [
  'Access to all 5 data modules',
  'Technographics',
  'Renewal Intelligence',
  'Intent Data',
  'Buying Group',
  'NTP® (Next Tech Purchase)',
  'No credit card required',
  'Unlimited team seats',
];

const proFeatures = [
  'Everything in Free',
  'Priority data refresh',
  'CSV & API export',
  'CRM integrations',
  'Dedicated onboarding',
  'Advanced filters & segmentation',
  'Usage analytics dashboard',
];

const enterpriseFeatures = [
  'Everything in Pro',
  'Custom data pipelines',
  'SLA-backed uptime',
  'SSO & advanced security',
  'Custom integrations',
  'Dedicated account manager',
  'White-glove onboarding',
  'Volume discounts',
];

export default function Pricing() {
  const navigate = useNavigate();
  const [proMonthly, setProMonthly] = useState('');
  const [proAddOn, setProAddOn] = useState('');
  const [entCredits, setEntCredits] = useState('');

  const selectedMonthly = monthlyCredits.find((c) => c.value === Number(proMonthly));
  const selectedAddOn = addOnCredits.find((c) => c.value === Number(proAddOn));
  const basePrice = 79;
  const totalPrice = basePrice + (selectedMonthly?.price || 0) + (selectedAddOn?.price || 0);

  return (
    <div className="pricing-page">
      {/* Header */}
      <header className="pricing-header">
        <div className="pricing-header-inner">
          <img
            src={nexoraLogo2}
            alt="Nexora"
            className="pricing-logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.82rem', color: '#a0a0a0', fontWeight: '500' }}>Powered by</span>
            <a href="https://proplusdata.co/" target="_blank" rel="noopener noreferrer">
              <img src={proplusDataLogo} alt="ProPlus Data" style={{ height: '32px', objectFit: 'contain' }} />
            </a>
          </div>
          <div className="pricing-header-btns">
            <button className="pricing-btn-ghost" onClick={() => navigate('/')}>
              Home
            </button>
            <button className="pricing-btn-solid" onClick={() => navigate('/login')}>
              Log In
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pricing-hero">
        {/* <div className="pricing-hero-eyebrow">Simple, transparent pricing</div> */}
        <h1 className="pricing-hero-title">
          Pay for what
          <br />
          <span className="pricing-hero-accent">you actually use.</span>
        </h1>
        <p className="pricing-hero-sub">
          No per-seat fees. No hidden costs. Start free and scale as your team grows.
        </p>
      </section>

      {/* Cards */}
      <section className="pricing-cards-section">
        <div className="pricing-cards">
          {/* Free */}
          <div className="pricing-card pricing-card--free">
            <div className="pricing-card-top">
              <div className="pricing-plan-label">Free</div>
              <div className="pricing-price">
                <span className="pricing-amount">$0</span>
                <span className="pricing-period">/month</span>
              </div>
              <p className="pricing-desc">Perfect for trying Nexora with your entire team</p>
            </div>

            <div className="pricing-card-mid">
              <div className="pricing-credit-note">No credit card required</div>
            </div>

            <ul className="pricing-features">
              {freeFeatures.map((f, i) => (
                <li key={i}>
                  <span className="pricing-check">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button className="pricing-cta pricing-cta--free" onClick={() => navigate('/login')}>
              Get started free →
            </button>
          </div>

          {/* Pro */}
          <div className="pricing-card pricing-card--pro">
            <div className="pricing-popular-badge">Most Popular</div>
            <div className="pricing-card-top">
              <div className="pricing-plan-label">Pro</div>
              <div className="pricing-price">
                <span className="pricing-amount">${totalPrice}</span>
                <span className="pricing-period">/month</span>
              </div>
              <p className="pricing-desc">Ideal for teams ready to scale without per-seat costs.</p>
            </div>

            <div className="pricing-card-mid">
              <div className="pricing-select-group">
                <label className="pricing-select-label">Monthly Credits</label>
                <select
                  className="pricing-select"
                  value={proMonthly}
                  onChange={(e) => setProMonthly(e.target.value)}
                >
                  <option value="">Select Credits</option>
                  {monthlyCredits.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                      {c.price > 0 ? ` (+$${c.price})` : ' (included)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pricing-select-group">
                <label className="pricing-select-label">Add-On Credits</label>
                <select
                  className="pricing-select"
                  value={proAddOn}
                  onChange={(e) => setProAddOn(e.target.value)}
                >
                  <option value="">Select Add-On</option>
                  {addOnCredits.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} (+${c.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ul className="pricing-features">
              {proFeatures.map((f, i) => (
                <li key={i}>
                  <span className="pricing-check pricing-check--pro">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button className="pricing-cta pricing-cta--pro" onClick={() => navigate('/login')}>
              Start Pro →
            </button>
          </div>

          {/* Enterprise */}
          <div className="pricing-card pricing-card--enterprise">
            <div className="pricing-card-top">
              <div className="pricing-plan-label">Enterprise</div>
              <div className="pricing-price">
                <span className="pricing-amount">$10,000</span>
                <span className="pricing-period">/month</span>
              </div>
              <p className="pricing-desc">Designed for large enterprises with advanced requirements.</p>
            </div>

            <div className="pricing-card-mid">
              <div className="pricing-select-group">
                <label className="pricing-select-label">Credits</label>
                <select
                  className="pricing-select"
                  value={entCredits}
                  onChange={(e) => setEntCredits(e.target.value)}
                >
                  <option value="">Select Credits</option>
                  {enterpriseCredits.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ul className="pricing-features">
              {enterpriseFeatures.map((f, i) => (
                <li key={i}>
                  <span className="pricing-check pricing-check--ent">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className="pricing-cta pricing-cta--ent"
              onClick={() => window.open('mailto:sales@proplusdata.co', '_blank')}
            >
              Contact Sales →
            </button>
          </div>
        </div>
      </section>

      {/* Footer — same as landing page */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo-section">
              <img src={nexoraLogo2} alt="Nexora" className="footer-logo" />
            </div>

            <div className="footer-left">
              <p className="footer-desc">
                Empowering go-to-market teams with real-time B2B intelligence and predictive insights.
              </p>
              <div className="footer-socials">
                <a
                  href="https://www.linkedin.com/company/proplus-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
    </div>
  );
}
