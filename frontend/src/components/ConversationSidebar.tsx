import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  Layers,
  X,
  ShieldCheck,
  Lock
} from 'lucide-react';
import type { Conversation, Category } from '../types';
import { useAuth } from '../context/AuthContext';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalIndexedDocs: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  currentView?: 'chat' | 'admin';
  onViewChange?: (view: 'chat' | 'admin') => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  categories,
  selectedCategory,
  onSelectCategory,
  totalIndexedDocs,
  isOpenMobile,
  onCloseMobile,
  currentView = 'chat',
  onViewChange
}) => {
  const { user, openAuthModal } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onCloseMobile?.();
  };

  const handleNew = () => {
    onNewConversation();
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="sidebar-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`app-sidebar ${isOpenMobile ? 'open' : ''}`} style={{
        width: '270px',
        height: '100%',
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Top Header & Actions */}
        <div style={{ padding: '16px 14px 10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleNew}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '0.86rem',
                fontWeight: 500,
                boxShadow: 'var(--shadow-subtle)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Plus size={16} color="#851926" />
              <span>New Question</span>
            </button>

            {onCloseMobile && (
              <button
                className="sidebar-close-btn"
                onClick={onCloseMobile}
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Mobile View Switcher (Visible on Mobile & Tablet Drawer) */}
          <div className="mobile-view-nav" style={{ marginTop: '10px' }}>
            <div style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '2px'
            }}>
              <button
                onClick={() => {
                  onViewChange?.('chat');
                  onCloseMobile?.();
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: currentView === 'chat' ? 600 : 500,
                  backgroundColor: currentView === 'chat' ? '#ffffff' : 'transparent',
                  color: currentView === 'chat' ? '#0f172a' : '#64748b',
                  boxShadow: currentView === 'chat' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <MessageSquare size={13} />
                <span>Student Chat</span>
              </button>

              <button
                onClick={() => {
                  if (user?.role === 'admin') {
                    onViewChange?.('admin');
                    onCloseMobile?.();
                  } else {
                    openAuthModal();
                  }
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: currentView === 'admin' ? 600 : 500,
                  backgroundColor: currentView === 'admin' ? '#ffffff' : 'transparent',
                  color: currentView === 'admin' ? '#0f172a' : '#64748b',
                  boxShadow: currentView === 'admin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {user?.role === 'admin' ? <ShieldCheck size={13} color="#851926" /> : <Lock size={12} color="#94a3b8" />}
                <span>Policy Manager</span>
              </button>
            </div>
          </div>

        {/* Minimal Search Bar */}
        <div style={{
          marginTop: '10px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Search past questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '6px 10px 6px 30px',
              fontSize: '0.8rem',
              color: '#0f172a',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Policy Focus Filter */}
      <div style={{ padding: '0 14px 12px 14px' }}>
        <div style={{
          fontSize: '0.7rem',
          color: '#64748b',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Layers size={12} color="#851926" />
          Filter by Policy Topic
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '5px 8px',
            color: '#334155',
            fontSize: '0.78rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="All">All ABES Policies (212 Chunks)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0 14px' }} />

      {/* Conversation List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}>
        <div style={{
          fontSize: '0.68rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          fontWeight: 600,
          padding: '0 8px 4px 8px'
        }}>
          Recent Discussions
        </div>

        {filteredConversations.length === 0 ? (
          <div style={{
            padding: '16px 12px',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#94a3b8'
          }}>
            No conversations yet.
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = conv.id === currentConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  border: isSelected ? '1px solid #e2e8f0' : '1px solid transparent',
                  boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <MessageSquare size={14} color={isSelected ? '#851926' : '#94a3b8'} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.8rem',
                    color: isSelected ? '#0f172a' : '#475569',
                    fontWeight: isSelected ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {conv.title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  title="Delete conversation"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid #e2e8f0',
        fontSize: '0.72rem',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Official Knowledge Index</span>
        <span style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '2px 7px',
          borderRadius: '10px',
          fontWeight: 600,
          color: '#0f172a'
        }}>
          {totalIndexedDocs} Sources
        </span>
      </div>
    </aside>
  </>
  );
};
