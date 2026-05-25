import { useState } from 'react';
import apiFetch from '../utils/apiFetch';
import '../styles/contactUs.css';

const CATEGORIES = [
  'General Inquiry',
  'Data Issue',
  'Feature Request',
  'Technical Support',
  'Other',
];

const FAQS = [
  {
    q: 'What is Nexora and what does it help with?',
    a: 'Nexora is a B2B intelligence platform powered by ProPlus Data. It gives revenue teams access to Technographics, Intent Data, Renewal Intelligence, Buying Group mapping, Next Tech Purchase® predictions, and Keywords Surge — all in one place. The goal is to help sales and marketing teams identify the right accounts, at the right time, with the right message.',
  },
  {
    q: 'How do credits work in Nexora?',
    a: 'Credits are consumed whenever you unlock blurred data — such as a contact\'s email, mobile DID, or a locked data row. Each reveal costs 1 credit. Free Trial users receive 50 complimentary credits. Credits reset on a monthly cycle. For unlimited credits, reach out to us at nexora@proplusdata.com.',
  },
  {
    q: 'What should I do if a company is not available in the database?',
    a: 'Use the "Request on Demand" button available across all major sections — Technographics, Intent, Renewal Intelligence, Buying Group, and NTP. Enter the company domain and submit. The Nexora team typically processes requests within 48 hours and you\'ll see the submission in your Query History under Profile.',
  },
  {
    q: 'What is the purpose of the Intent section?',
    a: 'The Intent section surfaces companies that are actively researching specific technologies or topics right now. Each company is assigned an intent level — High, Medium, Low, or GreenField — based on behavioral signals. This helps your team prioritise outreach and engage accounts before your competitors do.',
  },
  {
    q: 'How does the Buying Group feature help sales teams?',
    a: 'Buying Group maps the key decision-makers and influencers inside a target company. You can view the org chart, reveal contact details (email and mobile DID) for each person, and export fully unlocked contacts as a CSV. This makes it easy to build multi-threaded outreach into the right stakeholders.',
  },
  {
    q: 'What is Nexora Copilot?',
    a: 'Nexora Copilot is an AI-powered chatbot built into the platform. You can ask it natural-language questions like "Show me companies using Salesforce in the US" or "Which accounts have renewals in Q1?" and it will surface the relevant insights and navigate you to the right section automatically.',
  },
];

const FaqSection = () => {
  const [open, setOpen] = useState(null);
  const [faqOpen, setFaqOpen] = useState(false);
  return (
    <div className="contact-faq-section">
      {/* FAQ collapsible header */}
      <button className="contact-faq-toggle" onClick={() => setFaqOpen(v => !v)}>
        <div>
          <h2 className="contact-faq-title">Frequently Asked Questions</h2>
          <p className="contact-faq-subtitle">Quick answers before you reach out.</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: faqOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {faqOpen && (
        <div className="contact-faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`contact-faq-item${open === i ? ' open' : ''}`}>
              <button className="contact-faq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {open === i && <p className="contact-faq-a">{faq.a}</p>}
            </div>
          ))}
          <div className="contact-billing-note">
            For billing enquiries, email us at <a href="mailto:nexora@proplusdata.com">nexora@proplusdata.com</a>
          </div>
        </div>
      )}

      {/* Always-visible info cards */}
      <div className="contact-faq-info-cards">
        <div className="contact-info-card">
          <div className="contact-info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <p className="contact-info-label">Email Support</p>
            <p className="contact-info-value">support@proplusdata.co</p>
          </div>
        </div>
        <div className="contact-info-card">
          <div className="contact-info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="contact-info-label">Response Time</p>
            <p className="contact-info-value">24–48 business hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactUs = ({ username }) => {
  const [form, setForm] = useState({ category: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/api/contact-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: username }),
      });
      // Save to localStorage for profile panel history
      try {
        const existing = JSON.parse(localStorage.getItem('ticketHistory') || '[]');
        const entry = {
          id: Date.now(),
          category: form.category,
          subject: form.subject,
          message: form.message,
          status: 'Open',
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        };
        localStorage.setItem('ticketHistory', JSON.stringify([entry, ...existing].slice(0, 50)));
      } catch (_) {}
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ category: '', subject: '', message: '' });
    setSubmitted(false);
    setError('');
  };

  return (
    <div className="contact-us-page">
      <div className="contact-us-header">
        <h1>Contact Us</h1>
        <p>Have a question or issue? Submit a ticket and our team will get back to you within 24–48 hours.</p>
      </div>

      <div className="contact-us-layout">
        {/* Left — form only */}
        <div className="contact-us-left">
          <div className="contact-us-form-card">
            {submitted ? (
              <div className="contact-us-success">
                <div className="contact-us-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>Ticket Submitted</h3>
                <p>We've received your request and will follow up at <strong>{username}</strong>.</p>
                <button className="contact-us-new-btn" onClick={handleReset}>Submit Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-us-form">
                <div className="contact-us-field">
                  <label>Category <span className="contact-required">*</span></label>
                  <select name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select a category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="contact-us-field">
                  <label>Subject <span className="contact-required">*</span></label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Brief summary of your issue"
                    maxLength={120}
                    required
                  />
                </div>
                <div className="contact-us-field">
                  <label>Message <span className="contact-required">*</span></label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question in detail..."
                    rows={6}
                    maxLength={2000}
                    required
                  />
                  <span className="contact-char-count">{form.message.length} / 2000</span>
                </div>
                {error && <p className="contact-error">{error}</p>}
                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={submitting || !form.category || !form.subject.trim() || !form.message.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right — FAQ */}
        <FaqSection />
      </div>
    </div>
  );
};

export default ContactUs;
