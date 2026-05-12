'use client';

import type { AuthenticatedUserDto, LoginRequestDto } from '@nbr/shared';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearSession, getAccessToken, getStoredUser, setSession } from '@/shared/utils/auth-storage';
import * as authApi from '@/services/auth-api';

interface AuthContextValue {
  user: AuthenticatedUserDto | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (body: LoginRequestDto) => Promise<AuthenticatedUserDto>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUserDto | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (token && stored) {
      setUser(stored);
      setSessionActive(true);
    }
    setReady(true);
  }, []);

  const login = useCallback(async (body: LoginRequestDto) => {
    const res = await authApi.login(body);
    setSession({
      accessToken: res.accessToken,
      expiresInSeconds: res.expiresInSeconds,
      user: res.user,
    });
    setUser(res.user);
    setSessionActive(true);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setSessionActive(false);
    router.push('/login');
  }, [router]);

  const refreshProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    const me = await authApi.fetchMe();
    setUser(me);
    localStorage.setItem('nbr_user', JSON.stringify(me));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isAuthenticated: sessionActive && !!user,
      login,
      logout,
      refreshProfile,
    }),
    [user, ready, sessionActive, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
