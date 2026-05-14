import type { ReactNode } from 'react';

import { Role } from '@nbr/shared';

import { RoleGuard } from '@/features/auth/role-guard';
import { ProtectedShell } from '@/features/auth/protected-shell';
import { AppShell, type NavItem } from '@/features/layout/app-shell';

const nav: NavItem[] = [
  { href: '/approver/queue', label: 'Review queue', icon: 'approver-queue' },
  { href: '/approver/applications', label: 'All applications', icon: 'admin-applications' },
];

export default function ApproverLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedShell>
      <RoleGuard allow={[Role.APPROVER]} fallback={<div className="p-6">Unauthorized.</div>}>
        <AppShell portalLabel="Regulator portal — Approver" accent="regulator" navItems={nav}>
          {children}
        </AppShell>
      </RoleGuard>
    </ProtectedShell>
  );
}
