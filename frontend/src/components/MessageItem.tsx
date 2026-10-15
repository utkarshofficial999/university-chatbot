import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  GraduationCap, 
  User, 
  Copy, 
  Check, 
  FileText, 
  BookmarkCheck
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
      gap: '8px',
      margin: '18px 0',
      alignItems: isAssistant ? 'flex-start' : 'flex-end',
      width: '100%'
    }}>
      {/* Sender Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 4px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isAssistant ? 'rgba(229, 169, 88, 0.2)' : 'rgba(56, 189, 248, 0.2)',
          color: isAssistant ? 'var(--accent-gold)' : 'var(--accent-blue)',
          border: `1px solid ${isAssistant ? 'rgba(229, 169, 88, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
        }}>
          {isAssistant ? <GraduationCap size={13} /> : <User size={13} />}
        </div>
        <span style={{ fontWeight: 600, color: isAssistant ? 'var(--accent-gold)' : '#e2e8f0' }}>
          {isAssistant ? 'ABES Knowledge Assistant' : 'You'}
        </span>
      </div>

      {/* Bubble Container */}
      <div style={{
        maxWidth: isAssistant ? '88%' : '78%',
        background: isAssistant 
          ? 'linear-gradient(180deg, rgba(17, 31, 56, 0.85) 0%, rgba(13, 25, 46, 0.95) 100%)' 
          : 'linear-gradient(135deg, rgba(229, 169, 88, 0.25) 0%, rgba(200, 130, 40, 0.2) 100%)',
        border: `1px solid ${isAssistant ? 'rgba(229, 169, 88, 0.18)' : 'rgba(229, 169, 88, 0.4)'}`,
        backdropFilter: 'blur(10px)',
        borderRadius: isAssistant ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
        padding: '16px 20px',
        boxShadow: isAssistant ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(229, 169, 88, 0.1)',
        position: 'relative'
      }}>
        {/* Content */}
        <div className="prose">
          {isAssistant ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', color: '#fff' }}>
              {message.content}
            </div>
          )}
        </div>

        {/* Citations List if Assistant */}
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
              fontSize: '0.74rem',
              color: 'var(--accent-gold)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px'
            }}>
              <BookmarkCheck size={13} />
              Authoritative ABES Sources Cited ({message.citations.length})
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
                    background: 'rgba(229, 169, 88, 0.08)',
                    border: '1px solid rgba(229, 169, 88, 0.28)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.78rem',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(229, 169, 88, 0.2)';
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(229, 169, 88, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(229, 169, 88, 0.28)';
                  }}
                >
                  <FileText size={13} color="var(--accent-gold)" />
                  <span style={{ fontWeight: 500, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.document_title}
                  </span>
                  <span style={{ 
                    color: 'var(--accent-gold)', 
                    background: 'rgba(229, 169, 88, 0.15)', 
                    padding: '1px 5px', 
                    borderRadius: '4px',
                    fontSize: '0.7rem' 
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
              title="Copy to clipboard"
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? 'var(--accent-emerald)' : 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                padding: '4px 6px',
                borderRadius: '4px'
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
