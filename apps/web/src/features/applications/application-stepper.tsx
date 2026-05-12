'use client';

import { rem, Stepper } from '@mantine/core';

import {
  mapStatusToRegulatorStep,
  REGULATOR_STEP_LABELS,
} from '@/lib/workflow-ui';
import type { ApplicationStatus } from '@nbr/shared';

export function ApplicationStepper({
  status,
  accent = 'regulator',
}: {
  status: ApplicationStatus;
  accent?: 'applicant' | 'regulator';
}) {
  const { step: activeIndex, sublabel } = mapStatusToRegulatorStep(status);
  const color = accent === 'applicant' ? 'orange' : 'yellow';

  return (
    <div className="w-full min-w-0">
      <Stepper
        active={activeIndex}
        color={color}
        iconSize={28}
        orientation="horizontal"
        size="sm"
        styles={{
          stepDescription: {
            color: 'hsl(var(--muted-foreground))',
            fontSize: rem(12),
            lineHeight: 1.375,
          },
        }}
      >
        {REGULATOR_STEP_LABELS.map((label, i) => (
          <Stepper.Step
            key={label}
            description={i === activeIndex && sublabel ? sublabel : undefined}
            label={label}
          />
        ))}
      </Stepper>
    </div>
  );
}
