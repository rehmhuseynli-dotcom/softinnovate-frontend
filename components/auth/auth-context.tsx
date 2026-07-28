'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, primeCsrfCookie, type AuthUser } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.auth.me();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // İlk yüklemede: kurulum tamamlanmış mı kontrol et (Owner hesabı yoksa
    // /setup sihirbazına yönlendir), sonra CSRF çerezini hazırla + oturum
    // var mı kontrol et.
    api.setup
      .status()
      .then(({ needsSetup }) => {
        if (needsSetup && typeof window !== 'undefined' && window.location.pathname !== '/setup') {
          window.location.href = '/setup';
        }
      })
      .catch(() => {
        // /setup/status uç noktasına erişilemiyorsa (ör. backend henüz ayakta
        // değil) sessizce devam edilir — normal auth akışı yine de dener.
      });

    primeCsrfCookie().finally(refresh);
  }, [refresh]);

  async function login(email: string, password: string) {
    const { data } = await api.auth.login({ email, password });
    setUser(data);
  }

  async function register(name: string, email: string, password: string, passwordConfirmation: string) {
    const { data } = await api.auth.register({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    setUser(data);
  }

  async function logout() {
    await api.auth.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalı.');
  }

  return ctx;
}
