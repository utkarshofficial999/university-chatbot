import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { ConversationSidebar } from './components/ConversationSidebar';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { CitationModal } from './components/CitationModal';
import { AuthModal } from './components/AuthModal';
import type { Message, Conversation, Category, Citation } from './types';
import { ApiClient } from './api/client';

export const AppContent: React.FC = () => {
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
          <AdminDashboard />
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
