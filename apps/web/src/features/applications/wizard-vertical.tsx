import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface WizardStepDef {
  title: string;
  description: string;
}

export function WizardVertical({
  steps,
  currentIndex,
}: {
  steps: WizardStepDef[];
  currentIndex: number;
}) {
  return (
    <ol className="space-y-4 border-r border-border pr-4">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={s.title} className="flex gap-3">
            <span
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                done
                  ? 'border-applicant bg-applicant text-applicant-foreground'
                  : current
                    ? 'border-applicant bg-background text-applicant'
                    : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <div>
              <p className={cn('text-sm font-medium', current ? 'text-foreground' : 'text-muted-foreground')}>
                {s.title}
              </p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
