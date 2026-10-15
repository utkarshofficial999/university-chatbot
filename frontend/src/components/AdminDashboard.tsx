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
  const [selectedCategory, setSelectedCategory] = useState<string>('Academic & Curriculum');
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
    if (!window.confirm(`Are you sure you want to delete '${title}'? This will remove its vectors from Pinecone.`)) {
      return;
    }
    try {
      await ApiClient.deleteDocument(id);
      setMessage({ type: 'success', text: `Deleted '${title}' successfully` });
      await fetchDashboardData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  const handleReindex = async (id: string, title: string) => {
    try {
      const res = await ApiClient.reindexDocument(id);
      setMessage({ type: 'success', text: res.message || `Re-indexed '${title}' successfully` });
      await fetchDashboardData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Re-index failed' });
    }
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '28px 36px',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div className="admin-header-row" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '26px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/abes_crest.png" 
            alt="ABES Crest" 
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#0f172a', fontWeight: 600 }}>
              Policy Management & Knowledge Controls
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
              Admin dashboard for ABES Engineering College policy vectors, ingestion pipelines, and retrieval diagnostics.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSyncLocal}
            disabled={syncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#851926',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: syncing ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            <FolderSync size={15} />
            {syncing ? 'Syncing ABES Documents...' : 'Sync All ABES Documents'}
          </button>

          <button
            onClick={fetchDashboardData}
            title="Refresh metrics"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#475569',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.86rem',
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
          color: message.type === 'success' ? '#065f46' : '#b91c1c'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '26px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>Active Documents</span>
            <FileText size={17} color="#851926" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a' }}>
            {status?.total_documents ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
            Verified ABES Sources
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>Semantic Vectors</span>
            <Database size={17} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a' }}>
            {status?.total_chunks ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
            Pinecone 384-dim Chunks
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>Vector Index</span>
            <Layers size={17} color="#059669" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
            {status?.database_type || 'Pinecone Serverless'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
            Model: {status?.embedding_model || 'bge-small-en-v1.5'}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>LLM Engine</span>
            <Cpu size={17} color="#b45309" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
            {status?.llm_provider?.toUpperCase() || 'GEMINI'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
            Gemini 2.5 Flash Lite Streaming
          </div>
        </div>
      </div>

      {/* Upload Document Section */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '20px 22px',
        marginBottom: '26px'
      }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#0f172a', fontWeight: 600, marginBottom: '4px' }}>
          Upload New Policy Document
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
          Upload an official ABES PDF circular or handbook. The pipeline extracts text, builds chunks, generates embeddings, and upserts them into Pinecone.
        </p>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>
              Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.82rem'
              }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>
              Policy Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.84rem'
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>
              Custom Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Revised Exam Circular 2026"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.84rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              border: 'none',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer'
            }}
          >
            <Upload size={15} />
            {uploading ? 'Processing...' : 'Upload & Index'}
          </button>
        </form>
      </div>

      {/* Document Catalog Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '20px 22px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#0f172a', fontWeight: 600, marginBottom: '14px' }}>
          Indexed Document Registry ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.86rem' }}>
            No documents indexed yet. Click "Sync All ABES Documents" to automatically ingest policies.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>DOCUMENT TITLE</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>CATEGORY</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>VERSION</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>PAGES</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>CHUNKS</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{doc.filename}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge badge-maroon">{doc.category}</span>
                    </td>
                    <td style={{ padding: '10px', color: '#0284c7' }}>
                      AY {doc.version_year || '2025-26'}
                    </td>
                    <td style={{ padding: '10px', color: '#475569' }}>
                      {doc.total_pages}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#851926' }}>
                      {doc.total_chunks}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${doc.status === 'indexed' ? 'badge-emerald' : 'badge-blue'}`}>
                        {doc.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <a
                          href={ApiClient.getDocumentFileUrl(doc.id)}
                          target="_blank"
                          rel="noreferrer"
                          title="View PDF"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '5px',
                            borderRadius: '5px',
                            color: '#475569',
                            display: 'inline-flex'
                          }}
                        >
                          <FileText size={14} />
                        </a>

                        <button
                          onClick={() => handleReindex(doc.id, doc.title)}
                          title="Re-index document"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '5px',
                            borderRadius: '5px',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          <RefreshCw size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          title="Delete document"
                          style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecdd3',
                            padding: '5px',
                            borderRadius: '5px',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
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
