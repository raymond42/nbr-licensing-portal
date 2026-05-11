export enum Role {
  APPLICANT = 'APPLICANT',
  REVIEWER = 'REVIEWER',
  APPROVER = 'APPROVER',
  ADMIN = 'ADMIN',
}

export const ALL_ROLES: readonly Role[] = Object.freeze([
  Role.APPLICANT,
  Role.REVIEWER,
  Role.APPROVER,
  Role.ADMIN,
]);
