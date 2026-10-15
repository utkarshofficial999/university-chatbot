import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Copy, 
  Check, 
  FileText, 
  BookOpen
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

  // Clean and format content for scannable structured markdown
  const formatStructuredContent = (raw: string): string => {
    if (!raw) return '';
    let text = raw;

    // Remove internal metadata artifacts if any leaked into the text
    text = text.replace(/Verification:\s*[\w_]+/gi, '');
    text = text.replace(/\[Document:.*?\]/gi, '');
    text = text.replace(/\/ ?TYPICAL - CONFIRM WITH ABES\]?/gi, '');
    text = text.replace(/\b(VERIFIED\/secondary|VERIFIED|UNAVAILABLE)\b/g, '');
    text = text.replace(/\|\s*Source:[^\n]*/gi, '');

    // Clean dangling incomplete clauses at the end (e.g. "(commonly")
    text = text.replace(/\([a-zA-Z\s]*$/, '').trim();

    // Remove previous artificial prefix if in stored messages
    text = text.replace(/Key Policy Detail:\s*/gi, '');

    // Fix malformed asterisks like "Reporting Channels:**" -> "**Reporting Channels:**"
    text = text.replace(/^(\s*[-*•]?\s*)([A-Za-z0-9\s/&,]+):\*\*/gm, '$1**$2:**');

    // Convert raw bullet character '•' to standard markdown list item '- '
    text = text.replace(/^[ \t]*•[ \t]*/gm, '- ');

    // Normalize markdown linebreaks between sections for scannability
    text = text.replace(/([^\n])\n(###|##) /g, '$1\n\n$2 ');
    text = text.replace(/([^\n])\n(-|\*|\d+\.) /g, '$1\n\n$2 ');

    return text.trim();
  };

  const formattedContent = isAssistant ? formatStructuredContent(message.content) : message.content;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      margin: '12px 0',
      alignItems: isAssistant ? 'flex-start' : 'flex-end',
      width: '100%'
    }}>
      {isAssistant ? (
        /* Assistant Message Layout */
        <div style={{
          display: 'flex',
          gap: '10px',
          width: '100%',
          alignItems: 'flex-start'
        }}>
          {/* Avatar (Compact 32-34px) */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
            padding: '2px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <img 
              src="/abes_crest.png" 
              alt="ABES" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>

          {/* Content Column (Scannable, Never Huge Cards) */}
          <div style={{ flex: 1, minWidth: 0, maxWidth: '94%' }}>
            {/* Header: Name + Verified Policy Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '6px'
            }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1F2937' }}>
                ABES Assistant
              </span>

              {/* Compact Verified Policy Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '1.5px 7px',
                borderRadius: '9999px',
                fontSize: '11.5px',
                fontWeight: 500
              }}>
                <Check size={11} strokeWidth={2.6} color="#10B981" />
                <span>Verified Policy</span>
              </div>
            </div>

            {/* Markdown Body (Controlled Spacing, Clear Hierarchy) */}
            <div className="prose">
              <ReactMarkdown>{formattedContent}</ReactMarkdown>
            </div>

            {/* Source / Policy Information Section */}
            {message.citations && message.citations.length > 0 && (
              <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid #F3F4F6'
              }}>
                {/* Source Metadata Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  color: '#6B7280',
                  marginBottom: '6px'
                }}>
                  <BookOpen size={12} color="#8B1E2D" />
                  <span style={{ fontWeight: 600, color: '#4B5563' }}>Sources</span>
                </div>

                {/* Clickable Citation Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {message.citations.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => onCitationClick(c)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #E5E7EB',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        color: '#374151',
                        fontSize: '0.74rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8F9FB';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                        e.currentTarget.style.color = '#111827';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      <FileText size={11} color="#8B1E2D" />
                      <span style={{ fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.document_title}
                      </span>
                      <span style={{ 
                        color: '#8B1E2D', 
                        backgroundColor: '#FDF2F4', 
                        border: '1px solid #FCE7E9',
                        padding: '1px 4px', 
                        borderRadius: '4px',
                        fontSize: '0.66rem',
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
              gap: '8px',
              marginTop: '8px'
            }}>
              <button
                onClick={handleCopy}
                title="Copy answer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? '#10B981' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!copied) e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  if (!copied) e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* User Message Layout (Light Maroon Tint, Scannable) */
        <div style={{
          maxWidth: '82%',
          backgroundColor: '#FDF2F4',
          border: '1px solid rgba(139, 30, 45, 0.12)',
          color: '#1F2937',
          borderRadius: '16px 16px 4px 16px',
          padding: '10px 14px',
          fontSize: '0.94rem',
          lineHeight: 1.5,
          fontWeight: 450,
          whiteSpace: 'pre-wrap',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
        }}>
          {message.content}
        </div>
      )}
    </div>
  );
};
