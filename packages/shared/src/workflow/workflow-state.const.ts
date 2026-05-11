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
  { from: ApplicationStatus.UNDER_REVIEW, to: ApplicationStatus.INFO_REQUESTED, allowedRoles: [Role.REVIEWER] },
  { from: ApplicationStatus.UNDER_REVIEW, to: ApplicationStatus.REVIEW_COMPLETED, allowedRoles: [Role.REVIEWER] },
  { from: ApplicationStatus.INFO_REQUESTED, to: ApplicationStatus.RESUBMITTED, allowedRoles: [Role.APPLICANT] },
  { from: ApplicationStatus.RESUBMITTED, to: ApplicationStatus.UNDER_REVIEW, allowedRoles: [Role.REVIEWER] },
  { from: ApplicationStatus.REVIEW_COMPLETED, to: ApplicationStatus.APPROVED, allowedRoles: [Role.APPROVER] },
  { from: ApplicationStatus.REVIEW_COMPLETED, to: ApplicationStatus.REJECTED, allowedRoles: [Role.APPROVER] },
]);

export const TERMINAL_STATES: readonly ApplicationStatus[] = Object.freeze([
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
]);
