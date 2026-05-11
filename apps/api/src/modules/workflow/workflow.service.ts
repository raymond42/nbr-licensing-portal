import { BadRequestException, Injectable } from '@nestjs/common';

import { ApplicationStatus, Role, TERMINAL_STATES, WORKFLOW_TRANSITIONS } from '@nbr/shared';

import { WorkflowHttpAction } from './workflow-action.enum';

const ACTION_TO_EDGE: Readonly<
  Record<WorkflowHttpAction, { from: ApplicationStatus; to: ApplicationStatus }>
> = {
  [WorkflowHttpAction.SUBMIT]: {
    from: ApplicationStatus.DRAFT,
    to: ApplicationStatus.SUBMITTED,
  },
  [WorkflowHttpAction.START_REVIEW]: {
    from: ApplicationStatus.SUBMITTED,
    to: ApplicationStatus.UNDER_REVIEW,
  },
  [WorkflowHttpAction.CONTINUE_REVIEW]: {
    from: ApplicationStatus.RESUBMITTED,
    to: ApplicationStatus.UNDER_REVIEW,
  },
  [WorkflowHttpAction.REQUEST_INFO]: {
    from: ApplicationStatus.UNDER_REVIEW,
    to: ApplicationStatus.INFO_REQUESTED,
  },
  [WorkflowHttpAction.COMPLETE_REVIEW]: {
    from: ApplicationStatus.UNDER_REVIEW,
    to: ApplicationStatus.REVIEW_COMPLETED,
  },
  [WorkflowHttpAction.RESUBMIT]: {
    from: ApplicationStatus.INFO_REQUESTED,
    to: ApplicationStatus.RESUBMITTED,
  },
  [WorkflowHttpAction.APPROVE]: {
    from: ApplicationStatus.REVIEW_COMPLETED,
    to: ApplicationStatus.APPROVED,
  },
  [WorkflowHttpAction.REJECT]: {
    from: ApplicationStatus.REVIEW_COMPLETED,
    to: ApplicationStatus.REJECTED,
  },
};

@Injectable()
export class WorkflowService {
  isTerminal(status: ApplicationStatus): boolean {
    return TERMINAL_STATES.includes(status);
  }

  assertNotTerminal(status: ApplicationStatus): void {
    if (this.isTerminal(status)) {
      throw new BadRequestException('Application is in a final state and cannot be modified');
    }
  }

  assertTransitionAllowed(params: {
    from: ApplicationStatus;
    to: ApplicationStatus;
    role: Role;
  }): void {
    const { from, to, role } = params;
    const allowed = WORKFLOW_TRANSITIONS.some(
      (t) => t.from === from && t.to === to && t.allowedRoles.includes(role),
    );
    if (!allowed) {
      throw new BadRequestException(
        `Transition from ${from} to ${to} is not allowed for role ${role}`,
      );
    }
  }

  resolveTransition(params: {
    action: WorkflowHttpAction;
    currentStatus: ApplicationStatus;
    role: Role;
  }): { from: ApplicationStatus; to: ApplicationStatus } {
    const { action, currentStatus, role } = params;
    const edge = ACTION_TO_EDGE[action];
    if (edge.from !== currentStatus) {
      throw new BadRequestException(
        `Action ${action} requires status ${edge.from}; current status is ${currentStatus}`,
      );
    }
    this.assertNotTerminal(currentStatus);
    this.assertTransitionAllowed({ from: edge.from, to: edge.to, role });
    return edge;
  }
}
