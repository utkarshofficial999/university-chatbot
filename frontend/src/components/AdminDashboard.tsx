import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  RefreshCw, 
  FileText, 
  Database, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  FolderSync
} from 'lucide-react';
import type { DocumentItem, Category, SystemStatus } from '../types';
import { ApiClient } from '../api/client';

export const AdminDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Academic Regulations');
  const [customTitle, setCustomTitle] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [docs, cats, sysStatus] = await Promise.all([
        ApiClient.listDocuments(),
        ApiClient.getCategories(),
        ApiClient.getSystemStatus()
      ]);
      setDocuments(docs);
      setCategories(cats);
      setStatus(sysStatus);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load dashboard data' });
    }
  };

  const handleSyncLocal = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await ApiClient.syncLocalPolicies();
      setMessage({ type: 'success', text: res.message || 'Successfully synced all local policies!' });
      await fetchDashboardData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to sync local policies' });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage(null);
    try {
      const res = await ApiClient.uploadDocument(selectedFile, selectedCategory, customTitle || undefined);
      setMessage({ type: 'success', text: res.message || 'Document uploaded and indexed successfully' });
      setSelectedFile(null);
      setCustomTitle('');
      await fetchDashboardData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete and un-index "${title}"?`)) return;
    try {
      await ApiClient.deleteDocument(id);
      setMessage({ type: 'success', text: `Deleted document "${title}"` });
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  const handleReindex = async (id: string, title: string) => {
    try {
      setMessage({ type: 'success', text: `Re-indexing "${title}"...` });
      await ApiClient.reindexDocument(id);
      setMessage({ type: 'success', text: `Successfully re-indexed "${title}"` });
      await fetchDashboardData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Re-index failed' });
    }
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '30px 40px',
      backgroundColor: 'transparent'
    }}>
      {/* Title & Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 700 }}>
            ABES Knowledge Base Administration
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Manage policy documents, monitor vector embeddings, and re-index regulatory materials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSyncLocal}
            disabled={syncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(229, 169, 88, 0.15)',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: syncing ? 'not-allowed' : 'pointer'
            }}
          >
            <FolderSync size={16} className={syncing ? 'pulse-dot' : ''} />
            {syncing ? 'Syncing ABES Documents...' : 'Sync All ABES Documents'}
          </button>

          <button
            onClick={fetchDashboardData}
            title="Refresh metrics"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              padding: '9px 12px'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
          color: message.type === 'success' ? '#34d399' : '#fb7185'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '30px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Indexed Documents</span>
            <FileText size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>
            {status?.total_documents ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Official ABES Documents
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Semantic Chunks</span>
            <Database size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>
            {status?.total_chunks ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Indexed vectors ready for retrieval
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Vector & Database</span>
            <Layers size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            {status?.database_type || 'PostgreSQL (pgvector)'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Dimension: 384 ({status?.embedding_model || 'bge-small-en-v1.5'})
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>LLM Provider</span>
            <Cpu size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            {status?.llm_provider?.toUpperCase() || 'OLLAMA'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Google Gemini Cloud (High Availability)
          </div>
        </div>
      </div>

      {/* Upload Document Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>
          Upload New Policy Document
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Upload an official ABES PDF. The ingestion pipeline will extract pages, generate semantic chunks, compute embeddings, and store them into the vector database.
        </p>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'rgba(13, 25, 46, 0.8)',
                color: '#fff',
                fontSize: '0.82rem'
              }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Policy Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'rgba(13, 25, 46, 0.8)',
                color: '#fff',
                fontSize: '0.84rem'
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Custom Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Revised Examination Policy 2026"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'rgba(13, 25, 46, 0.8)',
                color: '#fff',
                fontSize: '0.84rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            style={{
              padding: '9px 22px',
              borderRadius: '8px',
              background: 'var(--accent-gold)',
              color: '#070d19',
              fontWeight: 700,
              border: 'none',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer'
            }}
          >
            <Upload size={16} />
            {uploading ? 'Processing & Embedding...' : 'Upload & Ingest'}
          </button>
        </form>
      </div>

      {/* Document Catalog Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600, marginBottom: '16px' }}>
          Indexed Document Registry ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
            No documents indexed yet. Click "Sync All ABES Documents" to automatically ingest materials.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '10px 12px' }}>DOCUMENT TITLE</th>
                  <th style={{ padding: '10px 12px' }}>CATEGORY</th>
                  <th style={{ padding: '10px 12px' }}>VERSION</th>
                  <th style={{ padding: '10px 12px' }}>PAGES</th>
                  <th style={{ padding: '10px 12px' }}>CHUNKS</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{doc.filename}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-gold">{doc.category}</span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--accent-blue)' }}>
                      AY {doc.version_year || '2025-26'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {doc.total_pages}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                      {doc.total_chunks}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${doc.status === 'indexed' ? 'badge-emerald' : 'badge-blue'}`}>
                        {doc.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <a
                          href={ApiClient.getDocumentFileUrl(doc.id)}
                          target="_blank"
                          rel="noreferrer"
                          title="View PDF"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '6px',
                            borderRadius: '6px',
                            color: 'var(--text-muted)',
                            display: 'inline-flex'
                          }}
                        >
                          <FileText size={15} />
                        </a>

                        <button
                          onClick={() => handleReindex(doc.id, doc.title)}
                          title="Re-index document"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '6px',
                            color: 'var(--text-muted)'
                          }}
                        >
                          <RefreshCw size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          title="Delete document"
                          style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '6px',
                            color: 'var(--accent-rose)'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
