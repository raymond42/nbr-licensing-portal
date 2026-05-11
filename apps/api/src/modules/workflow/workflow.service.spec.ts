import { BadRequestException } from '@nestjs/common';

import { ApplicationStatus, Role } from '@nbr/shared';

import { WorkflowHttpAction } from './workflow-action.enum';
import { WorkflowService } from './workflow.service';

describe('WorkflowService', () => {
  const service = new WorkflowService();

  it('rejects illegal transitions for role', () => {
    expect(() =>
      service.assertTransitionAllowed({
        from: ApplicationStatus.DRAFT,
        to: ApplicationStatus.APPROVED,
        role: Role.APPLICANT,
      }),
    ).toThrow(BadRequestException);
  });

  it('allows valid reviewer transition', () => {
    expect(() =>
      service.assertTransitionAllowed({
        from: ApplicationStatus.SUBMITTED,
        to: ApplicationStatus.UNDER_REVIEW,
        role: Role.REVIEWER,
      }),
    ).not.toThrow();
  });

  it('rejects mutation from terminal states', () => {
    expect(() => service.assertNotTerminal(ApplicationStatus.APPROVED)).toThrow(
      BadRequestException,
    );
    expect(() => service.assertNotTerminal(ApplicationStatus.REJECTED)).toThrow(
      BadRequestException,
    );
  });

  it('resolveTransition rejects wrong current status', () => {
    expect(() =>
      service.resolveTransition({
        action: WorkflowHttpAction.SUBMIT,
        currentStatus: ApplicationStatus.SUBMITTED,
        role: Role.APPLICANT,
      }),
    ).toThrow(BadRequestException);
  });

  it('resolveTransition rejects approver performing review action', () => {
    expect(() =>
      service.resolveTransition({
        action: WorkflowHttpAction.START_REVIEW,
        currentStatus: ApplicationStatus.SUBMITTED,
        role: Role.APPROVER,
      }),
    ).toThrow(BadRequestException);
  });
});
