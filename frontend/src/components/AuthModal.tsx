import React, { useState } from 'react';
import { X, ShieldCheck, GraduationCap } from 'lucide-react';
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
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '20px'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#0f172a', fontWeight: 600 }}>
              {isRegister ? 'Register Account' : 'Sign In'}
            </h3>
            <p style={{ fontSize: '0.76rem', color: '#64748b' }}>
              ABES College Assistant & Policy Manager
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              padding: '4px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Login Cards */}
        <div style={{ padding: '18px 22px 0 22px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            One-Click Verified Authentication:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('utkarsh')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: '#fdf2f2',
                border: '1px solid #fecdd3',
                color: '#851926',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <ShieldCheck size={16} color="#851926" />
              <span>Utkarsh (Admin)</span>
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
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                color: '#0369a1',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
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
          padding: '14px 22px',
          color: '#94a3b8',
          fontSize: '0.72rem'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          <span>or sign in with email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 22px 22px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {error && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecdd3',
              color: '#b91c1c',
              fontSize: '0.78rem'
            }}>
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>
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
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="utkarsh@24b0101464@abes.ac.in"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>
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
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none'
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
              marginTop: '4px',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              border: 'none',
              fontSize: '0.88rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.76rem',
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
