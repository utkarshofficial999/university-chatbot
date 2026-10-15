import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  GraduationCap, 
  BookOpen, 
  Home, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import type { Message, Citation } from '../types';
import { MessageItem } from './MessageItem';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (query: string) => void;
  onCitationClick: (citation: Citation) => void;
  selectedCategory: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onCitationClick,
  selectedCategory
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    setInput('');
    onSendMessage(q);
  };

  const starterPrompts = [
    {
      title: "Attendance Regulations",
      prompt: "What is the minimum attendance required to appear in semester exams at ABES?",
      icon: <GraduationCap size={15} color="#851926" />
    },
    {
      title: "Programmes & Intake",
      prompt: "What are the B.Tech programmes offered and what is the college code for ABES?",
      icon: <BookOpen size={15} color="#0284c7" />
    },
    {
      title: "Hostel Rules & Curfew",
      prompt: "What are the hostel rules, night-out leaves, and curfew timings at ABES?",
      icon: <Home size={15} color="#059669" />
    },
    {
      title: "Anti-Ragging & Helplines",
      prompt: "What is the official anti-ragging policy, grievance mechanism, and helpline?",
      icon: <ShieldAlert size={15} color="#dc2626" />
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flex: 1,
      backgroundColor: '#ffffff',
      position: 'relative'
    }}>
      {/* Messages Scroll Area (Centered ChatGPT / Claude reading column) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          maxWidth: '780px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              padding: '40px 10px 20px 10px'
            }}>
              {/* Institutional Crest */}
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                padding: '8px',
                boxShadow: '0 6px 16px rgba(133, 25, 38, 0.12)'
              }}>
                <img 
                  src="/abes_crest.png" 
                  alt="ABES Engineering College Crest" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '3px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                color: '#475569',
                fontWeight: 500,
                marginBottom: '14px'
              }}>
                <Sparkles size={12} color="#851926" />
                ABES Engineering College • AKTU Code 032
              </div>

              <h2 style={{ 
                fontFamily: 'var(--font-serif)',
                fontSize: '2.1rem', 
                color: '#0f172a', 
                fontWeight: 600, 
                marginBottom: '10px',
                letterSpacing: '-0.02em'
              }}>
                How can I help you today?
              </h2>

              <p style={{ 
                fontSize: '0.96rem', 
                color: '#64748b', 
                lineHeight: 1.6, 
                marginBottom: '32px', 
                maxWidth: '560px', 
                margin: '0 auto 32px auto' 
              }}>
                Ask any question about academic guidelines, autonomous regulations, hostel rules, fees, or examination policies.
              </p>

              {/* Starter Question Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
                textAlign: 'left'
              }}>
                {starterPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(p.prompt)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: 'var(--shadow-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.icon}
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                        {p.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
                      "{p.prompt}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <MessageItem
                key={m.id}
                message={m}
                onCitationClick={onCitationClick}
              />
            ))
          )}

          {/* Minimalist Typing Indicator */}
          {isLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              margin: '12px 0',
              maxWidth: '300px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div className="typing-indicator" style={{ display: 'flex', alignItems: 'center' }}>
                <span />
                <span />
                <span />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                Consulting official ABES handbooks...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating ChatGPT / Claude style Input Bar */}
      <div style={{
        padding: '12px 24px 20px 24px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f1f5f9'
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <form
            onSubmit={handleSubmit}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #cbd5e1',
              boxShadow: 'var(--shadow-float)',
              padding: '6px 8px 6px 18px',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <input
              type="text"
              placeholder={
                selectedCategory !== 'All' 
                  ? `Ask about ${selectedCategory}...`
                  : "Ask a question about ABES policies, attendance, fees, hostel, syllabus..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#0f172a',
                fontSize: '0.94rem',
                padding: '8px 4px'
              }}
            />

            {selectedCategory !== 'All' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.72rem',
                color: '#851926',
                backgroundColor: '#fdf2f2',
                border: '1px solid #fecdd3',
                padding: '3px 8px',
                borderRadius: '6px',
                marginRight: '6px'
              }}>
                {selectedCategory}
              </div>
            )}

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: input.trim() && !isLoading ? '#0f172a' : '#f1f5f9',
                color: input.trim() && !isLoading ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <ArrowUp size={18} />
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '8px',
            fontSize: '0.72rem',
            color: '#94a3b8'
          }}>
            ABES Campus AI Assistant answers from official verified handbooks (AKTU Code 032).
          </div>
        </div>
      </div>
    </div>
  );
};
