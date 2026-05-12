'use client';

import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/theme-toggle';
import { isAppShellRoute } from '@/constants/routes';

/** Fixed top-right on public routes; hidden when `AppShell` provides its own toggle. */
export function GlobalThemeToggle() {
  const pathname = usePathname();
  if (isAppShellRoute(pathname)) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-end p-4">
      <div className="pointer-events-auto">
        <ThemeToggle />
      </div>
    </div>
  );
}
