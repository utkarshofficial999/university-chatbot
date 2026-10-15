import React from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  LogOut, 
  Lock,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: 'chat' | 'admin';
  onViewChange: (view: 'chat' | 'admin') => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onViewChange,
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) => {
  const { user, logout, openAuthModal } = useAuth();

  return (
    <header style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 40, 
      backgroundColor: '#ffffff',
      flexShrink: 0
    }}>
      {/* Clean Main Navigation Bar */}
      <div className="header-main-nav" style={{
        height: '56px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px'
      }}>
        {/* Brand & Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentView === 'chat' && onToggleMobileSidebar && (
            <button
              className="mobile-menu-btn"
              onClick={onToggleMobileSidebar}
              title={isMobileSidebarOpen ? "Close menu" : "Open menu"}
              aria-label="Toggle Navigation"
            >
              {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}

          <img 
            src="/abes_crest.png" 
            alt="ABES Engineering College Crest" 
            style={{
              height: '32px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-brand-title" style={{ 
              fontFamily: 'var(--font-sans)',
              fontWeight: 650, 
              fontSize: '1.08rem', 
              color: '#111827',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap'
            }}>
              ABES Assistant
            </span>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px', 
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '9999px',
              padding: '1px 6px'
            }}>
              <span className="online-dot" />
              <span style={{ fontSize: '0.64rem', color: '#065F46', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Desktop View Switcher */}
        <div className="desktop-view-switcher" style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '2px'
        }}>
          <button
            onClick={() => onViewChange('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 500,
              backgroundColor: currentView === 'chat' ? '#ffffff' : 'transparent',
              color: currentView === 'chat' ? '#1F2937' : '#6B7280',
              boxShadow: currentView === 'chat' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <MessageSquare size={14} />
            <span className="header-view-label">Student Chat</span>
          </button>

          <button
            onClick={() => {
              if (user?.role === 'admin') {
                onViewChange('admin');
              } else {
                openAuthModal();
              }
            }}
            title={user?.role === 'admin' ? "Policy Manager Dashboard" : "Admin authentication required"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 500,
              backgroundColor: currentView === 'admin' ? '#ffffff' : 'transparent',
              color: currentView === 'admin' ? '#1F2937' : '#6B7280',
              boxShadow: currentView === 'admin' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            {user?.role === 'admin' ? <ShieldCheck size={14} color="#8B1E2D" /> : <Lock size={13} color="#9CA3AF" />}
            <span className="header-view-label">Policy Manager</span>
            {user?.role !== 'admin' && (
              <span style={{
                fontSize: '0.62rem',
                backgroundColor: '#E5E7EB',
                color: '#4B5563',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                LOCK
              </span>
            )}
          </button>
        </div>

        {/* User / Tenant Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user?.id ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#F8F9FB',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: user.role === 'admin' ? '#8B1E2D' : '#E5E7EB',
                  color: user.role === 'admin' ? '#ffffff' : '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}>
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1F2937' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: user.role === 'admin' ? '#8B1E2D' : '#6B7280', fontWeight: 500 }}>
                    {user.role.toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '6px',
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="header-admin-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                color: '#1F2937',
                padding: '5px 11px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 500,
                boxShadow: 'var(--shadow-subtle)',
                whiteSpace: 'nowrap'
              }}
            >
              <Lock size={12} color="#8B1E2D" />
              <span>Admin<span className="header-admin-login-suffix"> Login</span></span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
