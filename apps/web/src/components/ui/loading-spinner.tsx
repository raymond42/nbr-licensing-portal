import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <LoadingSpinner className="h-10 w-10" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
