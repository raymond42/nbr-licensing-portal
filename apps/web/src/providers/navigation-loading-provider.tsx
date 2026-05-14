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
  startNavigation: () => void;
  stopNavigation: () => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue>({
  isNavigating: false,
  startNavigation: () => {},
  stopNavigation: () => {},
});

const NAVIGATION_TIMEOUT_MS = 8000;

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const clearNavigationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stopNavigation = useCallback(() => {
    clearNavigationTimeout();
    setIsNavigating(false);
  }, [clearNavigationTimeout]);

  const startNavigation = useCallback(() => {
    clearNavigationTimeout();
    setIsNavigating(true);
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
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
    () => ({ isNavigating, startNavigation, stopNavigation }),
    [isNavigating, startNavigation, stopNavigation],
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

    startNavigation();
  }

  return <Link ref={ref} href={href} target={target} onClick={handleClick} {...props} />;
});

function shouldTrackHref(href: TrackedLinkProps['href']): boolean {
  const rawHref = typeof href === 'string' ? href : href.pathname ?? '';
  if (!rawHref || rawHref.startsWith('#')) return false;

  try {
    const targetUrl = new URL(rawHref, window.location.href);
    if (targetUrl.origin !== window.location.origin) return false;

    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const next = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
    return current !== next;
  } catch {
    return true;
  }
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
