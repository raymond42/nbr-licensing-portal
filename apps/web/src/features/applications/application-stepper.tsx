import { Check } from 'lucide-react';

import {
  Stepper,
  StepperConnector,
  StepperIndicator,
  StepperItem,
  StepperLabelContent,
  StepperStepContent,
} from '@/components/ui/stepper';
import {
  mapStatusToRegulatorStep,
  REGULATOR_STEP_LABELS,
  type RegulatorStepIndex,
} from '@/lib/workflow-ui';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@nbr/shared';

export function ApplicationStepper({
  status,
  accent = 'regulator',
}: {
  status: ApplicationStatus;
  accent?: 'applicant' | 'regulator';
}) {
  const { step: activeIndex, sublabel } = mapStatusToRegulatorStep(status);

  const lineDone = accent === 'applicant' ? 'bg-applicant' : 'bg-brand';
  const lineMuted = 'bg-border';
  const circleDone =
    accent === 'applicant'
      ? 'border-applicant bg-applicant text-primary-foreground'
      : 'border-brand bg-brand text-primary-foreground';
  const circleCurrent =
    accent === 'applicant'
      ? 'border-applicant bg-background text-applicant'
      : 'border-brand bg-background text-brand';
  const circleFuture = 'border-border bg-background text-muted-foreground';

  return (
    <div className="w-full min-w-0">
      <Stepper>
        {REGULATOR_STEP_LABELS.map((label, i) => {
          const idx = i as RegulatorStepIndex;
          const done = idx < activeIndex;
          const current = idx === activeIndex;
          const leftSegmentDone = i > 0 && activeIndex > idx - 1;

          return (
            <StepperItem key={label}>
              {i > 0 ? (
                <StepperConnector className={cn(leftSegmentDone ? lineDone : lineMuted)} />
              ) : null}
              <StepperStepContent>
                <StepperIndicator
                  className={cn(done ? circleDone : current ? circleCurrent : circleFuture)}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                </StepperIndicator>
                <StepperLabelContent>
                  <p
                    className={cn(
                      'text-xs md:text-sm',
                      current ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground',
                    )}
                  >
                    {label}
                  </p>
                  {current && sublabel ? (
                    <p className="text-xs leading-snug text-muted-foreground">{sublabel}</p>
                  ) : null}
                </StepperLabelContent>
              </StepperStepContent>
            </StepperItem>
          );
        })}
      </Stepper>
    </div>
  );
}
