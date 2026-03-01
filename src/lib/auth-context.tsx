'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type AuthRole = 'admin' | 'viewer';

interface AuthState {
  role: AuthRole | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (role: AuthRole, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isViewer: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'mc_auth_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ role: null, isLoading: true });

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === 'admin' || stored === 'viewer') {
        setState({ role: stored, isLoading: false });
      } else {
        setState({ role: null, isLoading: false });
      }
    } catch {
      setState({ role: null, isLoading: false });
    }
  }, []);

  const login = useCallback(async (role: AuthRole, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (role === 'viewer') {
      sessionStorage.setItem(STORAGE_KEY, 'viewer');
      setState({ role: 'viewer', isLoading: false });
      return { success: true };
    }

    // Admin requires password verification via API
    if (!password) {
      return { success: false, error: 'Password is required for admin access' };
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem(STORAGE_KEY, 'admin');
        setState({ role: 'admin', isLoading: false });
        return { success: true };
      }

      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Invalid password' };
    } catch {
      return { success: false, error: 'Failed to verify credentials. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setState({ role: null, isLoading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    isAdmin: state.role === 'admin',
    isViewer: state.role === 'viewer',
    isAuthenticated: state.role !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
