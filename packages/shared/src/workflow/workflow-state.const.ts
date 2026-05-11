import { ApplicationStatus } from '../enums/application-status.enum';
import { Role } from '../roles/role.enum';

export interface WorkflowTransition {
  readonly from: ApplicationStatus;
  readonly to: ApplicationStatus;
  readonly allowedRoles: readonly Role[];
}

export const WORKFLOW_TRANSITIONS: readonly WorkflowTransition[] = Object.freeze([
  { from: ApplicationStatus.DRAFT, to: ApplicationStatus.SUBMITTED, allowedRoles: [Role.APPLICANT] },
  { from: ApplicationStatus.SUBMITTED, to: ApplicationStatus.UNDER_REVIEW, allowedRoles: [Role.REVIEWER] },
  { from: ApplicationStatus.UNDER_REVIEW, to: ApplicationStatus.PENDING_APPROVAL, allowedRoles: [Role.REVIEWER] },
  { from: ApplicationStatus.UNDER_REVIEW, to: ApplicationStatus.REJECTED, allowedRoles: [Role.REVIEWER] },
  { from: ApplicationStatus.PENDING_APPROVAL, to: ApplicationStatus.APPROVED, allowedRoles: [Role.APPROVER] },
  { from: ApplicationStatus.PENDING_APPROVAL, to: ApplicationStatus.REJECTED, allowedRoles: [Role.APPROVER] },
  { from: ApplicationStatus.DRAFT, to: ApplicationStatus.WITHDRAWN, allowedRoles: [Role.APPLICANT] },
  { from: ApplicationStatus.SUBMITTED, to: ApplicationStatus.WITHDRAWN, allowedRoles: [Role.APPLICANT] },
]);

export const TERMINAL_STATES: readonly ApplicationStatus[] = Object.freeze([
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
]);
