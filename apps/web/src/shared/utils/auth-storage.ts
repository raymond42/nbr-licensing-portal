import type { AuthenticatedUserDto } from '@nbr/shared';

const TOKEN_KEY = 'nbr_access_token';
const EXPIRES_KEY = 'nbr_access_expires_at_ms';
const USER_KEY = 'nbr_user';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const exp = localStorage.getItem(EXPIRES_KEY);
  if (!token || !exp) return null;
  if (Date.now() > Number(exp)) {
    clearSession();
    return null;
  }
  return token;
}

export function getStoredUser(): AuthenticatedUserDto | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthenticatedUserDto;
  } catch {
    return null;
  }
}

export function setSession(params: {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthenticatedUserDto;
}) {
  const expiresAtMs = Date.now() + params.expiresInSeconds * 1000;
  localStorage.setItem(TOKEN_KEY, params.accessToken);
  localStorage.setItem(EXPIRES_KEY, String(expiresAtMs));
  localStorage.setItem(USER_KEY, JSON.stringify(params.user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  localStorage.removeItem(USER_KEY);
}
