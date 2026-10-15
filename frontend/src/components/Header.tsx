import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  MessageSquare, 
  LogOut, 
  LogIn, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: 'chat' | 'admin';
  onViewChange: (view: 'chat' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout, openAuthModal } = useAuth();

  return (
    <header style={{ display: 'flex', flexDirection: 'column', zIndex: 40 }}>
      {/* Official Top Institutional Utility Bar (Matching abes.ac.in) */}
      <div style={{
        height: '28px',
        backgroundColor: '#551e1d',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        fontSize: '0.72rem',
        color: '#f8fafc',
        letterSpacing: '0.02em'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>🏛️ <strong>ABES Engineering College, Ghaziabad</strong></span>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
          <span style={{ color: '#fed7aa', fontWeight: 600 }}>AKTU College Code: 032</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
          <span style={{ color: '#e2e8f0' }}>Approved by AICTE, New Delhi</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
          <span style={{ color: '#86efac', fontWeight: 600 }}>NAAC Accredited</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a 
            href="https://www.abes.ac.in" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#fed7aa', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontSize: '0.71rem',
              fontWeight: 600
            }}
          >
            Official Website <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div style={{
        height: '64px',
        backgroundColor: 'rgba(0, 33, 71, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(118, 43, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        {/* Brand & Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #762b2a 0%, #4a1514 100%)',
            border: '2px solid #e5a958',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(118, 43, 42, 0.5)'
          }}>
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontWeight: 800, 
                fontSize: '1.2rem', 
                color: '#ffffff',
                letterSpacing: '-0.01em'
              }}>
                ABES
              </span>
              <span style={{ 
                fontWeight: 600, 
                fontSize: '0.76rem', 
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: '#762b2a',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(229, 169, 88, 0.4)'
              }}>
                AI Campus Assistant
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '4px' }}>
                <span className="online-dot" />
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>ONLINE</span>
              </div>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
              Student Regulations, Academics, Hostel & Campus Guidance
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(6, 14, 26, 0.85)',
          border: '1px solid rgba(118, 43, 42, 0.4)',
          borderRadius: 'var(--radius-full)',
          padding: '3px'
        }}>
          <button
            onClick={() => onViewChange('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 600,
              background: currentView === 'chat' ? 'linear-gradient(135deg, #762b2a, #983837)' : 'transparent',
              color: currentView === 'chat' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: currentView === 'chat' ? '0 2px 10px rgba(118, 43, 42, 0.5)' : 'none'
            }}
          >
            <MessageSquare size={15} />
            Student Assistant
          </button>

          <button
            onClick={() => onViewChange('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 600,
              background: currentView === 'admin' ? 'linear-gradient(135deg, #762b2a, #983837)' : 'transparent',
              color: currentView === 'admin' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: currentView === 'admin' ? '0 2px 10px rgba(118, 43, 42, 0.5)' : 'none'
            }}
          >
            <ShieldCheck size={15} />
            Policy Manager
          </button>
        </div>

        {/* User / Tenant Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.76rem',
            color: '#e2e8f0'
          }}>
            <Building2 size={13} color="#e5a958" />
            <span>Campus: <strong style={{ color: '#fff' }}>ABES EC (032)</strong></span>
          </div>

          {user?.id ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#e5a958' : '#762b2a',
                  color: user.role === 'admin' ? '#070d19' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: user.role === 'admin' ? '#fed7aa' : '#94a3b8' }}>
                    {user.role.toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '6px',
                  color: 'var(--text-muted)'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #762b2a 0%, #581d1c 100%)',
                border: '1px solid #e5a958',
                color: '#ffffff',
                padding: '7px 15px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                boxShadow: '0 2px 10px rgba(118, 43, 42, 0.4)'
              }}
            >
              <LogIn size={15} />
              Portal Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
