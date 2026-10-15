import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  MessageSquare, 
  LogOut, 
  Building2,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: 'chat' | 'admin';
  onViewChange: (view: 'chat' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout, openAuthModal } = useAuth();

  return (
    <header style={{ display: 'flex', flexDirection: 'column', zIndex: 40, backgroundColor: '#ffffff' }}>
      {/* Top Institutional Strip (Minimalist & Clean) */}
      <div style={{
        height: '30px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        fontSize: '0.74rem',
        color: '#475569'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>🏛️ ABES Engineering College, Ghaziabad</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ color: '#851926', fontWeight: 600 }}>AKTU Code: 032</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span>AICTE Approved</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ color: '#059669', fontWeight: 600 }}>NAAC Accredited</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a 
            href="https://www.abes.ac.in" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#64748b', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 500
            }}
          >
            abes.ac.in <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div style={{
        height: '62px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        {/* Brand & Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #851926 0%, #55121a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(133, 25, 38, 0.2)'
          }}>
            <GraduationCap size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontFamily: 'var(--font-serif)',
                fontWeight: 600, 
                fontSize: '1.25rem', 
                color: '#0f172a',
                letterSpacing: '-0.02em'
              }}>
                ABES College Assistant
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px' }}>
                <span className="online-dot" />
                <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>LIVE</span>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Verified Regulations, Handbooks & Student Guidance
            </p>
          </div>
        </div>

        {/* Minimalist Segmented View Switcher (Notion / Claude style) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '2px'
        }}>
          <button
            onClick={() => onViewChange('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 500,
              backgroundColor: currentView === 'chat' ? '#ffffff' : 'transparent',
              color: currentView === 'chat' ? '#0f172a' : '#64748b',
              boxShadow: currentView === 'chat' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <MessageSquare size={14} />
            Student Chat
          </button>

          <button
            onClick={() => {
              if (user?.role === 'admin') {
                onViewChange('admin');
              } else {
                openAuthModal();
              }
            }}
            title={user?.role === 'admin' ? "Policy Manager Dashboard" : "Admin JWT authentication required"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 500,
              backgroundColor: currentView === 'admin' ? '#ffffff' : 'transparent',
              color: currentView === 'admin' ? '#0f172a' : '#64748b',
              boxShadow: currentView === 'admin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            {user?.role === 'admin' ? <ShieldCheck size={14} color="#851926" /> : <Lock size={13} color="#94a3b8" />}
            <span>Policy Manager</span>
            {user?.role !== 'admin' && (
              <span style={{
                fontSize: '0.62rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#64748b',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            color: '#475569'
          }}>
            <Building2 size={13} color="#851926" />
            <span>Campus: <strong style={{ color: '#0f172a' }}>ABES Ghaziabad</strong></span>
          </div>

          {user?.id ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: user.role === 'admin' ? '#851926' : '#e2e8f0',
                  color: user.role === 'admin' ? '#ffffff' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}>
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0f172a' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: user.role === 'admin' ? '#851926' : '#64748b', fontWeight: 500 }}>
                    {user.role.toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '6px',
                  color: '#64748b',
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 500,
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <Lock size={13} color="#851926" />
              Admin Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
