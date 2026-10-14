import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  GraduationCap, 
  BookOpen, 
  Home, 
  Scale
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
      prompt: "What is the minimum attendance requirement according to Jaipuria regulations?",
      icon: <GraduationCap size={16} color="var(--accent-gold)" />
    },
    {
      title: "Library Entitlement",
      prompt: "What is the library book borrowing entitlement for students and faculty?",
      icon: <BookOpen size={16} color="#38bdf8" />
    },
    {
      title: "Hostel Residence Rules",
      prompt: "What are the rules, curfew timings, and conduct regulations for the hostel?",
      icon: <Home size={16} color="#10b981" />
    },
    {
      title: "Anti-Ragging & Safety",
      prompt: "What is Jaipuria's official anti-ragging policy and grievance redressal process?",
      icon: <Scale size={16} color="#f43f5e" />
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
            maxWidth: '680px',
            textAlign: 'center',
            padding: '30px 10px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(229, 169, 88, 0.2) 0%, rgba(200, 130, 40, 0.05) 100%)',
              border: '1px solid rgba(229, 169, 88, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              boxShadow: '0 0 25px rgba(229, 169, 88, 0.2)'
            }}>
              <GraduationCap size={30} color="var(--accent-gold)" />
            </div>

            <h2 style={{ fontSize: '1.7rem', color: '#fff', fontWeight: 700, marginBottom: '8px' }}>
              Welcome to Jaipuria Knowledge Assistant
            </h2>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
              Ask questions directly against official, verified <strong>Jaipuria Institute of Management</strong> policy documents, academic handbooks, hostel regulations, library procedures, and calendars.
            </p>

            {/* Starter Prompts Grid */}
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
                  className="glass-panel"
                  style={{
                    padding: '14px 16px',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(229, 169, 88, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.icon}
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>
                      {p.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
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

        {/* Streaming / Loading Indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 20px',
            margin: '12px 0',
            maxWidth: '380px',
            background: 'rgba(17, 31, 56, 0.7)',
            borderRadius: '12px',
            border: '1px solid var(--border-light)'
          }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: '0.84rem', color: 'var(--accent-gold)', fontWeight: 500 }}>
              Retrieving & verifying Jaipuria regulations...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div style={{
        padding: '16px 32px 24px 32px',
        backgroundColor: 'rgba(7, 13, 25, 0.9)',
        borderTop: '1px solid var(--border-light)',
        backdropFilter: 'blur(12px)'
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-input)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.4)',
            padding: '6px 8px 6px 16px'
          }}
        >
          <input
            type="text"
            placeholder={
              selectedCategory !== 'All' 
                ? `Ask anything about ${selectedCategory}...`
                : "Ask any question about Jaipuria rules, academic policy, attendance, hostel, exams..."
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
              color: 'var(--accent-gold)',
              background: 'rgba(229, 169, 88, 0.12)',
              border: '1px solid rgba(229, 169, 88, 0.25)',
              padding: '4px 8px',
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
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: 'none',
              background: input.trim() && !isLoading ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.08)',
              color: input.trim() && !isLoading ? '#070d19' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <Send size={18} />
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '0.72rem',
          color: 'var(--text-dim)'
        }}>
          Jaipuria RAG Engine answers strictly based on official indexed policies. Citations indicate source document and page number.
        </div>
      </div>
    </div>
  );
};
