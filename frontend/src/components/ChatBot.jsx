import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import '../styles/chatbot.css';

const ChatBot = ({ isAuthenticated, ntpData, revealedRows, tableData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I can help you find NTP analysis for specific companies. Just ask me about any company\'s Next Tech Purchase analysis.' }
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
      return [];
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

    data.forEach(row => {
      const companyName = String(row.companyName || '').toLowerCase();
      
      // If revealed rows exist, only include companies that are revealed
      if (revealed && revealed.size > 0) {
        if (!revealedCompanies.has(companyName)) {
          return;
        }
      }
      
      if (companyName.includes(queryLower) || queryLower.includes(companyName)) {
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
      }
    });

    return Array.from(resultsMap.values());
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

      const analysisResults = findNTPAnalysis(userMessage, data, revealedRows);

      if (analysisResults.length > 0) {
        const botMessage = analysisResults.map((result, idx) => {
          let content = '';
          content += `${idx + 1}. ${result.companyName}\n`;
          content += `━━━━━━━━━━━━\n\n`;
          content += `Domain: ${result.domain || 'N/A'}\n`;
          content += `Technology: ${result.technology || 'N/A'}\n`;
          content += `Category: ${result.category || 'N/A'}\n`;
          content += `Purchase Prediction: ${result.purchasePrediction || 'N/A'}\n`;
          content += `Purchase Probability: ${result.purchaseProbability || 'N/A'}\n`;
          
          if (result.ntpAnalysis) {
            content += `\n📊 Analysis:\n`;
            content += `${result.ntpAnalysis}\n`;
          }
          
          if (idx < analysisResults.length - 1) {
            content += '\n\n';
          }
          
          return content;
        }).join('');
        
        setMessages(prev => [...prev, { type: 'bot', text: botMessage, isFormatted: true, content: botMessage }]);
      } else {
        let botMessage = '';
        if (revealedRows && revealedRows.size > 0) {
          botMessage = `I couldn't find any NTP analysis for "${userMessage}" in the revealed companies. Please reveal more companies or try a different search.`;
        } else {
          botMessage = `Please reveal companies in the table first to view their NTP analysis. Click the eye icon on a company row to reveal it.`;
        }
        setMessages(prev => [...prev, { type: 'bot', text: botMessage }]);
      }
    } catch (error) {
      console.error('Error fetching NTP data:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error while fetching NTP analysis. Please try again.' }]);
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
            <h3>🔍 NTP Analysis</h3>
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
                  {msg.type === 'bot' && msg.isFormatted ? (
                    <div className="chatbot-message-content">
                      {msg.content}
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
                  Searching NTP analysis...
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
            title="Open NTP Analysis Assistant"
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
