import * as React from 'react';

import { cn } from '@/lib/utils';

const Timeline = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} role="list" className={cn('space-y-0', className)} {...props} />
  ),
);
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('flex gap-3', className)} {...props} />
  ),
);
TimelineItem.displayName = 'TimelineItem';

const TimelineTrack = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col items-center self-stretch', className)} {...props} />
  ),
);
TimelineTrack.displayName = 'TimelineTrack';

const TimelineMarker = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground ring-2 ring-background',
        className,
      )}
      {...props}
    />
  ),
);
TimelineMarker.displayName = 'TimelineMarker';

const TimelineConnector = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn('mt-1 w-px min-h-4 flex-1 bg-border', className)}
      {...props}
    />
  ),
);
TimelineConnector.displayName = 'TimelineConnector';

const TimelineContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="timeline-content"
      className={cn('min-w-0 flex-1 border-b border-border pb-4', className)}
      {...props}
    />
  ),
);
TimelineContent.displayName = 'TimelineContent';

export { Timeline, TimelineConnector, TimelineContent, TimelineItem, TimelineMarker, TimelineTrack };
