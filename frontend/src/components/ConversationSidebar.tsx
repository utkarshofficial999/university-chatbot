import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  Layers
} from 'lucide-react';
import type { Conversation, Category } from '../types';

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
  totalIndexedDocs
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside style={{
      width: '280px',
      height: '100%',
      backgroundColor: 'rgba(7, 13, 25, 0.95)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Top Actions: New Chat */}
      <div style={{ padding: '16px' }}>
        <button
          onClick={onNewConversation}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #762b2a 0%, #983837 100%)',
            color: '#ffffff',
            border: '1px solid rgba(229, 169, 88, 0.4)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(118, 43, 42, 0.4)'
          }}
        >
          <Plus size={18} />
          New ABES Question
        </button>

        {/* Search */}
        <div style={{
          marginTop: '12px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Search past queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(17, 31, 56, 0.6)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '7px 10px 7px 32px',
              fontSize: '0.8rem',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Policy Focus Filter */}
      <div style={{ padding: '0 16px 12px 16px' }}>
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--accent-gold)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Layers size={12} />
          Scope by Policy Focus
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(13, 25, 46, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#e2e8f0',
            fontSize: '0.8rem',
            outline: 'none'
          }}
        >
          <option value="All">All ABES Knowledge Base</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{
        height: '1px',
        background: 'var(--border-light)',
        margin: '0 16px'
      }} />

      {/* Conversation List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          fontWeight: 600,
          padding: '0 8px 6px 8px'
        }}>
          Recent Discussions
        </div>

        {filteredConversations.length === 0 ? (
          <div style={{
            padding: '24px 12px',
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: '0.8rem'
          }}>
            No conversation history found. Ask your first ABES question!
          </div>
        ) : (
          filteredConversations.map((c) => {
            const isActive = c.id === currentConversationId;
            return (
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(229, 169, 88, 0.15)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(229, 169, 88, 0.35)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <MessageSquare size={14} color={isActive ? 'var(--accent-gold)' : 'var(--text-dim)'} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.82rem',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: isActive ? 600 : 400
                  }}>
                    {c.title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(c.id);
                  }}
                  title="Delete chat"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    padding: '3px',
                    borderRadius: '4px',
                    opacity: isActive ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer Stats */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-light)',
        background: 'rgba(11, 21, 40, 0.8)',
        fontSize: '0.74rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Indexed Policies:</span>
          <strong style={{ color: 'var(--accent-gold)' }}>{totalIndexedDocs} PDFs</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Search Engine:</span>
          <span style={{ color: 'var(--accent-blue)' }}>Hybrid BM25 + Vector</span>
        </div>
      </div>
    </aside>
  );
};
