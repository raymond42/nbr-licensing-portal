'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { FullPageLoader } from '@/components/ui/loading-spinner';
import { useNavigationLoading } from '@/providers/navigation-loading-provider';
import { useAuth } from '@/hooks/use-auth';

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { startNavigation } = useNavigationLoading();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname ?? '/');
      startNavigation();
      router.replace(`/login?next=${next}`);
    }
  }, [ready, isAuthenticated, router, pathname, startNavigation]);

  if (!ready || !isAuthenticated) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
