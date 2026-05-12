import type { ReactNode } from 'react';

import { Role } from '@nbr/shared';

import { RoleGuard } from '@/features/auth/role-guard';
import { ProtectedShell } from '@/features/auth/protected-shell';
import { AppShell, type NavItem } from '@/features/layout/app-shell';

const nav: NavItem[] = [{ href: '/reviewer/queue', label: 'Review queue', icon: 'reviewer-queue' }];

export default function ReviewerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedShell>
      <RoleGuard allow={[Role.REVIEWER]} fallback={<div className="p-6">Unauthorized.</div>}>
        <AppShell portalLabel="Regulator portal — Reviewer" accent="regulator" navItems={nav}>
          {children}
        </AppShell>
      </RoleGuard>
    </ProtectedShell>
  );
}
