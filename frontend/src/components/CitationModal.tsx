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
      backgroundColor: 'rgba(5, 10, 20, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#0c172c',
          border: '1px solid rgba(229, 169, 88, 0.3)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(17, 31, 56, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(229, 169, 88, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={18} color="var(--accent-gold)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>
                Official Document Source
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Verified ABES Engineering College Regulatory Context
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Document Title & Meta */}
          <div style={{
            background: 'rgba(13, 25, 46, 0.7)',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              {citation.category || 'Official Policy'}
            </div>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '10px' }}>
              {citation.document_title}
            </h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem' }}>
              <div className="badge badge-gold">
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
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
              EXTRACTED OFFICIAL PASSAGE:
            </div>
            <div style={{
              background: 'rgba(6, 12, 23, 0.9)',
              padding: '14px 16px',
              borderRadius: '8px',
              borderLeft: '3px solid var(--accent-gold)',
              fontSize: '0.86rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              "{citation.snippet}"
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(17, 31, 56, 0.4)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Filename: {citation.filename}
          </span>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem'
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
                gap: '6px',
                background: 'var(--accent-gold)',
                color: '#070d19',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <ExternalLink size={14} />
              Open Original PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
