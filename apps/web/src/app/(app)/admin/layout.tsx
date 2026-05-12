import type { ReactNode } from 'react';

import { Role } from '@nbr/shared';

import { RoleGuard } from '@/features/auth/role-guard';
import { ProtectedShell } from '@/features/auth/protected-shell';
import { AppShell, type NavItem } from '@/features/layout/app-shell';

const nav: NavItem[] = [
  { href: '/admin/applications', label: 'All applications', icon: 'admin-applications' },
  { href: '/admin/users', label: 'Users', icon: 'admin-users' },
  { href: '/admin/audit', label: 'Audit log', icon: 'admin-audit' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedShell>
      <RoleGuard allow={[Role.ADMIN]} fallback={<div className="p-6">Unauthorized.</div>}>
        <AppShell portalLabel="Regulator portal — Administrator" accent="regulator" navItems={nav}>
          {children}
        </AppShell>
      </RoleGuard>
    </ProtectedShell>
  );
}
