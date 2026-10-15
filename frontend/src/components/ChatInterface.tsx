import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  GraduationCap,
  Calendar,
  CreditCard,
  Building
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Track if user is reading older messages or stayed near bottom
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    setInput('');
    isNearBottomRef.current = true;
    onSendMessage(q);
  };

  const suggestionChips = [
    {
      label: "Attendance Criteria (75%)",
      prompt: "What is the minimum attendance required to appear in semester exams at ABES?",
      icon: <GraduationCap size={15} color="#8B1E2D" />
    },
    {
      label: "Exams & Grace Marks",
      prompt: "What are the rules regarding backlogs, grace marks, and year-back at ABES?",
      icon: <Calendar size={15} color="#0284c7" />
    },
    {
      label: "Hostel & Curfew Timings",
      prompt: "What are the hostel rules, night-out leaves, and curfew timings at ABES?",
      icon: <Building size={15} color="#059669" />
    },
    {
      label: "Fee & Refund Policies",
      prompt: "What is the fee payment schedule, late fine policy, and refund rules at ABES?",
      icon: <CreditCard size={15} color="#D4A72C" />
    }
  ];

  const renderInputForm = (isCentered: boolean = false) => (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '28px',
        border: '1px solid #E5E7EB',
        boxShadow: isCentered 
          ? '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        padding: isCentered ? '6px 8px 6px 20px' : '4px 6px 4px 16px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        minHeight: isCentered ? '54px' : '48px',
        width: '100%'
      }}
    >
      <input
        className="chat-input-field"
        type="text"
        placeholder={
          selectedCategory !== 'All' 
            ? `Ask about ${selectedCategory}...`
            : "Ask about ABES policies, attendance, fees, exams..."
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        autoFocus={isCentered}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#1F2937',
          fontSize: isCentered ? '0.96rem' : '0.92rem',
          padding: '8px 4px'
        }}
      />

      {selectedCategory !== 'All' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.7rem',
          color: '#8B1E2D',
          backgroundColor: '#FDF2F4',
          border: '1px solid #FCE7E9',
          padding: '2px 7px',
          borderRadius: '6px',
          marginRight: '6px',
          whiteSpace: 'nowrap'
        }}>
          {selectedCategory}
        </div>
      )}

      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        aria-label="Send message"
        style={{
          width: isCentered ? '40px' : '38px',
          height: isCentered ? '40px' : '38px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: input.trim() && !isLoading ? '#8B1E2D' : '#F3F4F6',
          color: input.trim() && !isLoading ? '#ffffff' : '#9CA3AF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s ease',
          flexShrink: 0
        }}
      >
        <ArrowUp size={isCentered ? 19 : 18} />
      </button>
    </form>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flex: 1,
      minHeight: 0,
      backgroundColor: '#F8F9FB',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Messages Scroll Area */}
      <div 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="chat-scroll-area" 
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 16px 12px 16px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          maxWidth: '820px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          flex: messages.length === 0 ? 1 : undefined,
          justifyContent: messages.length === 0 ? 'center' : undefined
        }}>
          {messages.length === 0 ? (
            /* Centered ChatGPT / LLM Style Landing */
            <div style={{
              margin: 'auto auto',
              textAlign: 'center',
              padding: '20px 12px',
              maxWidth: '640px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* College Crest */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                padding: '7px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
              }}>
                <img 
                  src="/abes_crest.png" 
                  alt="ABES Engineering College" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              <h2 style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '1.65rem', 
                color: '#111827', 
                fontWeight: 650, 
                marginBottom: '8px',
                letterSpacing: '-0.025em'
              }}>
                How can I help you today?
              </h2>

              <p style={{ 
                fontSize: '0.88rem', 
                color: '#6B7280', 
                lineHeight: 1.5, 
                marginBottom: '24px', 
                maxWidth: '420px'
              }}>
                Ask any question about ABES college policies, attendance, exams, or hostel rules.
              </p>

              {/* Textbox IN THE MIDDLE like ChatGPT */}
              <div style={{ width: '100%', maxWidth: '620px', marginBottom: '20px' }}>
                {renderInputForm(true)}
              </div>

              {/* Clean Scannable Prompt Cards */}
              <div className="clean-prompt-grid" style={{ width: '100%', maxWidth: '620px' }}>
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(chip.prompt)}
                    className="clean-prompt-card"
                  >
                    <div className="clean-prompt-icon-box">
                      {chip.icon}
                    </div>
                    <span className="clean-prompt-text">{chip.label}</span>
                  </button>
                ))}
              </div>

              <div style={{
                textAlign: 'center',
                marginTop: '18px',
                fontSize: '0.72rem',
                color: '#9CA3AF',
                letterSpacing: '0.01em'
              }}>
                We are continuously improving to give accurate answers.
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

          {/* Typing Indicator */}
          {isLoading && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              margin: '8px 0',
              maxWidth: '280px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div className="typing-indicator" style={{ display: 'flex', alignItems: 'center' }}>
                <span />
                <span />
                <span />
              </div>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 500 }}>
                Consulting official regulations...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Docked Input Bar (Only visible during active conversation, like ChatGPT) */}
      {messages.length > 0 && (
        <div style={{
          padding: '8px 14px',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
          backgroundColor: '#F8F9FB',
          borderTop: '1px solid rgba(229, 231, 235, 0.7)',
          flexShrink: 0
        }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            {renderInputForm(false)}

            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              fontSize: '0.72rem',
              color: '#9CA3AF',
              letterSpacing: '0.01em'
            }}>
              We are continuously improving to give accurate answers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
