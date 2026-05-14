import { Role } from '@nbr/shared';

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

export function appPathPrefixForRole(role: Role): (typeof APP_SHELL_PATH_PREFIXES)[number] | null {
  switch (role) {
    case Role.APPLICANT:
      return '/applicant';
    case Role.REVIEWER:
      return '/reviewer';
    case Role.APPROVER:
      return '/approver';
    case Role.ADMIN:
      return '/admin';
    default:
      return null;
  }
}

export function isPathAllowedForRole(pathname: string, role: Role): boolean {
  const prefix = appPathPrefixForRole(role);
  return !!prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function settingsPathForRole(role: Role): string {
  const prefix = appPathPrefixForRole(role);
  return prefix ? `${prefix}/settings` : '/login';
}
