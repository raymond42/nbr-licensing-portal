'use client';

import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TrackedLink } from '@/providers/navigation-loading-provider';
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
  const btnClass = cn('h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground', className);

  if (href) {
    return (
      <div className="flex justify-center">
        <Button asChild variant="ghost" size="icon" className={btnClass}>
          <TrackedLink href={href} title={label} aria-label={label}>
            <Icon className="h-4 w-4" aria-hidden />
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
