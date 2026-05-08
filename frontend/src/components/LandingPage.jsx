import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validateBusinessEmail from '../utils/emailValidator';
import AnimatedCounter from './AnimatedCounter';
import ClientLogosCarousel from './ClientLogosCarousel';
import nexoraLogo2 from '../assets/Nexora Logo (2)-cropped.svg';
import proplusDataLogo from '../assets/unnamed (1).png';
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

const LandingPage = () => {
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [emailError, setEmailError] = useState('');

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
      image: technoSvg
    },
    {
      id: 2,
      title: 'Renewal Intelligence',
      description: 'Identify when contracts are up for renewal, which customers might switch vendors, and who is at risk of leaving.',
      image: riSvg
    },
    {
      id: 3,
      title: 'Intent',
      description: 'Intent data captures behavioral signals that indicate a company\'s interest in specific technologies or solutions, helping prioritize outreach and improve conversion efficiency.',
      image: intentSvg
    },
    {
      id: 4,
      title: 'Buying Group',
      description: 'A structured group of executive Decision-Makers and high-impact Influencers within an organization who define technical and business requirements',
      image: bgSvg
    },
    {
      id: 5,
      title: 'Next Tech Purchase® - NTP®',
      description: 'Identifies probable next technology investments using predictive modeling and account-level intelligence signals.',
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
    {
      id: 5,
      question: 'How is Nexora different from other GTM tools?',
      answer: 'Nexora combines technographics, intent data, and buying group intelligence in one unified platform. Our AI-powered insights help you identify the right accounts and the right people to reach.'
    },
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
            <img src={nexoraLogo2} alt="Nexora" className="header-logo" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.85rem', color: '#a0a0a0', fontWeight: '500' }}>Powered by</span>
            <a href="https://proplusdata.co/" target="_blank" rel="noopener noreferrer">
              <img src={proplusDataLogo} alt="ProPlus Data" className="header-logo" style={{ height: '35px' }} />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-wrapper">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              POWERED BY PROPLUS DATA INTELLIGENCE
            </div>
            <h1 className="hero-title">
              The Timing Layer for<br />
              <span className="hero-title-accent">Predictable Revenue</span>
            </h1>
            <p className="hero-subtitle">
              Most teams chase demand. Nexora, a GTM AI platform, makes revenue predictable,revealing what’s next, the right stakeholders to engage, and exactly when to act.
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
                Trusted by <strong>2,400+</strong> revenue teams at AWS, Cisco, Siemens &amp; more
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <img src={heroSvg} alt="Nexora Dashboard" className="hero-image" />
          </div>
        </div>

        {/* Sign In - top right corner */}
        <button
          onClick={() => navigate('/login')}
          style={{
            position: 'absolute',
            top: '20px',
            right: '32px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '9px 20px',
            color: '#111827',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
        >
          Log In
        </button>
      </section>

      {/* Scroll Down Arrow */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0' }}>
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          aria-label="Scroll to bottom"
          style={{
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            maxWidth: '40px',
            maxHeight: '40px',
            borderRadius: '50%',
            border: '1.5px solid #a5b4fc',
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#2563eb',
            lineHeight: 1,
            padding: 0,
            boxSizing: 'border-box',
          }}
        >
          ↓
        </button>
      </div>

      {/* Client Logos Carousel */}
      <ClientLogosCarousel />

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-wrapper">
          <div className="stats-header">
            <h2>Powering Go-To-Market Excellence</h2>
            <p>Join leading B2B companies leveraging ProPlus Data's intelligence to scale revenue</p>
          </div>
          <div className="stats-container">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-card-inner">
                  <div className="stat-icon-bg"></div>
                  <div className="stat-number">
                    <AnimatedCounter value={stat.number} duration={2000} />
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-header">
          <h2>Enterprise-Grade B2B Intelligence</h2>
          <p>Explore our comprehensive data attributes that power smarter go-to-market decisions</p>
        </div>
        <div className="features-accordion">
          <div className="accordion-left">
            {features.map((feature) => (
              <div key={feature.id} className="accordion-item">
                <button 
                  className={`accordion-header ${expandedFeature === feature.id ? 'active' : ''}`}
                  onClick={() => setExpandedFeature(expandedFeature === feature.id ? feature.id : feature.id)}
                >
                  <span className="accordion-title">{feature.title}</span>
                  <span className="accordion-toggle">
                    {expandedFeature === feature.id ? '−' : '+'}
                  </span>
                </button>
                {expandedFeature === feature.id && (
                  <div className="accordion-content">
                    <p>{feature.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="accordion-right">
            {expandedFeature && (
              <img 
                src={features.find(f => f.id === expandedFeature)?.image} 
                alt="Feature Screenshot" 
                className="feature-image" 
              />
            )}
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="difference-section">
        <div className="difference-wrapper">
          <div className="difference-header">
            <h2>Here's what makes us different</h2>
            <p>Find and close your next customer before your competitors do with our all-in-one platform that tells you who to reach and how to reach them. With Nexora, you can unite sales and marketing teams around a single source of truth. And you can scale faster by automating tasks across all outreach channels.</p>
          </div>
          <div className="difference-cards">
            <div className="difference-card">
              <h3>Strategic Imperative</h3>
              <p>Build the standard. We are creating the most trusted intelligence engine for enterprise technology decisions.</p>
            </div>
            <div className="difference-card">
              <h3>Change how teams sell</h3>
              <p>We help teams stop reacting to the past and start anticipating future revenue.</p>
            </div>
            <div className="difference-card">
              <h3>Unite your organization</h3>
              <p>We align Sales, Marketing, and Product teams with one shared view of what comes next.</p>
            </div>
            {/* <div className="difference-card">
              <h3>Win with timing</h3>
              <p>We give you the advantage of knowing when to act, before your competitors do.</p>
            </div> */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-glass-container">
          <div className="cta-content">
            <h2>Try Nexora <span className="bold-word">free</span>.<br />No credit card required.</h2>
            {/* <button className="btn-cta-primary" disabled>
              Coming Soon
            </button> */}
          </div>
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
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
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
              <h2>Frequently Asked Questions</h2>
              <p>Find answers to common questions about Nexora and how it can help your team</p>
            </div>
          </div>
          <div className="accordion-right-faq">
            {faqs.map((faq) => (
              <div key={faq.id} className="accordion-item-faq">
                <button 
                  className={`accordion-header-faq ${expandedFaq === faq.id ? 'active' : ''}`}
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
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
