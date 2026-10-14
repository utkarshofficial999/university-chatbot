import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  MessageSquare, 
  LogOut, 
  LogIn, 
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: 'chat' | 'admin';
  onViewChange: (view: 'chat' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout, openAuthModal } = useAuth();

  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-light)',
      backgroundColor: 'rgba(7, 13, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 40
    }}>
      {/* Brand & Emblem */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #1e3a6a 0%, #0d1a33 100%)',
          border: '1px solid rgba(229, 169, 88, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(229, 169, 88, 0.2)'
        }}>
          <GraduationCap size={24} color="#e5a958" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontWeight: 700, 
              fontSize: '1.15rem', 
              color: '#ffffff',
              letterSpacing: '-0.01em'
            }}>
              JAIPURIA
            </span>
            <span style={{ 
              fontWeight: 400, 
              fontSize: '0.82rem', 
              color: 'var(--accent-gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'rgba(229, 169, 88, 0.12)',
              padding: '2px 7px',
              borderRadius: '4px',
              border: '1px solid rgba(229, 169, 88, 0.25)'
            }}>
              Official AI Assistant
            </span>
          </div>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
            Knowledge Base & Verified University Regulations
          </p>
        </div>
      </div>

      {/* Navigation Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(13, 25, 46, 0.8)',
        border: '1px solid var(--border-light)',
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
            fontSize: '0.85rem',
            fontWeight: 600,
            background: currentView === 'chat' ? 'var(--accent-gold)' : 'transparent',
            color: currentView === 'chat' ? '#070d19' : 'var(--text-muted)'
          }}
        >
          <MessageSquare size={16} />
          Student Chat
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
            fontSize: '0.85rem',
            fontWeight: 600,
            background: currentView === 'admin' ? 'var(--accent-gold)' : 'transparent',
            color: currentView === 'admin' ? '#070d19' : 'var(--text-muted)'
          }}
        >
          <ShieldCheck size={16} />
          Admin & Ingestion
        </button>
      </div>

      {/* User / Tenant Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Multi-Tenant Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 11px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-light)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <Building2 size={13} color="#38bdf8" />
          <span>Tenant: <strong style={{ color: '#fff' }}>Jaipuria</strong></span>
        </div>

        {/* User Profile */}
        {user?.id ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: user.role === 'admin' ? 'var(--accent-gold)' : '#38bdf8',
                color: '#070d19',
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
                <div style={{ fontSize: '0.68rem', color: user.role === 'admin' ? 'var(--accent-gold)' : '#94a3b8' }}>
                  {user.role.toUpperCase()}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-light)',
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
              background: 'linear-gradient(135deg, rgba(229,169,88,0.2) 0%, rgba(229,169,88,0.1) 100%)',
              border: '1px solid var(--border-active)',
              color: 'var(--accent-gold)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <LogIn size={15} />
            Sign In / Switch Role
          </button>
        )}
      </div>
    </header>
  );
};
