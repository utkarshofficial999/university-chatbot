import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  GraduationCap, 
  User, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2
} from 'lucide-react';
import type { Message, Citation } from '../types';

interface MessageItemProps {
  message: Message;
  onCitationClick: (citation: Citation) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onCitationClick }) => {
  const isAssistant = message.sender === 'assistant';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      margin: '14px 0',
      alignItems: isAssistant ? 'flex-start' : 'flex-end',
      width: '100%'
    }}>
      {/* Sender Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 4px',
        fontSize: '0.78rem'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isAssistant ? 'linear-gradient(135deg, #762b2a, #4a1514)' : 'rgba(56, 189, 248, 0.2)',
          color: isAssistant ? '#e5a958' : '#38bdf8',
          border: `1px solid ${isAssistant ? '#e5a958' : 'rgba(56, 189, 248, 0.4)'}`,
          boxShadow: isAssistant ? '0 0 10px rgba(118, 43, 42, 0.4)' : 'none'
        }}>
          {isAssistant ? <GraduationCap size={13} color="#ffffff" /> : <User size={13} />}
        </div>
        <span style={{ fontWeight: 600, color: isAssistant ? '#fed7aa' : '#e2e8f0' }}>
          {isAssistant ? 'ABES AI Assistant' : 'You'}
        </span>
      </div>

      {/* Bubble Container */}
      <div style={{
        maxWidth: isAssistant ? '86%' : '76%',
        background: isAssistant 
          ? 'linear-gradient(180deg, rgba(12, 29, 54, 0.95) 0%, rgba(8, 20, 38, 0.98) 100%)' 
          : 'linear-gradient(135deg, #762b2a 0%, #8f3231 100%)',
        border: `1px solid ${isAssistant ? 'rgba(118, 43, 42, 0.35)' : 'rgba(229, 169, 88, 0.3)'}`,
        backdropFilter: 'blur(12px)',
        borderRadius: isAssistant ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
        padding: '16px 20px',
        boxShadow: isAssistant 
          ? '0 6px 24px rgba(0, 0, 0, 0.35), 0 0 15px rgba(118, 43, 42, 0.1)' 
          : '0 4px 18px rgba(118, 43, 42, 0.35)',
        position: 'relative'
      }}>
        {/* Content */}
        <div className="prose">
          {isAssistant ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', color: '#ffffff', fontWeight: 500 }}>
              {message.content}
            </div>
          )}
        </div>

        {/* References Cited */}
        {isAssistant && message.citations && message.citations.length > 0 && (
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.73rem',
              color: '#fed7aa',
              fontWeight: 600,
              letterSpacing: '0.03em',
              marginBottom: '8px'
            }}>
              <CheckCircle2 size={13} color="#10b981" />
              Verified Official Reference Sources ({message.citations.length})
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {message.citations.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onCitationClick(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(118, 43, 42, 0.25)',
                    border: '1px solid rgba(118, 43, 42, 0.45)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.77rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(118, 43, 42, 0.45)';
                    e.currentTarget.style.borderColor = '#e5a958';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(118, 43, 42, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(118, 43, 42, 0.45)';
                  }}
                >
                  <FileText size={12} color="#e5a958" />
                  <span style={{ fontWeight: 500, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.document_title}
                  </span>
                  <span style={{ 
                    color: '#fed7aa', 
                    background: 'rgba(229, 169, 88, 0.2)', 
                    padding: '1px 6px', 
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 600 
                  }}>
                    p.{c.page_number}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Actions */}
        {isAssistant && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '8px',
            gap: '8px'
          }}>
            <button
              onClick={handleCopy}
              title="Copy answer"
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? '#10b981' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                padding: '4px 6px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
