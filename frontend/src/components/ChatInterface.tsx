import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
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
      title: "Exam Attendance Rules",
      prompt: "What is the minimum attendance required to appear in semester exams at ABES?",
      icon: <GraduationCap size={16} color="#e5a958" />
    },
    {
      title: "Programmes & College Code",
      prompt: "What are the B.Tech programmes offered and what is the college code for ABES?",
      icon: <BookOpen size={16} color="#38bdf8" />
    },
    {
      title: "Hostel Rules & Curfew",
      prompt: "What are the hostel rules, night-out leaves, and curfew timings at ABES?",
      icon: <Home size={16} color="#10b981" />
    },
    {
      title: "Anti-Ragging & Helplines",
      prompt: "What is the anti-ragging policy, grievance mechanism, and helpline numbers?",
      icon: <ShieldAlert size={16} color="#f43f5e" />
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flex: 1,
      backgroundColor: 'transparent',
      position: 'relative'
    }}>
      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            maxWidth: '700px',
            textAlign: 'center',
            padding: '20px 10px'
          }}>
            {/* College Crest Emblem */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #762b2a 0%, #4a1514 100%)',
              border: '2px solid #e5a958',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 25px rgba(118, 43, 42, 0.45)'
            }}>
              <GraduationCap size={34} color="#ffffff" />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(118, 43, 42, 0.25)',
              border: '1px solid rgba(118, 43, 42, 0.5)',
              padding: '3px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: '#fca5a5',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              <Sparkles size={12} color="#e5a958" />
              Official Campus AI Assistant • AKTU Code 032
            </div>

            <h2 style={{ fontSize: '1.85rem', color: '#fff', fontWeight: 700, marginBottom: '8px' }}>
              Welcome to ABES Engineering College
            </h2>

            <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '28px', maxWidth: '580px', margin: '0 auto 28px auto' }}>
              Hello! I am your AI campus advisor. Ask me anything about courses, academic regulations, examination criteria, hostel policies, or fee details.
            </p>

            {/* Quick Questions Grid */}
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
                    borderRadius: '12px',
                    backgroundColor: 'rgba(12, 29, 54, 0.85)',
                    border: '1px solid rgba(118, 43, 42, 0.35)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#e5a958';
                    e.currentTarget.style.backgroundColor = 'rgba(18, 42, 76, 0.95)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(118, 43, 42, 0.35)';
                    e.currentTarget.style.backgroundColor = 'rgba(12, 29, 54, 0.85)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.icon}
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                      {p.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
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

        {/* Realistic Chatbot Typing / Thinking Indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 18px',
            margin: '12px 0',
            maxWidth: '340px',
            background: 'rgba(12, 29, 54, 0.9)',
            borderRadius: '16px',
            border: '1px solid rgba(118, 43, 42, 0.4)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="typing-indicator" style={{ display: 'flex', alignItems: 'center' }}>
              <span />
              <span />
              <span />
            </div>
            <span style={{ fontSize: '0.84rem', color: '#fed7aa', fontWeight: 500 }}>
              Checking official ABES records...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div style={{
        padding: '16px 32px 20px 32px',
        backgroundColor: 'rgba(6, 14, 26, 0.92)',
        borderTop: '1px solid rgba(118, 43, 42, 0.3)',
        backdropFilter: 'blur(16px)'
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(10, 24, 44, 0.9)',
            borderRadius: '16px',
            border: '1px solid rgba(118, 43, 42, 0.45)',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.45)',
            padding: '6px 8px 6px 16px'
          }}
        >
          <input
            type="text"
            placeholder={
              selectedCategory !== 'All' 
                ? `Ask anything about ${selectedCategory}...`
                : "Ask anything about ABES rules, programmes, attendance, hostel curfew, exams..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.92rem',
              padding: '10px 8px'
            }}
          />

          {selectedCategory !== 'All' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: '#fed7aa',
              background: 'rgba(118, 43, 42, 0.35)',
              border: '1px solid rgba(118, 43, 42, 0.6)',
              padding: '4px 10px',
              borderRadius: '6px',
              marginRight: '8px'
            }}>
              {selectedCategory}
            </div>
          )}

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              border: 'none',
              background: input.trim() && !isLoading ? 'linear-gradient(135deg, #762b2a 0%, #983837 100%)' : 'rgba(255, 255, 255, 0.08)',
              color: input.trim() && !isLoading ? '#ffffff' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              boxShadow: input.trim() && !isLoading ? '0 2px 10px rgba(118, 43, 42, 0.5)' : 'none'
            }}
          >
            <Send size={18} />
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '0.73rem',
          color: '#64748b'
        }}>
          Official AI Campus Assistant for ABES Engineering College (AKTU Code: 032). Responses are verified from institutional handbooks.
        </div>
      </div>
    </div>
  );
};
