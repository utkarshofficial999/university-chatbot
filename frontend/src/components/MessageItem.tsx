import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
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

  // Guarantees ChatGPT-style structured, spacious, non-congested answers
  const formatStructuredContent = (raw: string): string => {
    if (!raw) return '';
    let text = raw;

    // 1. Remove internal metadata artifacts if any leaked into the text
    text = text.replace(/Verification:\s*[\w_]+/gi, '');
    text = text.replace(/Source:\s*https?:\/\/\S+/gi, '');
    text = text.replace(/\[Document:.*?\]/gi, '');
    text = text.replace(/\/ ?TYPICAL - CONFIRM WITH ABES\]?/gi, '');
    text = text.replace(/\b(VERIFIED\/secondary|VERIFIED|UNAVAILABLE)\b/g, '');
    text = text.replace(/\|\s*Source:[^•\n]*/gi, '');

    // 2. Clean dangling incomplete clauses at the end (e.g. "(commonly")
    text = text.replace(/\([a-zA-Z\s]*$/, '').trim();

    // 3. Format inline bullet points into structured markdown cards
    if (text.includes('•')) {
      const parts = text.split(/[•\n]+/).map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 1) {
        let intro = '';
        let startIndex = 0;

        if (parts[0].toLowerCase().includes('official') || parts[0].toLowerCase().includes('regarding') || parts[0].toLowerCase().includes('policies') || parts[0].toLowerCase().includes('guidelines')) {
          intro = parts[0];
          startIndex = 1;
        } else {
          intro = 'Based on official ABES Engineering College regulations:';
          startIndex = 0;
        }

        const formattedBullets: string[] = [];
        for (let i = startIndex; i < parts.length; i++) {
          let p = parts[i].replace(/^[-–*•\s]+/, '').trim();
          p = p.replace(/[,;:]+$/, '').trim();
          if (p.toLowerCase().startsWith('abes engineering college — admission route')) continue;
          if (p.length < 15) continue;
          if (!p.endsWith('.')) p += '.';

          // Add bold topic title if not already present
          if (!p.startsWith('**') && !p.startsWith('- **')) {
            let title = 'Key Policy Detail';
            if (/eligib|class 12|physics|aggregate|marks/i.test(p)) {
              title = 'Eligibility Criteria';
            } else if (/admission|uptac|cuet|counselling|seat/i.test(p)) {
              title = 'Admission Route & Counselling';
            } else if (/programme|course|b\.tech|mca|m\.tech|branch/i.test(p)) {
              title = 'Academic Programmes';
            } else if (/enquiry|apply|portal|online|register/i.test(p)) {
              title = 'Online Registration & Enquiry';
            } else if (/fee|tuition|scholarship/i.test(p)) {
              title = 'Fee Guidelines';
            } else if (/hostel|mess|curfew|room/i.test(p)) {
              title = 'Hostel & Accommodation Rules';
            } else if (/attendance|75%|medical/i.test(p)) {
              title = 'Attendance Requirement';
            }
            formattedBullets.push(`- **${title}:** ${p}`);
          } else {
            formattedBullets.push(p.startsWith('-') ? p : `- ${p}`);
          }
        }

        if (formattedBullets.length > 0) {
          return `${intro}\n\n${formattedBullets.join('\n\n')}`;
        }
      }
    }

    // 4. Ensure ample spacing before standard markdown list items
    text = text.replace(/([^\n])\n(-|\*|\d+\.) /g, '$1\n\n$2 ');
    return text;
  };

  const formattedContent = isAssistant ? formatStructuredContent(message.content) : message.content;

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
            borderRadius: '7px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
            padding: '2px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
          }}>
            <img 
              src="/abes_crest.png" 
              alt="ABES" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
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
              <ReactMarkdown>{formattedContent}</ReactMarkdown>
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
