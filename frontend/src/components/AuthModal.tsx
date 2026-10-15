import React, { useState } from 'react';
import { X, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, fullName, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleType: 'student' | 'admin' | 'utkarsh') => {
    setError(null);
    setLoading(true);
    try {
      if (roleType === 'utkarsh' || roleType === 'admin') {
        await login('utkarsh@24b0101464@abes.ac.in', 'admin123');
      } else {
        await login('student@abes.ac.in', 'student2026');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '20px'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0c172c',
          border: '1px solid rgba(229, 169, 88, 0.35)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(17, 31, 56, 0.6)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
              {isRegister ? 'Create ABES Account' : 'ABES Authentication'}
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Access authorized policy queries & knowledge admin
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Login Cards */}
        <div style={{ padding: '20px 24px 0 24px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            One-Click Verified Authentication:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('utkarsh')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(118, 43, 42, 0.4) 0%, rgba(118, 43, 42, 0.2) 100%)',
                border: '1px solid #e5a958',
                color: '#fed7aa',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={16} color="#e5a958" />
              <span>Utkarsh (Admin 24B0101464)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <GraduationCap size={16} />
              <span>ABES Student</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          color: 'var(--text-dim)',
          fontSize: '0.75rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span>or enter credentials</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
              fontSize: '0.8rem'
            }}>
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Rajesh Kumar / Sneha Sharma"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(13, 25, 46, 0.8)',
                  border: '1px solid var(--border-light)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              University Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@abes.ac.in"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(13, 25, 46, 0.8)',
                border: '1px solid var(--border-light)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(13, 25, 46, 0.8)',
                border: '1px solid var(--border-light)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(13, 25, 46, 0.8)',
                  border: '1px solid var(--border-light)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="admin">Policy Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '11px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, #c88937 100%)',
              color: '#070d19',
              fontWeight: 700,
              border: 'none',
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-gold)',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
