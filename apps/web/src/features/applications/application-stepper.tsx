'use client';

import { rem, Stepper } from '@mantine/core';

import {
  isTerminalStatus,
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
  const active = isTerminalStatus(status) ? REGULATOR_STEP_LABELS.length : activeIndex;
  const color = accent === 'applicant' ? 'hsl(var(--applicant-primary))' : 'hsl(var(--brand))';

  return (
    <div className="w-full min-w-0">
      <Stepper
        active={active}
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
            description={i === activeIndex && active === activeIndex && sublabel ? sublabel : undefined}
            label={label}
          />
        ))}
      </Stepper>
    </div>
  );
}
