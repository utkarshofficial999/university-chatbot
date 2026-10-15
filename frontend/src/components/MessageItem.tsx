import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  GraduationCap, 
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
      margin: '18px 0',
      alignItems: isAssistant ? 'flex-start' : 'flex-end',
      width: '100%'
    }}>
      {isAssistant ? (
        /* Assistant Message Layout (ChatGPT / Claude Style) */
        <div style={{
          display: 'flex',
          gap: '14px',
          width: '100%',
          alignItems: 'flex-start'
        }}>
          {/* Avatar */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#851926',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
            boxShadow: '0 2px 6px rgba(133, 25, 38, 0.2)'
          }}>
            <GraduationCap size={15} color="#ffffff" />
          </div>

          {/* Content Column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header / Name */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                ABES Assistant
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>•</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Verified Policy</span>
            </div>

            {/* Markdown Body */}
            <div className="prose">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Verified Citations List */}
            {message.citations && message.citations.length > 0 && (
              <div style={{
                marginTop: '14px',
                paddingTop: '10px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.74rem',
                  color: '#475569',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  <CheckCircle2 size={13} color="#059669" />
                  Official Document Citations ({message.citations.length}):
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
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        color: '#334155',
                        fontSize: '0.76rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#0f172a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#334155';
                      }}
                    >
                      <FileText size={12} color="#851926" />
                      <span style={{ fontWeight: 500, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.document_title}
                      </span>
                      <span style={{ 
                        color: '#851926', 
                        backgroundColor: '#fdf2f2', 
                        border: '1px solid #fecdd3',
                        padding: '1px 5px', 
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

            {/* Action Bar (Copy) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '10px'
            }}>
              <button
                onClick={handleCopy}
                title="Copy answer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? '#059669' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!copied) e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  if (!copied) e.currentTarget.style.color = '#94a3b8';
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* User Message Layout (Clean Gray Pill Bubble) */
        <div style={{
          maxWidth: '75%',
          backgroundColor: '#f1f5f9',
          color: '#0f172a',
          borderRadius: '18px 18px 4px 18px',
          padding: '10px 18px',
          fontSize: '0.94rem',
          lineHeight: 1.55,
          fontWeight: 450,
          whiteSpace: 'pre-wrap',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          {message.content}
        </div>
      )}
    </div>
  );
};
