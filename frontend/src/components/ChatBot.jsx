import React, { useState, useRef, useEffect } from 'react';
import { chatbotKnowledge } from '../utils/chatbotKnowledge';

const ChatBot = ({ isAuthenticated, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I can help you find data across our platform. What are you looking for?' }
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

  const findRelevantPages = (query) => {
    const queryLower = query.toLowerCase();
    const results = [];

    chatbotKnowledge.forEach(page => {
      let score = 0;
      
      page.keywords.forEach(keyword => {
        if (queryLower.includes(keyword)) {
          score += 2;
        }
      });

      page.dataFields.forEach(field => {
        if (queryLower.includes(field.toLowerCase())) {
          score += 1;
        }
      });

      if (queryLower.includes(page.page.toLowerCase())) {
        score += 3;
      }

      if (score > 0) {
        results.push({ ...page, score });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  const callGeminiAPI = async (userMessage) => {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCp6NxWgP296VMmO90xb1UbKyKatXorZ3Q',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful assistant for a business intelligence platform. A user is asking: "${userMessage}". 
                
Based on this question, provide a brief, friendly response (1-2 sentences) about what data they might be looking for. Be conversational and helpful.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I can help you find that information.';
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'I can help you find that information.';
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const relevantPages = findRelevantPages(userMessage);
      const aiResponse = await callGeminiAPI(userMessage);

      let botMessage = aiResponse;

      if (relevantPages.length > 0) {
        botMessage += '\n\nYou might find this on:';
        relevantPages.forEach(page => {
          botMessage += `\n• ${page.page}: ${page.description}`;
        });
      } else {
        botMessage += '\n\nI couldn\'t find a specific page for that. Try asking about Intent, Technographics, NTP, Buying Groups, or Financial data.';
      }

      setMessages(prev => [...prev, { type: 'bot', text: botMessage, pages: relevantPages }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
      setIsOpen(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {isOpen ? (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 5px 40px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Data Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: msg.type === 'user' ? '#3b82f6' : '#f3f4f6',
                  color: msg.type === 'user' ? 'white' : '#1f2937',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.text}
                  {msg.pages && msg.pages.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {msg.pages.map((page, i) => (
                        <button
                          key={i}
                          onClick={() => handleNavigate(page)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: msg.type === 'user' ? 'rgba(255,255,255,0.2)' : '#dbeafe',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: msg.type === 'user' ? 'white' : '#1e40af',
                            textAlign: 'left',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = msg.type === 'user' ? 'rgba(255,255,255,0.3)' : '#bfdbfe';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = msg.type === 'user' ? 'rgba(255,255,255,0.2)' : '#dbeafe';
                          }}
                        >
                          → {page.page}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280'
                }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading || !input.trim() ? 0.6 : 1
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            hover: { transform: 'scale(1.1)' }
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatBot;
