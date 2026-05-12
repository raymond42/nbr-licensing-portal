'use client';

import { Role } from '@nbr/shared';
import type { ReactNode } from 'react';

import { useAuth } from '@/hooks/use-auth';

export function RoleGuard({
  allow,
  children,
  fallback = null,
}: {
  allow: readonly Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
