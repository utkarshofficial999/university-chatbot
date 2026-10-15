import React from 'react';
import { X, FileText, ExternalLink, ShieldCheck, BookmarkCheck } from 'lucide-react';
import type { Citation } from '../types';
import { ApiClient } from '../api/client';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  const pdfUrl = ApiClient.getDocumentFileUrl(citation.document_id);
  const confidencePercent = Math.round(citation.confidence_score * 100);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#fdf2f2',
              border: '1px solid #fecdd3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={16} color="#851926" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#0f172a', fontWeight: 600 }}>
                Verified Document Source
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Official ABES Engineering College Knowledge Context
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Document Title & Meta */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '14px 16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#851926', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              {citation.category || 'Official Regulation'}
            </div>
            <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '8px', fontWeight: 600 }}>
              {citation.document_title}
            </h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem' }}>
              <div className="badge badge-maroon">
                <BookmarkCheck size={12} />
                Page {citation.page_number}
              </div>
              {citation.version_year && (
                <div className="badge badge-blue">
                  AY {citation.version_year}
                </div>
              )}
              <div className="badge badge-emerald">
                <ShieldCheck size={12} />
                {confidencePercent}% Relevance Match
              </div>
            </div>
          </div>

          {/* Excerpt Section */}
          <div>
            <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
              Official Extracted Reference:
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '14px 16px',
              borderRadius: '8px',
              borderLeft: '3px solid #851926',
              border: '1px solid #e2e8f0',
              borderLeftWidth: '3px',
              borderLeftColor: '#851926',
              fontSize: '0.88rem',
              color: '#1e293b',
              lineHeight: 1.65,
              maxHeight: '200px',
              overflowY: 'auto',
              fontFamily: 'var(--font-sans)'
            }}>
              "{citation.snippet}"
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            File: {citation.filename}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Close
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 500
              }}
            >
              <ExternalLink size={13} />
              Open Original PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
