import * as React from 'react';

import { cn } from '@/lib/utils';

/** Horizontal stepper primitives; callers pass connector/indicator colors via `className`. */
const Stepper = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn('flex w-full min-w-0 flex-wrap items-center gap-y-3 md:flex-nowrap', className)}
      {...props}
    />
  ),
);
Stepper.displayName = 'Stepper';

const StepperItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('flex min-w-0 flex-1 items-center', className)} {...props} />
  ),
);
StepperItem.displayName = 'StepperItem';

const StepperConnector = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn('mx-1 h-0.5 min-w-[8px] flex-1 self-center rounded-full', className)}
      {...props}
    />
  ),
);
StepperConnector.displayName = 'StepperConnector';

const StepperIndicator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
        className,
      )}
      {...props}
    />
  ),
);
StepperIndicator.displayName = 'StepperIndicator';

const StepperStepContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex shrink-0 items-center gap-2', className)} {...props} />
  ),
);
StepperStepContent.displayName = 'StepperStepContent';

const StepperLabelContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex min-w-0 flex-col', className)} {...props} />
  ),
);
StepperLabelContent.displayName = 'StepperLabelContent';

export {
  Stepper,
  StepperConnector,
  StepperIndicator,
  StepperItem,
  StepperLabelContent,
  StepperStepContent,
};
