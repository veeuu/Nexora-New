import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaMinus } from 'react-icons/fa';
import '../styles/chatbot.css';
// import chatbotVideo from '../video/Video_Generation_For_Chatbot (online-video-cutter,com)-Picsart-BackgroundRemover.mp4';

const ChatBot = ({ isAuthenticated, ntpData, tableData, isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }) => {
  const [isOpenLocal, setIsOpenLocal] = useState(false);
  
  // Use external state if provided (from NTP), otherwise use local state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenLocal;
  const setIsOpen = (value) => {
    if (externalSetIsOpen) {
      externalSetIsOpen(value);
    } else {
      setIsOpenLocal(value);
    }
  };
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const videoRef = useRef(null);
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      isThinking: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStage, setConversationStage] = useState('greeting');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [expandedNTP, setExpandedNTP] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingMessageIndex, setTypingMessageIndex] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [activeFlow, setActiveFlow] = useState(null);
  const [demoViewed, setDemoViewed] = useState(false);
  const messagesEndRef = useRef(null);

  // Get unique categories from data on mount
  useEffect(() => {
    const getUniqueCategories = () => {
      const data = ntpData || tableData;
      if (!data || data.length === 0) return [];
      
      const uniqueCats = [...new Set(data.map(item => item.category))].filter(cat => cat && cat !== 'Not Detected').sort();
      
      // Map categories to display format
      const categoryMap = {
        'database': 'Database',
        'ai-ml': 'AI/ML',
        'crm': 'CRM',
        'cloud': 'Cloud',
        'security': 'Security',
        'analytics': 'Analytics',
        'infrastructure': 'Infrastructure',
        'devops': 'DevOps'
      };
      
      return uniqueCats.map(cat => {
        const catLower = cat.toLowerCase().replace(/\s+/g, '-');
        const label = categoryMap[catLower] || cat;
        return { id: catLower, label: label, originalName: cat };
      });
    };
    
    const cats = getUniqueCategories();
    setDynamicCategories(cats);
  }, [ntpData, tableData]);

  const demoCompanies = [
    { name: 'XYZ Technologies', id: 'xyz-technologies' },
    { name: 'ABC Systems', id: 'abc-systems' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Remove thinking message after chatbot opens and add greeting messages with typewriter effect
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Only show greeting if not reopening from minimized state
      // Check if messages only contain the initial thinking state
      const isInitialState = messages.length === 1 && messages[0].isThinking;
      
      if (isInitialState) {
        const timer = setTimeout(() => {
          const greetingMessages = [
            { 
              type: 'bot', 
              text: 'Hey 👋',
              isGreeting: true,
              isGreetingBox: true
            },
            { 
              type: 'bot', 
              text: 'I\'m your NTP assistant.',
              isGreeting: true,
              isGreetingBox: true
            },
            { 
              type: 'bot', 
              text: 'What would you like to do?',
              isGreeting: true,
              isGreetingBox: true
            },
            { 
              type: 'bot', 
              showOptions: true,
              options: [
                { id: 'what-is-ntp', label: 'What is NTP?' },
                ...(demoViewed ? [] : [{ id: 'see-demo', label: 'Show me a sample justification' }]),
                { id: 'analyze-company', label: 'Let\'s analyze a company' }
              ]
            }
          ];
          
          setMessages(greetingMessages);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, isMinimized, demoViewed, messages]);

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

  // Handle video looping every 30 seconds when chatbot is closed
  // useEffect(() => {
  //   if (!isOpen && videoRef.current) {
  //     const interval = setInterval(() => {
  //       videoRef.current.currentTime = 0;
  //       videoRef.current.play();
  //     }, 30000);

  //     return () => clearInterval(interval);
  //   }
  // }, [isOpen]);

  const handleOptionClick = (optionId) => {
    setSelectedOptionId(optionId);
    if (optionId === 'what-is-ntp') {
      setExpandedNTP(true);
    } else if (optionId === 'see-demo') {
      setActiveFlow('demo');
      handleSeeDemoFlow();
    } else if (optionId === 'analyze-company') {
      setActiveFlow('analyze');
      setSelectedCompany(null);
      handleAnalyzeCompanyFlow();
    } else if (optionId === 'analyze-category') {
      handleAnalyzeDifferentCategory();
    }
  };

  const handleAnalyzeDifferentCategory = () => {
    setConversationStage('category-input');
    
    // Get company-specific categories instead of all categories
    const data = ntpData || tableData;
    if (!data || data.length === 0) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, no data available.' }]);
      return;
    }
    
    // Get unique categories for this company only
    const companyCategoriesSet = new Set();
    data.forEach(row => {
      if (String(row.companyName || '').toLowerCase() === selectedCompany.toLowerCase() &&
          row.category !== 'Not Detected' &&
          row.purchasePrediction !== 'Not Detected' &&
          row.purchasePrediction !== 'NOT detected') {
        companyCategoriesSet.add(row.category);
      }
    });
    
    const companyCategories = Array.from(companyCategoriesSet)
      .map(cat => {
        const catLower = cat.toLowerCase().replace(/\s+/g, '-');
        const categoryMap = {
          'database': 'Database',
          'ai-ml': 'AI/ML',
          'crm': 'CRM',
          'cloud': 'Cloud',
          'security': 'Security',
          'analytics': 'Analytics',
          'infrastructure': 'Infrastructure',
          'devops': 'DevOps'
        };
        const label = categoryMap[catLower] || cat;
        return { id: catLower, label: label, originalName: cat };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    
    // Add ALL option at the end
    companyCategories.push({ id: 'all', label: 'ALL', originalName: 'ALL' });
    
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `Got it. ${selectedCompany} selected. What would you like to explore?`,
      showCategories: true,
      categories: companyCategories
    }]);
  };

  const handleSeeDemoFlow = () => {
    setConversationStage('demo-selection');
    setDemoViewed(true);
    
    // Show thinking message first
    setMessages(prev => [...prev, {
      type: 'bot',
      text: 'Preparing demo analysis...',
      isThinking: true
    }]);
    
    // After thinking completes, show the response
    setTimeout(() => {
      setMessages(prev => {
        // Remove thinking message and add response
        const filtered = prev.filter(msg => !msg.isThinking);
        return [...filtered,
          {
            type: 'bot',
            text: 'Let me show you how this works. Pick a company to see real-world signals:'
          },
          {
            type: 'bot',
            showDemoCompanies: true,
            companies: demoCompanies
          }
        ];
      });
    }, 1500);
  };

  const handleAnalyzeCompanyFlow = () => {
    setConversationStage('company-input');
    
    // Show thinking message first
    setMessages(prev => [...prev, {
      type: 'bot',
      text: 'Preparing analysis tool...',
      isThinking: true
    }]);
    
    // After thinking completes, show the response
    setTimeout(() => {
      setMessages(prev => {
        // Remove thinking message and add response
        const filtered = prev.filter(msg => !msg.isThinking);
        return [...filtered,
          {
            type: 'bot',
            text: 'I\'m ready. Drop the company name below, and I\'ll pull their predictive data and analysis',
            hasSubtext: true,
            subtext: '💡 Tip: Minimize me to view the company table!'
          }
        ];
      });
    }, 1500);
  };

  const handleSuggestedCompanyClick = (companyName) => {
    setSelectedOptionId(companyName);
    setMessages(prev => [...prev, { type: 'user', text: companyName }]);
    
    // Treat it as if the user typed the company name
    const data = ntpData || tableData;
    if (!data || data.length === 0) return;

    setSelectedCompany(companyName);
    setConversationStage('category-input');
    
    // Get unique categories for this company only
    const companyCategoriesSet = new Set();
    data.forEach(row => {
      if (String(row.companyName || '').toLowerCase() === companyName.toLowerCase() &&
          row.category !== 'Not Detected' &&
          row.purchasePrediction !== 'Not Detected' &&
          row.purchasePrediction !== 'NOT detected') {
        companyCategoriesSet.add(row.category);
      }
    });
    
    const companyCategories = Array.from(companyCategoriesSet)
      .map(cat => {
        const catLower = cat.toLowerCase().replace(/\s+/g, '-');
        const categoryMap = {
          'database': 'Database',
          'ai-ml': 'AI/ML',
          'crm': 'CRM',
          'cloud': 'Cloud',
          'security': 'Security',
          'analytics': 'Analytics',
          'infrastructure': 'Infrastructure',
          'devops': 'DevOps'
        };
        const label = categoryMap[catLower] || cat;
        return { id: catLower, label: label, originalName: cat };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    
    // Add ALL option at the end
    companyCategories.push({ id: 'all', label: 'ALL', originalName: 'ALL' });
    
    if (companyCategories.length === 1) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, no categories available for this company.' }]);
      setSelectedCompany(null);
      setConversationStage('greeting');
      return;
    }
    
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `Got it, ${companyName} selected. What would you like to explore?`,
      showCategories: true,
      categories: companyCategories
    }]);
  };

  const handleCategorySelect = (categoryId) => {
    const allCategories = [
      ...dynamicCategories,
      { id: 'all', label: 'ALL' }
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

      // Add thinking message
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Analyzing digital signals and technology indicators...',
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
            { type: 'bot', text: `Looking at ${analysisResults[0].companyName}...` },
            { type: 'bot', text: '', isFormatted: true, data: botMessage }
          ]);
          
          // Add follow-up
          setTimeout(() => {
            setMessages(prev => [...prev, {
              type: 'bot',
              text: 'Want to explore another company or check a different category?',
              showOptions: true,
              options: [
                { id: 'analyze-company', label: 'Analyze another company' },
                { id: 'analyze-category', label: 'View different category' },
                ...(demoViewed ? [] : [{ id: 'see-demo', label: 'View a sample' }])
              ]
            }]);
            
            // Don't reset selectedCompany here - keep it for "View different category" option
            setConversationStage('follow-up');
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
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error while fetching NTP® Next Purchase analysis. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCompanyClick = (company) => {
    setSelectedOptionId(company.id);
    setMessages(prev => [...prev, { type: 'user', text: `Show me ${company.name}` }]);
    
    // Show thinking message
    setMessages(prev => [...prev, { 
      type: 'bot', 
      text: 'Analyzing digital signals and technology indicators...',
      isThinking: true
    }]);
    
    // Simulate analysis delay
    setTimeout(() => {
      showDemoAnalysis(company);
    }, 1500);
  };

  const showDemoAnalysis = (company) => {
    const demoAnalyses = {
      'xyz-technologies': [
        {
          companyName: 'XYZ Technologies',
          domain: 'xyztech.com',
          technology: 'AWS',
          category: 'Cloud',
          purchasePrediction: 'High',
          purchaseProbability: '72%',
          ntpAnalysis: 'XYZ Technologies shows strong signals for cloud infrastructure expansion. Recent hiring of DevOps engineers and published case studies on cloud migration indicate active infrastructure modernization. Multi-cloud strategy signals suggest evaluation of AWS alongside existing platforms.'
        }
      ],
      'abc-systems': [
        {
          companyName: 'ABC Systems',
          domain: 'abcsystems.io',
          technology: 'Okta',
          category: 'Security',
          purchasePrediction: 'High',
          purchaseProbability: '78%',
          ntpAnalysis: 'ABC Systems is actively modernizing identity infrastructure. Recent SOC 2 Type II audit completion and CISO hiring indicate strong focus on identity and access management solutions. Zero-trust architecture adoption is a priority.'
        }
      ]
    };

    const analysis = demoAnalyses[company.id];
    
    // Remove thinking message
    setMessages(prev => prev.filter(msg => !msg.isThinking));
    
    // Add analysis - use same format as real data
    if (analysis && analysis.length > 0) {
      const botMessage = analysis.map((result, idx) => {
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
        { type: 'bot', text: `Looking at ${analysis[0].companyName}...` },
        { type: 'bot', text: '', isFormatted: true, data: botMessage }
      ]);
    }

    // Add follow-up
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'See how specific the signals are? Ready to analyze a company you\'re targeting?',
        showOptions: true,
        options: [
          { id: 'analyze-company', label: 'Let\'s analyze a company' }
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
      
      // Match company name - EXACT match only
      if (rowCompanyName === companyLower) {
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

      // If company name is found, show category selection for that company (works from any stage)
      if (matchedCompany) {
        setSelectedCompany(userMessage);
        setConversationStage('category-input');
        
        // Get unique categories for this company only
        const companyCategoriesSet = new Set();
        data.forEach(row => {
          if (String(row.companyName || '').toLowerCase() === userMessage.toLowerCase() &&
              row.category !== 'Not Detected' &&
              row.purchasePrediction !== 'Not Detected' &&
              row.purchasePrediction !== 'NOT detected') {
            companyCategoriesSet.add(row.category);
          }
        });
        
        const companyCategories = Array.from(companyCategoriesSet)
          .map(cat => {
            const catLower = cat.toLowerCase().replace(/\s+/g, '-');
            const categoryMap = {
              'database': 'Database',
              'ai-ml': 'AI/ML',
              'crm': 'CRM',
              'cloud': 'Cloud',
              'security': 'Security',
              'analytics': 'Analytics',
              'infrastructure': 'Infrastructure',
              'devops': 'DevOps'
            };
            const label = categoryMap[catLower] || cat;
            return { id: catLower, label: label, originalName: cat };
          })
          .sort((a, b) => a.label.localeCompare(b.label));
        
        // Add ALL option at the end
        companyCategories.push({ id: 'all', label: 'ALL', originalName: 'ALL' });
        
        if (companyCategories.length === 1) {
          setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, no categories available for this company.' }]);
          setSelectedCompany(null);
          setConversationStage('greeting');
          return;
        }
        
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `Got it, ${userMessage} selected. What would you like to explore?`,
          showCategories: true,
          categories: companyCategories
        }]);
        return;
      }

      // If no exact match, suggest similar company names (works from any stage)
      if (!matchedCompany) {
        const userMessageLower = userMessage.toLowerCase();
        
        // Get unique companies with valid data
        const uniqueCompanies = new Set();
        data.forEach(row => {
          if (row.category !== 'Not Detected' &&
              row.purchasePrediction !== 'Not Detected' &&
              row.purchasePrediction !== 'NOT detected') {
            uniqueCompanies.add(row.companyName);
          }
        });
        
        // Find companies that contain the user input (one-way matching only)
        const suggestedCompanies = Array.from(uniqueCompanies)
          .filter(company => 
            company.toLowerCase().includes(userMessageLower)
          )
          .slice(0, 5); // Limit to 5 suggestions
        
        if (suggestedCompanies.length > 0) {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: `I couldn't find an exact match for "${userMessage}". Did you mean one of these?`,
            showSuggestedCompanies: true,
            suggestedCompanies: suggestedCompanies
          }]);
          return;
        } else {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: `Sorry, I couldn't find any company matching "${userMessage}". Please try another company name.`
          }]);
          return;
        }
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
            <h3>Your Next Purchase</h3>
            <div className="chatbot-header-buttons">
              <button
                onClick={() => {
                  setIsMinimized(true);
                  setIsOpen(false);
                }}
                className="chatbot-minimize-btn"
                title="Minimize"
              >
                <FaMinus size={16} />
              </button>
              <button
                onClick={() => {
                  setIsMinimized(false);
                  setIsOpen(false);
                  setMessages([{ type: 'bot', isThinking: true }]);
                }}
                className="chatbot-close-btn"
                title="Close"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message-wrapper ${msg.type}`}>
                <div className={`chatbot-message ${msg.type}`}>
                  {msg.type === 'bot' && msg.isGreeting && msg.isGreetingBox ? (
                    <div className="greeting-box">
                      <div className="chatbot-greeting">{msg.text}</div>
                    </div>
                  ) : msg.type === 'bot' && expandedNTP && msg.showOptions && msg.options?.some(opt => opt.id === 'what-is-ntp') ? (
                    <div className="chatbot-ntp-expanded">
                      <div className="chatbot-options">
                        {msg.options.map((option) => {
                          if (option.id === 'what-is-ntp') {
                            return (
                              <div key={option.id} className="chatbot-ntp-description">
                                <div className="ntp-description-header">
                                  <div className="ntp-header-left">
                                    <span className="ntp-icon">💡</span>
                                    <span className="ntp-title">{option.label}</span>
                                  </div>
                                  <button 
                                    className="ntp-collapse-btn"
                                    onClick={() => setExpandedNTP(false)}
                                    title="Close"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="ntp-description-content">
                                  <p>Next Tech Purchase (NTP) predicts which technologies a company is most likely to adopt next based on multiple strategic and behavioral indicators.</p>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <button
                              key={option.id}
                              className="chatbot-option-btn"
                              disabled={option.id !== 'what-is-ntp' && selectedOptionId !== null && selectedOptionId !== option.id && selectedOptionId !== 'what-is-ntp'}
                              onClick={() => {
                                setMessages(prev => [...prev, { type: 'user', text: option.label }]);
                                setSelectedMessageIndex(idx);
                                setSelectedOptionId(option.id);
                                handleOptionClick(option.id);
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : msg.type === 'bot' && msg.showOptions && !msg.isGreeting ? (
                    <div className="chatbot-options">
                      {msg.options.map((option) => (
                        <button
                          key={option.id}
                          className="chatbot-option-btn"
                          disabled={option.id !== 'what-is-ntp' && selectedMessageIndex === idx && selectedOptionId !== null && selectedOptionId !== option.id && selectedOptionId !== 'what-is-ntp'}
                          onClick={() => {
                            if (option.id === 'what-is-ntp') {
                              handleOptionClick(option.id);
                            } else {
                              setMessages(prev => [...prev, { type: 'user', text: option.label }]);
                              setSelectedMessageIndex(idx);
                              setSelectedOptionId(option.id);
                              handleOptionClick(option.id);
                            }
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : msg.type === 'bot' && msg.isGreeting && msg.isGreetingBox ? (
                    <div className="greeting-box">
                      <div className="chatbot-greeting">{msg.text}</div>
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
                        NTP® Analysis: {msg.analysis.companyName}
                      </div>
                      <div className="demo-analysis-section">
                        <div className="demo-section-title">Predicted Next Investments:</div>
                        <ul className="demo-predictions">
                          {msg.analysis.predictions.map((pred, i) => (
                            <li key={i}>{pred}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="demo-analysis-section">
                        <div className="demo-section-title">Intent Signals Detected:</div>
                        <ul className="demo-signals">
                          {msg.analysis.signals.map((signal, i) => (
                            <li key={i}>{signal}</li>
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
                          disabled={selectedMessageIndex === idx && selectedOptionId !== null && selectedOptionId !== company.id}
                          onClick={() => {
                            setSelectedMessageIndex(idx);
                            setSelectedOptionId(company.id);
                            handleDemoCompanyClick(company);
                          }}
                        >
                          {company.name}
                        </button>
                      ))}
                    </div>
                  ) : msg.type === 'bot' && msg.showSuggestedCompanies ? (
                    <div className="chatbot-suggested-companies">
                      <div className="chatbot-suggested-text">{msg.text}</div>
                      <div className="chatbot-suggested-buttons">
                        {msg.suggestedCompanies.map((company, cidx) => (
                          <button
                            key={cidx}
                            className="chatbot-suggested-company-btn"
                            disabled={selectedMessageIndex === idx && selectedOptionId !== null && selectedOptionId !== company}
                            onClick={() => {
                              setSelectedMessageIndex(idx);
                              setSelectedOptionId(company);
                              handleSuggestedCompanyClick(company);
                            }}
                          >
                            {company}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : msg.type === 'bot' && msg.showCategories ? (
                    <div className="chatbot-categories">
                      <div className="chatbot-categories-text">{msg.text}</div>
                      <div className="chatbot-category-buttons">
                        {msg.categories.map((cat) => (
                          <button
                            key={cat.id}
                            className="chatbot-category-btn"
                            disabled={selectedMessageIndex === idx && selectedOptionId !== null && selectedOptionId !== cat.id}
                            onClick={() => {
                              setSelectedMessageIndex(idx);
                              setSelectedOptionId(cat.id);
                              handleCategorySelect(cat.id);
                            }}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : msg.type === 'bot' && msg.showOptions && !msg.isGreeting ? (
                    <div className="chatbot-options-wrapper">
                      <div className="chatbot-text-message">{msg.text}</div>
                      <div className="chatbot-options">
                        {msg.options.map((option) => (
                          <button
                            key={option.id}
                            className="chatbot-option-btn"
                            disabled={option.id !== 'what-is-ntp' && selectedOptionId !== null && selectedOptionId !== option.id && selectedOptionId !== 'what-is-ntp'}
                            onClick={() => {
                              setMessages(prev => [...prev, { type: 'user', text: option.label }]);
                              setSelectedMessageIndex(idx);
                              setSelectedOptionId(option.id);
                              handleOptionClick(option.id);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
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
                  ) : msg.isNote ? (
                    <div className="chatbot-text-message note">{msg.text}</div>
                  ) : msg.text ? (
                    <div>
                      <div className="chatbot-text-message">{msg.displayedText !== undefined ? msg.displayedText : msg.text}</div>
                      {msg.hasSubtext && (
                        <div className="chatbot-subtext">{msg.subtext}</div>
                      )}
                    </div>
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
      ) : isMinimized ? (
        <div className="chatbot-minimized">
          <button
            onClick={() => {
              setIsMinimized(false);
              setIsOpen(true);
            }}
            className="chatbot-minimized-btn"
            title="Open chatbot"
          >
            <span className="minimized-icon">💬</span>
            <span className="minimized-text">Chat</span>
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
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
          {/* <video
            ref={videoRef}
            className="chatbot-video-display"
            autoPlay
            loop
            muted
            playsInline
            src={chatbotVideo}
          /> */}
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
