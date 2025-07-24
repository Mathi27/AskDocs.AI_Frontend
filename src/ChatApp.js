import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const ChatApp = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your PDF assistant. Ask me anything about your documents.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/conversation', 
        { message: input },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      setMessages(prev => [...prev, { 
        text: response.data.response || response.data, 
        sender: 'bot',
        sources: response.data.sources 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, I encountered an error processing your request", 
        sender: 'bot-error' 
      }]);
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>PDF RAG Assistant</h1>
          <p>Query your documents with AI-powered search</p>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <div className="message-content">
                {msg.text}
                {msg.sources && (
                  <div className="sources-badge">
                    <span>📄 Sources: {msg.sources.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="message-content loading">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="chat-input-container">
          <div className="input-wrapper">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your PDF content..."
              disabled={loading}
              aria-label="Type your question"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className={loading ? 'loading' : ''}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <span>Send</span>
              )}
            </button>
          </div>
          <small className="input-hint">
            Powered by RAG (Retrieval Augmented Generation) and LLM technology
          </small>
        </form>
      </main>
    </div>
  );
};

export default ChatApp;