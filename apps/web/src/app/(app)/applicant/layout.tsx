import type { ReactNode } from 'react';

import { Role } from '@nbr/shared';

import { RoleGuard } from '@/features/auth/role-guard';
import { ProtectedShell } from '@/features/auth/protected-shell';
import { AppShell, type NavItem } from '@/features/layout/app-shell';

const nav: NavItem[] = [{ href: '/applicant/applications', label: 'My applications', icon: 'my-applications' }];

export default function ApplicantLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedShell>
      <RoleGuard allow={[Role.APPLICANT]} fallback={<div className="p-6">Unauthorized.</div>}>
        <AppShell portalLabel="Applicant portal" accent="applicant" navItems={nav}>
          {children}
        </AppShell>
      </RoleGuard>
    </ProtectedShell>
  );
}
