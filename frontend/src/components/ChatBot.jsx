import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import '../styles/chatbot.css';

const ChatBot = ({ isAuthenticated, ntpData, revealedRows, tableData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I can help you find NTP® Next Purchase analysis for specific companies. Just ask me about any company\'s Next Purchase analysis.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show tooltip every 60 seconds
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setShowTooltip(true);
        const timer = setTimeout(() => setShowTooltip(false), 5000); // Hide after 5 seconds
        return () => clearTimeout(timer);
      }, 60000); // Every 60 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const findNTPAnalysis = (query, data, revealed) => {
    if (!data || data.length === 0) {
      return { results: [], status: 'no-data' };
    }

    // Extract company names from revealed rows (format: "index-companyName")
    let revealedCompanies = new Set();
    if (revealed && revealed.size > 0) {
      revealed.forEach(revealedRow => {
        const parts = revealedRow.split('-');
        if (parts.length > 1) {
          const companyName = parts.slice(1).join('-'); // Handle company names with hyphens
          revealedCompanies.add(companyName.toLowerCase());
        }
      });
    }

    const queryLower = query.toLowerCase();
    const resultsMap = new Map();
    let foundInDatabase = false;
    let foundButNotRevealed = false;

    data.forEach(row => {
      const companyName = String(row.companyName || '').toLowerCase();
      
      if (companyName.includes(queryLower) || queryLower.includes(companyName)) {
        foundInDatabase = true;
        
        // Check if company is revealed
        if (revealedCompanies.has(companyName)) {
          if (!resultsMap.has(companyName)) {
            resultsMap.set(companyName, {
              companyName: row.companyName,
              technology: row.technology,
              category: row.category,
              purchasePrediction: row.purchasePrediction,
              purchaseProbability: row.purchaseProbability,
              ntpAnalysis: row.ntpAnalysis,
              domain: row.domain
            });
          }
        } else {
          foundButNotRevealed = true;
        }
      }
    });

    const results = Array.from(resultsMap.values());
    
    if (results.length > 0) {
      return { results, status: 'found' };
    } else if (foundButNotRevealed) {
      return { results: [], status: 'hidden' };
    } else if (foundInDatabase) {
      return { results: [], status: 'hidden' };
    } else {
      return { results: [], status: 'not-found' };
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Fetch NTP data if not provided
      let data = ntpData || tableData;
      if (!data) {
        const response = await fetch('/api/ntp/all');
        const result = await response.json();
        data = result.data || [];
      }

      const { results: analysisResults, status } = findNTPAnalysis(userMessage, data, revealedRows);

      if (status === 'found' && analysisResults.length > 0) {
        const botMessage = analysisResults.map((result, idx) => {
          return {
            index: idx + 1,
            companyName: result.companyName,
            domain: result.domain || 'N/A',
            technology: result.technology || 'N/A',
            category: result.category || 'N/A',
            purchasePrediction: result.purchasePrediction || 'N/A',
            purchaseProbability: result.purchaseProbability || 'N/A',
            analysis: result.ntpAnalysis || 'No analysis available'
          };
        });
        
        setMessages(prev => [...prev, { type: 'bot', text: '', isFormatted: true, data: botMessage }]);
      } else if (status === 'hidden') {
        setMessages(prev => [...prev, { type: 'bot', text: '', isFormatted: false, messageType: 'hidden', company: userMessage }]);
      } else if (status === 'not-found') {
        setMessages(prev => [...prev, { type: 'bot', text: '', isFormatted: false, messageType: 'not-found', company: userMessage }]);
      } else {
        const botMessage = `Please reveal companies in the table first to view their NTP® Next Purchase analysis. Click the lock icon on a company row to reveal it.`;
        setMessages(prev => [...prev, { type: 'bot', text: botMessage }]);
      }
    } catch (error) {
      console.error('Error fetching NTP data:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error while fetching NTP® Next Purchase analysis. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>🔍 NTP® Next Purchase</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close-btn"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message-wrapper ${msg.type}`}>
                <div className={`chatbot-message ${msg.type}`}>
                  {msg.type === 'bot' && msg.isFormatted && msg.data ? (
                    <div className="chatbot-analysis-container">
                      {msg.data.map((item, itemIdx) => (
                        <div key={itemIdx} className="chatbot-analysis-card">
                          <div className="analysis-header">
                            <span className="analysis-number">{item.index}</span>
                            <span className="analysis-company">{item.companyName}</span>
                          </div>
                          
                          <div className="analysis-details">
                            <div className="detail-row">
                              <span className="detail-label">Domain:</span>
                              <span className="detail-value">{item.domain}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Technology:</span>
                              <span className="detail-value">{item.technology}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Category:</span>
                              <span className="detail-value">{item.category}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Purchase Prediction:</span>
                              <span className="detail-value prediction">{item.purchasePrediction}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Probability:</span>
                              <span className="detail-value probability">{item.purchaseProbability}</span>
                            </div>
                          </div>
                          
                          <div className="analysis-section">
                            <div className="analysis-title">📊 Analysis</div>
                            <div className="analysis-text">{item.analysis}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : msg.type === 'bot' && msg.messageType === 'hidden' ? (
                    <div className="chatbot-message-card hidden-card">
                      <div className="message-card-icon">🔒</div>
                      <div className="message-card-content">
                        <div className="message-card-text">
                          Please reveal <strong>"{msg.company}"</strong> to view its analysis.
                        </div>
                      </div>
                    </div>
                  ) : msg.type === 'bot' && msg.messageType === 'not-found' ? (
                    <div className="chatbot-message-card not-found-card">
                      <div className="message-card-icon">❌</div>
                      <div className="message-card-content">
                        <div className="message-card-text">
                          No data available for <strong>"{msg.company}"</strong>.
                        </div>
                      </div>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-loading">
                <div className="chatbot-loading-text">
                  Searching NTP® Next Purchase analysis...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="chatbot-messages-end" />
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Search company name..."
              className="chatbot-input"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="chatbot-send-btn"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {showTooltip && (
            <div style={{
              position: 'absolute',
              bottom: '75px',
              right: '10px',
              backgroundColor: 'white',
              color: '#8b5cf6',
              padding: '14px 18px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)',
              animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 9998,
              border: '2px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              Unlock NTP Insights
              <span style={{ fontSize: '18px' }}>🔍</span>
            </div>
          )}
          <button
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
            className="chatbot-toggle-btn"
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.15)';
              e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
            }}
            title="Open NTP® Next Purchase Assistant"
            style={{
              position: 'relative',
              overflow: 'visible'
            }}
          >
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '4px',
              fontSize: '24px'
            }}>
              📊
            </span>
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '24px',
              height: '24px',
              backgroundColor: '#ec4899',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'white',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 12px rgba(236, 72, 153, 0.6)'
            }}>
              ⚡
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
