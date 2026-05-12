'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { FullPageLoader } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/use-auth';

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname ?? '/');
      router.replace(`/login?next=${next}`);
    }
  }, [ready, isAuthenticated, router, pathname]);

  if (!ready || !isAuthenticated) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
