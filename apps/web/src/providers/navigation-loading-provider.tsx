'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from 'react';

interface NavigationLoadingContextValue {
  isNavigating: boolean;
  pendingHref: string | null;
  startNavigation: (href?: string | null) => void;
  stopNavigation: () => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue>({
  isNavigating: false,
  pendingHref: null,
  startNavigation: () => {},
  stopNavigation: () => {},
});

const NAVIGATION_TIMEOUT_MS = 8000;

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const clearNavigationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stopNavigation = useCallback(() => {
    clearNavigationTimeout();
    setIsNavigating(false);
    setPendingHref(null);
  }, [clearNavigationTimeout]);

  const startNavigation = useCallback((href?: string | null) => {
    clearNavigationTimeout();
    setIsNavigating(true);
    setPendingHref(href ?? null);
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
      setPendingHref(null);
      timeoutRef.current = null;
    }, NAVIGATION_TIMEOUT_MS);
  }, [clearNavigationTimeout]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      stopNavigation();
    }
  }, [pathname, stopNavigation]);

  useEffect(() => stopNavigation, [stopNavigation]);

  const value = useMemo(
    () => ({ isNavigating, pendingHref, startNavigation, stopNavigation }),
    [isNavigating, pendingHref, startNavigation, stopNavigation],
  );

  return (
    <NavigationLoadingContext.Provider value={value}>
      {isNavigating ? <NavigationProgress /> : null}
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}

type TrackedLinkProps = ComponentPropsWithoutRef<typeof Link>;

export const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(function TrackedLink(
  { href, onClick, target, ...props },
  ref,
) {
  const { startNavigation } = useNavigationLoading();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      target === '_blank' ||
      !shouldTrackHref(href)
    ) {
      return;
    }

    startNavigation(navigationHrefFor(href));
  }

  return <Link ref={ref} href={href} target={target} onClick={handleClick} {...props} />;
});

function navigationHrefFor(href: TrackedLinkProps['href']): string | null {
  const rawHref = typeof href === 'string' ? href : href.pathname ?? '';
  if (!rawHref || rawHref.startsWith('#')) return null;

  try {
    const targetUrl = new URL(rawHref, window.location.href);
    if (targetUrl.origin !== window.location.origin) return null;

    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const next = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
    return current !== next ? next : null;
  } catch {
    return rawHref;
  }
}

function shouldTrackHref(href: TrackedLinkProps['href']): boolean {
  return navigationHrefFor(href) !== null;
}

function NavigationProgress() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden bg-primary/15"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="h-full w-2/3 origin-left animate-pulse bg-primary shadow-[0_0_18px_hsl(var(--primary))]" />
    </div>
  );
}
