import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleStartFreeTrial = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'Landing Page - Hero' })
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
      title: 'Next Tech Purchase (NTP®)',
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
            <img src={proplusDataLogo} alt="ProPlus Data" className="header-logo" style={{ height: '35px' }} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-wrapper">
          <div className="hero-content">
            <h1 className="hero-title">
              AI Platform for a Predictable Pipeline<span className="highlight"></span>
            </h1>
            <p className="hero-subtitle">
              Access 600M+ companies with real-time technographics, intent data, renewal intelligence, and buying group insights to identify, prioritize, and convert the right accounts, faster.
            </p>
            <div className="hero-cta">
              <input 
                type="email" 
                placeholder="Enter your business email" 
                className="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartFreeTrial()}
              />
              <button 
                className="btn-free-trial" 
                onClick={handleStartFreeTrial}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Start Free Trial'}
              </button>
            </div>

            {/* Divider + Sign In */}
            <div style={{ marginTop: '12px', width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ height: '1px', background: '#d1d5db', marginBottom: '25px', width: '100%' }} />
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '9px 28px',
                  color: '#111827',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign In
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <img src={heroSvg} alt="Nexora Dashboard" className="hero-image" />
          </div>
        </div>
      </section>

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
            <button className="btn-cta-primary" disabled>
              Coming Soon
            </button>
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
                <a href="#linkedin" title="LinkedIn" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-right">
              <div className="footer-links">
                <h5>Help</h5>
                <ul>
                  <li><a href="#faq">FAQ</a></li>
                </ul>
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
