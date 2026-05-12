import { Role } from '@nbr/shared';

import { cn } from '@/lib/utils';

const map: Record<Role, { className: string; label: string }> = {
  [Role.APPLICANT]: { className: 'bg-sky-100 text-sky-900', label: 'APPLICANT' },
  [Role.REVIEWER]: { className: 'bg-amber-100 text-amber-900', label: 'REVIEWER' },
  [Role.APPROVER]: { className: 'bg-yellow-100 text-yellow-900', label: 'APPROVER' },
  [Role.ADMIN]: { className: 'bg-orange-100 text-orange-900', label: 'ADMIN' },
};

export function RoleBadge({ role }: { role: Role }) {
  const m = map[role];
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}
