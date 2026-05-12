export function initialsFromFullName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const w = parts[0] ?? '';
    const two = w.slice(0, 2).toUpperCase();
    return two.length > 0 ? two : '?';
  }
  const a = parts[0]?.charAt(0) ?? '';
  const b = parts[parts.length - 1]?.charAt(0) ?? '';
  const pair = `${a}${b}`.toUpperCase();
  return pair.length >= 2 ? pair : (a.toUpperCase() || '?');
}
