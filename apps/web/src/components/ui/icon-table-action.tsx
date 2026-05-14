'use client';

import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrackedLink, useNavigationLoading } from '@/providers/navigation-loading-provider';
import { cn } from '@/lib/utils';

export function IconTableAction({
  label,
  icon: Icon,
  href,
  onClick,
  disabled,
  className,
}: {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const { pendingHref } = useNavigationLoading();
  const btnClass = cn('h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground', className);

  if (href) {
    const isPending = pendingHref === href;

    return (
      <div className="flex justify-center">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className={cn(btnClass, isPending && 'pointer-events-none opacity-70')}
        >
          <TrackedLink href={href} title={label} aria-label={label} aria-disabled={isPending}>
            {isPending ? (
              <LoadingSpinner className="h-4 w-4 border-[1.5px]" />
            ) : (
              <Icon className="h-4 w-4" aria-hidden />
            )}
          </TrackedLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btnClass}
        title={label}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
