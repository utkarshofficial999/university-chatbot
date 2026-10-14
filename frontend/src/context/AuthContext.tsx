import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { ApiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      if (ApiClient.getToken()) {
        const u = await ApiClient.getMe();
        if (u && u.id) {
          setUser(u);
        } else {
          setUser({
            email: 'student@jaipuria.edu',
            full_name: 'Jaipuria Student',
            role: 'student',
            university_id: 'jaipuria'
          });
        }
      } else {
        setUser({
          email: 'student@jaipuria.edu',
          full_name: 'Jaipuria Student',
          role: 'student',
          university_id: 'jaipuria'
        });
      }
    } catch {
      setUser({
        email: 'student@jaipuria.edu',
        full_name: 'Jaipuria Student',
        role: 'student',
        university_id: 'jaipuria'
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await ApiClient.login(email, pass);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const register = async (email: string, pass: string, name: string, role = 'student') => {
    const res = await ApiClient.register({ email, password: pass, full_name: name, role });
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    ApiClient.setToken(null);
    setUser({
      email: 'student@jaipuria.edu',
      full_name: 'Jaipuria Student',
      role: 'student',
      university_id: 'jaipuria'
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
