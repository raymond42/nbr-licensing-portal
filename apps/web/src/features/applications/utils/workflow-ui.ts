import { ApplicationStatus } from '@nbr/shared';

export const REGULATOR_STEP_LABELS = [
  'Draft',
  'Submitted',
  'Under review',
  'Recommendation',
  'Decision',
] as const;

export type RegulatorStepIndex = 0 | 1 | 2 | 3 | 4;

export function mapStatusToRegulatorStep(status: ApplicationStatus): {
  step: RegulatorStepIndex;
  sublabel?: string;
} {
  switch (status) {
    case ApplicationStatus.DRAFT:
      return { step: 0 };
    case ApplicationStatus.SUBMITTED:
      return { step: 1 };
    case ApplicationStatus.UNDER_REVIEW:
      return { step: 2 };
    case ApplicationStatus.INFO_REQUESTED:
      return { step: 2, sublabel: 'Information requested' };
    case ApplicationStatus.RESUBMITTED:
      return { step: 2, sublabel: 'Resubmitted' };
    case ApplicationStatus.REVIEW_COMPLETED:
      return { step: 3 };
    case ApplicationStatus.APPROVED:
    case ApplicationStatus.REJECTED:
      return { step: 4 };
    default:
      return { step: 0 };
  }
}

export function isTerminalStatus(status: ApplicationStatus): boolean {
  return status === ApplicationStatus.APPROVED || status === ApplicationStatus.REJECTED;
}
