import { useState } from 'react';
import apiFetch from '../utils/apiFetch';
import '../styles/contactUs.css';

const CATEGORIES = [
  'General Inquiry',
  'Data Issue',
  'Feature Request',
  'Billing & Plans',
  'Technical Support',
  'Other',
];

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
        {/* Left — form */}
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

        {/* Right — info cards */}
        <div className="contact-us-info">
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

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="contact-info-label">Live Chat</p>
              <p className="contact-info-value">Available via the chatbot</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
