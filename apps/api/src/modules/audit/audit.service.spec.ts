import { ForbiddenException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

import { Role } from '@nbr/shared';

import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    service = new AuditService({} as never);
  });

  it('allows applicants to view their own drafts', () => {
    expect(() =>
      service.assertCanViewApplication(
        { sub: 'applicant-1', role: Role.APPLICANT },
        { applicantId: 'applicant-1', status: ApplicationStatus.DRAFT },
      ),
    ).not.toThrow();
  });

  it('forbids applications from other applicants', () => {
    expect(() =>
      service.assertCanViewApplication(
        { sub: 'applicant-2', role: Role.APPLICANT },
        { applicantId: 'applicant-1', status: ApplicationStatus.SUBMITTED },
      ),
    ).toThrow(ForbiddenException);
  });

  it.each([Role.ADMIN, Role.REVIEWER, Role.APPROVER])(
    'forbids another applicant draft from %s',
    (role) => {
      expect(() =>
        service.assertCanViewApplication(
          { sub: 'user-1', role },
          { applicantId: 'applicant-1', status: ApplicationStatus.DRAFT },
        ),
      ).toThrow(ForbiddenException);
    },
  );

  it.each([Role.ADMIN, Role.REVIEWER, Role.APPROVER])(
    'allows %s to view non-draft applications',
    (role) => {
      expect(() =>
        service.assertCanViewApplication(
          { sub: 'user-1', role },
          { applicantId: 'applicant-1', status: ApplicationStatus.SUBMITTED },
        ),
      ).not.toThrow();
    },
  );
});
