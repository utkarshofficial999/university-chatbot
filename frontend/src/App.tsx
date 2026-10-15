import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { ConversationSidebar } from './components/ConversationSidebar';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { CitationModal } from './components/CitationModal';
import { AuthModal } from './components/AuthModal';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import type { Message, Conversation, Category, Citation } from './types';
import { ApiClient } from './api/client';

export const AppContent: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [currentView, setCurrentView] = useState<'chat' | 'admin'>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [totalIndexedDocs, setTotalIndexedDocs] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [convs, cats, docs] = await Promise.all([
        ApiClient.listConversations(),
        ApiClient.getCategories(),
        ApiClient.listDocuments()
      ]);
      setConversations(convs);
      setCategories(cats);
      setTotalIndexedDocs(docs.length);

      if (convs.length > 0) {
        selectConversation(convs[0].id);
      }
    } catch (e) {
      console.error("Error loading initial data:", e);
    }
  };

  const selectConversation = async (id: string) => {
    setCurrentConversationId(id);
    setIsLoading(false);
    try {
      const data = await ApiClient.getConversation(id);
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Error fetching conversation:", e);
      setMessages([]);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await ApiClient.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (currentConversationId === id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          handleNewConversation();
        }
      }
    } catch (e) {
      console.error("Error deleting conversation:", e);
    }
  };

  const handleSendMessage = (query: string) => {
    if (!query.trim() || isLoading) return;

    // Add user message immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      created_at: new Date().toISOString()
    };

    // Prepare placeholder assistant message
    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      sender: 'assistant',
      content: '',
      citations: [],
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsLoading(true);

    // Stream SSE response
    ApiClient.streamChat(
      query,
      currentConversationId,
      selectedCategory,
      (citations, convId) => {
        // Citations event
        if (!currentConversationId && convId) {
          setCurrentConversationId(convId);
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, citations } : m
          )
        );
      },
      (token) => {
        // Token event
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: m.content + token } : m
          )
        );
      },
      (convId) => {
        // Done event
        setIsLoading(false);
        if (convId) {
          setCurrentConversationId(convId);
        }
        // Refresh conversations list
        ApiClient.listConversations().then(setConversations);
      },
      () => {
        setIsLoading(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: "I couldn't find an official ABES Engineering College document confirming this information. Please verify it with the relevant college department or official administrative source."
                }
              : m
          )
        );
      }
    );
  };

  return (
    <div className="app-container">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="main-layout">
        {currentView === 'chat' ? (
          <>
            <ConversationSidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={selectConversation}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              totalIndexedDocs={totalIndexedDocs}
            />

            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onCitationClick={setActiveCitation}
              selectedCategory={selectedCategory}
            />
          </>
        ) : (
          user?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px'
            }}>
              <div style={{
                maxWidth: '520px',
                textAlign: 'center',
                padding: '40px 32px',
                borderRadius: '16px',
                background: 'rgba(12, 29, 54, 0.95)',
                border: '1px solid rgba(118, 43, 42, 0.5)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(118, 43, 42, 0.3)',
                  border: '2px solid #e5a958',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px auto'
                }}>
                  <ShieldAlert size={32} color="#e5a958" />
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(118, 43, 42, 0.3)',
                  border: '1px solid rgba(118, 43, 42, 0.6)',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  color: '#fed7aa',
                  fontWeight: 600,
                  marginBottom: '12px'
                }}>
                  <Lock size={12} />
                  JWT Admin Authorization Required
                </div>

                <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 700, marginBottom: '10px' }}>
                  College Admin Access Restricted
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '26px' }}>
                  The <strong>Policy Manager</strong> dashboard is protected with JWT token security. Only verified college administrators (such as <strong>Utkarsh - 24B0101464</strong>) have permission to upload, re-index, or synchronize institutional policies.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setCurrentView('chat')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#e2e8f0',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={15} />
                    Back to Student Chat
                  </button>

                  <button
                    onClick={openAuthModal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #762b2a 0%, #983837 100%)',
                      border: '1px solid #e5a958',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(118, 43, 42, 0.5)'
                    }}
                  >
                    <Lock size={15} />
                    Sign In as College Admin
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      <CitationModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
