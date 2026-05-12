import { Role } from '@nbr/shared';

/** Path prefixes where `AppShell` wraps authenticated workspace routes. */
export const APP_SHELL_PATH_PREFIXES = ['/applicant', '/admin', '/reviewer', '/approver'] as const;

export function isAppShellRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return APP_SHELL_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case Role.APPLICANT:
      return '/applicant/applications';
    case Role.REVIEWER:
      return '/reviewer/queue';
    case Role.APPROVER:
      return '/approver/queue';
    case Role.ADMIN:
      return '/admin/applications';
    default:
      return '/login';
  }
}
