import { useState, useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/chatbot.css';

const ChatBot = ({ isAuthenticated, ntpData, tableData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: 'Hey there 👋 I\'m here to help you spot tech buying signals before your competitors do.\n\nWhat would you like to explore?',
      isGreeting: true,
      showOptions: true,
      options: [
        { id: 'what-is-ntp', label: '❓ What is NTP®?' },
        { id: 'see-demo', label: '📊 View a sample analysis' },
        { id: 'analyze-company', label: '🔍 Analyze a specific company' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStage, setConversationStage] = useState('greeting');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const messagesEndRef = useRef(null);

  // Get unique categories from data on mount
  useEffect(() => {
    const getUniqueCategories = () => {
      const data = ntpData || tableData;
      if (!data || data.length === 0) return [];
      
      const uniqueCats = [...new Set(data.map(item => item.category))].filter(cat => cat && cat !== 'Not Detected').sort();
      
      // Map categories to display format with emojis
      const categoryMap = {
        'database': '🗄️ Database',
        'ai-ml': '🤖 AI/ML',
        'crm': '👥 CRM',
        'cloud': '☁️ Cloud',
        'security': '🔒 Security',
        'analytics': '📊 Analytics',
        'infrastructure': '🏗️ Infrastructure',
        'devops': '⚙️ DevOps'
      };
      
      return uniqueCats.map(cat => {
        const catLower = cat.toLowerCase().replace(/\s+/g, '-');
        const label = categoryMap[catLower] || `📌 ${cat}`;
        return { id: catLower, label: label, originalName: cat };
      });
    };
    
    const cats = getUniqueCategories();
    setDynamicCategories(cats);
  }, [ntpData, tableData]);

  const demoCompanies = [
    { name: 'Acme Corp', id: 'acme-corp' },
    { name: 'TechFlow Inc', id: 'techflow-inc' },
    { name: 'DataSync Solutions', id: 'datasync-solutions' },
    { name: 'CloudBase Systems', id: 'cloudbase-systems' }
  ];

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
        const timer = setTimeout(() => setShowTooltip(false), 5000);
        return () => clearTimeout(timer);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleOptionClick = (optionId) => {
    if (optionId === 'what-is-ntp') {
      handleWhatIsNTP();
    } else if (optionId === 'see-demo') {
      handleSeeDemoFlow();
    } else if (optionId === 'analyze-company') {
      setSelectedCompany(null);
      handleAnalyzeCompanyFlow();
    } else if (optionId === 'analyze-category') {
      handleAnalyzeDifferentCategory();
    }
  };

  const handleAnalyzeDifferentCategory = () => {
    setConversationStage('category-input');
    const categoriesWithAll = [
      ...dynamicCategories,
      { id: 'all', label: '📊 ALL' }
    ];
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `✅ Got it! Which category interests you for ${selectedCompany}?`,
      showCategories: true,
      categories: categoriesWithAll
    }]);
  };

  const handleWhatIsNTP = () => {
    setConversationStage('info');
    const botMessages = [
      {
        type: 'bot',
        text: 'Exactly 🎯 NTP® predicts which technologies companies are about to buy based on real signals—hiring, partnerships, tech stack changes.\n\nThis means you can reach prospects at the exact moment they\'re ready to buy. Pretty powerful, right?'
      },
      {
        type: 'bot',
        text: 'Would you like to see a demo?',
        showOptions: true,
        options: [
          { id: 'see-demo', label: '📊 View a sample analysis' },
          { id: 'analyze-company', label: '🔍 Analyze a specific company' }
        ]
      }
    ];
    
    setMessages(prev => [...prev, ...botMessages]);
  };

  const handleSeeDemoFlow = () => {
    setConversationStage('demo-selection');
    const botMessages = [
      {
        type: 'bot',
        text: 'Perfect! I can show you a quick demo of how NTP® insights look. 📊\n\nClick any company below to view its NTP® analysis:'
      },
      {
        type: 'bot',
        showDemoCompanies: true,
        companies: demoCompanies
      }
    ];
    
    setMessages(prev => [...prev, ...botMessages]);
  };

  const handleAnalyzeCompanyFlow = () => {
    setConversationStage('company-input');
    const botMessages = [
      {
        type: 'bot',
        text: 'Great! 👍 I can help you analyze a company.\n\nFirst, what\'s the company name?'
      }
    ];
    
    setMessages(prev => [...prev, ...botMessages]);
  };

  const handleCategorySelect = (categoryId) => {
    const allCategories = [
      ...dynamicCategories,
      { id: 'all', label: '📊 ALL' }
    ];
    const categoryLabel = allCategories.find(c => c.id === categoryId)?.label || categoryId;
    setMessages(prev => [...prev, { type: 'user', text: categoryLabel }]);
    handleCategorySubmit(categoryId);
  };

  const handleCategorySubmit = async (categoryId) => {
    setLoading(true);

    try {
      let data = ntpData || tableData;
      if (!data) {
        const response = await fetch('/api/ntp/all');
        const result = await response.json();
        data = result.data || [];
      }

      // Add thinking effect
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: '🔍 Analyzing digital signals and technology indicators… ⏳',
        isThinking: true
      }]);

      // Simulate analysis delay
      setTimeout(() => {
        const { results: analysisResults, status } = findNTPAnalysis(selectedCompany, categoryId, data);

        // Remove thinking message
        setMessages(prev => prev.filter(msg => !msg.isThinking));

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
          
          setMessages(prev => [...prev, 
            { type: 'bot', text: `Nice choice 👍 Here's what the signals suggest for ${analysisResults[0].companyName}:` },
            { type: 'bot', text: '', isFormatted: true, data: botMessage }
          ]);
          
          // Add follow-up
          setTimeout(() => {
            setMessages(prev => [...prev, {
              type: 'bot',
              text: 'Want to explore another sample, or analyze a company you\'re targeting?',
              showOptions: true,
              options: [
                { id: 'analyze-company', label: '🔍 Analyze another company' },
                { id: 'analyze-category', label: '📊 View different category' },
                { id: 'see-demo', label: '📊 View a sample' }
              ]
            }]);
            
            // Keep selectedCompany for category switching, but reset stage
            setConversationStage('greeting');
          }, 500);
        } else if (status === 'not-found') {
          setMessages(prev => [...prev, { type: 'bot', text: '', isFormatted: false, messageType: 'not-found', company: selectedCompany, category: categoryId }]);
          
          // Reset for next search
          setSelectedCompany(null);
          setConversationStage('greeting');
        } else {
          const botMessage = `Sorry, no data available for "${selectedCompany}" in this category.`;
          setMessages(prev => [...prev, { type: 'bot', text: botMessage }]);
          
          // Reset for next search
          setSelectedCompany(null);
          setConversationStage('greeting');
        }
      }, 1500);
    } catch (error) {
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error while fetching NTP® Next Purchase analysis. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCompanyClick = (company) => {
    setMessages(prev => [...prev, { type: 'user', text: `Show me ${company.name}` }]);
    
    // Add thinking effect
    setMessages(prev => [...prev, { 
      type: 'bot', 
      text: '🔍 Analyzing digital signals and technology indicators…',
      isThinking: true
    }]);
    
    // Simulate analysis delay
    setTimeout(() => {
      showDemoAnalysis(company);
    }, 2000);
  };

  const showDemoAnalysis = (company) => {
    const demoAnalyses = {
      'techflow-inc': {
        companyName: 'TechFlow Inc',
        predictions: [
          'Cloud Cost Optimization Tools',
          'AI-powered Analytics Platforms',
          'CRM Automation Enhancements'
        ],
        signals: [
          'Increased cloud migration activity',
          'Hiring for data engineering roles',
          'Partnerships with AI solution providers'
        ],
        insight: 'TechFlow is likely preparing to scale data infrastructure and improve customer intelligence capabilities.'
      },
      'acme-corp': {
        companyName: 'Acme Corp',
        predictions: [
          'Enterprise Security Solutions',
          'Zero-Trust Architecture Tools',
          'Identity & Access Management'
        ],
        signals: [
          'Recent security audit initiatives',
          'Hiring for security engineers',
          'Compliance framework implementations'
        ],
        insight: 'Acme Corp is strengthening its security posture and preparing for enhanced compliance requirements.'
      },
      'datasync-solutions': {
        companyName: 'DataSync Solutions',
        predictions: [
          'Data Integration Platforms',
          'Real-time Analytics Tools',
          'Data Governance Solutions'
        ],
        signals: [
          'Expansion of data engineering team',
          'Partnerships with data platforms',
          'Investment in data infrastructure'
        ],
        insight: 'DataSync is scaling its data capabilities and preparing for enterprise-level data operations.'
      },
      'cloudbase-systems': {
        companyName: 'CloudBase Systems',
        predictions: [
          'Kubernetes Management Tools',
          'Container Orchestration Platforms',
          'DevOps Automation Solutions'
        ],
        signals: [
          'Increased containerization efforts',
          'Hiring for DevOps specialists',
          'Cloud infrastructure expansion'
        ],
        insight: 'CloudBase is modernizing its infrastructure and preparing for large-scale cloud operations.'
      }
    };

    const analysis = demoAnalyses[company.id];
    
    // Remove thinking message
    setMessages(prev => prev.filter(msg => !msg.isThinking));
    
    // Add analysis
    setMessages(prev => [...prev, {
      type: 'bot',
      isDemoAnalysis: true,
      analysis: analysis
    }]);

    // Add follow-up
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Here\'s what the signals suggest. Ready to analyze a company you\'re targeting?',
        showOptions: true,
        options: [
          { id: 'analyze-company', label: '🔍 Analyze a company' },
          { id: 'see-demo', label: '📊 View another sample' }
        ]
      }]);
    }, 500);
  };

  const findNTPAnalysis = (companyName, categoryId, data) => {
    if (!data || data.length === 0) {
      return { results: [], status: 'no-data' };
    }

    const companyLower = companyName.toLowerCase();
    const results = [];

    // Get the original category name from the dynamic categories
    let categoryToMatch = null;
    if (categoryId && categoryId !== 'all') {
      const categoryObj = dynamicCategories.find(c => c.id === categoryId);
      categoryToMatch = categoryObj ? categoryObj.originalName : null;
    }

    data.forEach(row => {
      const rowCompanyName = String(row.companyName || '').toLowerCase();
      const rowCategory = String(row.category || '');
      
      // Match company name
      if (rowCompanyName.includes(companyLower) || companyLower.includes(rowCompanyName)) {
        // If category is provided, also match category
        if (categoryToMatch) {
          if (rowCategory && rowCategory.toLowerCase() === categoryToMatch.toLowerCase()) {
            results.push({
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
          // No category filter (ALL), include all matches
          results.push({
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
    
    if (results.length > 0) {
      return { results, status: 'found' };
    } else {
      return { results: [], status: 'not-found' };
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);

    try {
      // Check if user input matches a company name from the data
      const data = ntpData || tableData;
      
      if (!data || data.length === 0) {
        setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, no data available. Please try again later.' }]);
        return;
      }

      // Filter out "Not Detected" records and find matching company
      const matchedCompany = data.find(row => 
        String(row.companyName || '').toLowerCase() === userMessage.toLowerCase() &&
        row.category !== 'Not Detected' &&
        row.purchasePrediction !== 'Not Detected' &&
        row.purchasePrediction !== 'NOT detected'
      );

      // If company name is found directly, skip to category selection
      if (matchedCompany && !selectedCompany) {
        setSelectedCompany(userMessage);
        setConversationStage('category-input');
        
        // Ask for category with buttons
        const categoriesWithAll = [
          ...dynamicCategories,
          { id: 'all', label: '📊 ALL' }
        ];
        
        if (categoriesWithAll.length === 1) {
          // If only "ALL" is available, show error
          setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, no categories available for this company.' }]);
          setSelectedCompany(null);
          setConversationStage('greeting');
          return;
        }
        
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `✅ Got it! Which category interests you for ${userMessage}?`,
          showCategories: true,
          categories: categoriesWithAll
        }]);
        return;
      }

      // Step 1: Get company name (when in company-input stage)
      if (conversationStage === 'company-input' && !selectedCompany) {
        setSelectedCompany(userMessage);
        setConversationStage('category-input');
        
        // Ask for category with buttons
        const categoriesWithAll = [
          ...dynamicCategories,
          { id: 'all', label: '📊 ALL' }
        ];
        
        if (categoriesWithAll.length === 1) {
          // If only "ALL" is available, show error
          setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, no categories available for this company.' }]);
          setSelectedCompany(null);
          setConversationStage('greeting');
          return;
        }
        
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `✅ Got it! Which category interests you for ${userMessage}?`,
          showCategories: true,
          categories: categoriesWithAll
        }]);
        return;
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>🔍 NTP® - Your Next Purchase</h3>
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
                  {msg.type === 'bot' && msg.isGreeting && msg.showOptions ? (
                    <div className="chatbot-greeting-with-options">
                      <div className="chatbot-greeting">{msg.text}</div>
                      <div className="chatbot-options">
                        {msg.options.map((option) => (
                          <button
                            key={option.id}
                            className="chatbot-option-btn"
                            onClick={() => {
                              setMessages(prev => [...prev, { type: 'user', text: option.label }]);
                              handleOptionClick(option.id);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : msg.type === 'bot' && msg.isGreeting ? (
                    <div className="chatbot-greeting">{msg.text}</div>
                  ) : msg.type === 'bot' && msg.isThinking ? (
                    <div className="chatbot-thinking">
                      <span className="thinking-text">{msg.text}</span>
                      <div className="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  ) : msg.type === 'bot' && msg.isDemoAnalysis ? (
                    <div className="chatbot-demo-analysis">
                      <div className="demo-analysis-header">
                        🔍 NTP® Analysis: {msg.analysis.companyName}
                      </div>
                      <div className="demo-analysis-section">
                        <div className="demo-section-title">Predicted Next Investments:</div>
                        <ul className="demo-predictions">
                          {msg.analysis.predictions.map((pred, i) => (
                            <li key={i}>• {pred}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="demo-analysis-section">
                        <div className="demo-section-title">Intent Signals Detected:</div>
                        <ul className="demo-signals">
                          {msg.analysis.signals.map((signal, i) => (
                            <li key={i}>✔ {signal}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="demo-analysis-section">
                        <div className="demo-section-title">Sales Insight:</div>
                        <div className="demo-insight">{msg.analysis.insight}</div>
                      </div>
                    </div>
                  ) : msg.type === 'bot' && msg.showDemoCompanies ? (
                    <div className="chatbot-demo-companies">
                      {msg.companies.map((company) => (
                        <button
                          key={company.id}
                          className="demo-company-btn"
                          onClick={() => handleDemoCompanyClick(company)}
                        >
                          👉 {company.name}
                        </button>
                      ))}
                    </div>
                  ) : msg.type === 'bot' && msg.showCategories ? (
                    <div className="chatbot-categories">
                      <div className="chatbot-categories-text">{msg.text}</div>
                      <div className="chatbot-category-buttons">
                        {msg.categories.map((cat) => (
                          <button
                            key={cat.id}
                            className="chatbot-category-btn"
                            onClick={() => handleCategorySelect(cat.id)}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : msg.type === 'bot' && msg.showOptions && !msg.isGreeting ? (
                    <div className="chatbot-options">
                      {msg.options.map((option) => (
                        <button
                          key={option.id}
                          className="chatbot-option-btn"
                          onClick={() => {
                            setMessages(prev => [...prev, { type: 'user', text: option.label }]);
                            handleOptionClick(option.id);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : msg.type === 'bot' && msg.isFormatted && msg.data ? (
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
                  ) : msg.type === 'bot' && msg.messageType === 'not-found' ? (
                    <div className="chatbot-message-card not-found-card">
                      <div className="message-card-icon">❌</div>
                      <div className="message-card-content">
                        <div className="message-card-text">
                          No data available for <strong>"{msg.company}"</strong> {msg.category && `in the "${msg.category}" category`}.
                        </div>
                      </div>
                    </div>
                  ) : msg.text ? (
                    <div className="chatbot-text-message">{msg.text}</div>
                  ) : null}
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
