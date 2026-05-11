'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AuthenticatedUserDto, Role } from '@nbr/shared';

interface AuthContextValue {
  user: AuthenticatedUserDto | null;
  role: Role | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({ user: null, role: null, isAuthenticated: false }),
    [],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
