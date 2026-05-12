'use client';

import { Role } from '@nbr/shared';
import {
  Building2,
  ClipboardList,
  Inbox,
  Layers,
  LayoutList,
  LogOut,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleBadge } from '@/components/ui/role-badge';
import { initialsFromFullName } from '@/lib/user-display';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

/** Serializable nav icon id (resolved to Lucide icons only inside this client module). */
export type NavIconId =
  | 'my-applications'
  | 'admin-applications'
  | 'admin-users'
  | 'admin-audit'
  | 'reviewer-queue'
  | 'approver-queue';

const NAV_ICONS: Record<NavIconId, LucideIcon> = {
  'my-applications': LayoutList,
  'admin-applications': Layers,
  'admin-users': Users,
  'admin-audit': ScrollText,
  'reviewer-queue': Inbox,
  'approver-queue': ClipboardList,
};

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconId;
}

function HeaderActions({
  contextLabel,
  initials,
  user,
  logout,
}: {
  contextLabel?: string;
  initials: string;
  user: { fullName: string; email: string; role: Role };
  logout: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      {contextLabel ? (
        <span className="hidden max-w-[200px] items-center gap-1.5 truncate rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground lg:inline-flex">
          <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate text-foreground">{contextLabel}</span>
        </span>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground shadow-sm outline-none transition-colors',
              'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
            aria-label="Open profile menu"
          >
            {initials}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-2">
            <p className="truncate text-sm font-semibold text-foreground">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <RoleBadge role={user.role as Role} />
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="gap-2 opacity-60">
            <Settings className="h-4 w-4" aria-hidden />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onSelect={() => {
              logout();
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AppShell({
  portalLabel,
  accent,
  navItems,
  contextLabel,
  children,
}: {
  portalLabel: string;
  accent: 'applicant' | 'regulator';
  navItems: NavItem[];
  contextLabel?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = initialsFromFullName(user.fullName);

  const activeTabClass =
    accent === 'applicant'
      ? 'border-b-2 border-applicant font-semibold text-foreground'
      : 'border-b-2 border-brand font-semibold text-foreground';

  const inactiveTabClass =
    'border-b-2 border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <ShieldCheck
                className={cn(
                  'h-7 w-7 shrink-0',
                  accent === 'applicant' ? 'text-applicant' : 'text-brand',
                )}
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {portalLabel}
              </p>
              <p className="truncate text-lg font-semibold leading-tight text-foreground">NBR Licensing</p>
            </div>
          </div>

          <HeaderActions contextLabel={contextLabel} initials={initials} user={user} logout={logout} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-8 pt-4">
        <div className="mb-6 border-b border-border/60 pb-0">
          <nav className="-mx-1 min-w-0 overflow-x-auto px-1 sm:mx-0 sm:px-0" aria-label="Primary">
            <div className="inline-flex min-h-[44px] w-full min-w-min items-end justify-start gap-1 md:min-h-0 md:w-auto md:gap-0">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const NavIcon = NAV_ICONS[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:py-3',
                      active ? activeTabClass : inactiveTabClass,
                      active &&
                        (accent === 'applicant' ? '[&_svg]:text-applicant' : '[&_svg]:text-brand'),
                    )}
                  >
                    <NavIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {children}
      </main>
    </div>
  );
}
