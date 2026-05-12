import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

import { Role } from '@nbr/shared';

import { ApplicationsService } from './applications.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: {
    $transaction: jest.Mock;
    application: { findMany: jest.Mock; count: jest.Mock };
  };
  let workflow: { resolveTransition: jest.Mock };
  let audit: { append: jest.Mock; assertCanViewApplication: jest.Mock };

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
      application: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    workflow = { resolveTransition: jest.fn() };
    audit = {
      append: jest.fn(),
      assertCanViewApplication: jest.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test doubles
    service = new ApplicationsService(prisma as any, workflow as any, audit as any);
  });

  it('returns 403 when approver is the same user who completed review', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'app-1',
      applicantId: 'applicant-1',
      status: ApplicationStatus.REVIEW_COMPLETED,
      version: 3,
      reviewCompletedByUserId: 'approver-1',
    });
    prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        application: {
          findUnique,
          updateMany: jest.fn(),
          findUniqueOrThrow: jest.fn(),
        },
      }),
    );
    workflow.resolveTransition.mockReturnValue({
      from: ApplicationStatus.REVIEW_COMPLETED,
      to: ApplicationStatus.APPROVED,
    });

    await expect(
      service.approve('app-1', { sub: 'approver-1', email: 'a', role: Role.APPROVER }, 3),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 409 when optimistic locking fails', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'app-1',
      applicantId: 'applicant-1',
      status: ApplicationStatus.DRAFT,
      version: 0,
      reviewCompletedByUserId: null,
    });
    const updateMany = jest.fn().mockResolvedValue({ count: 0 });
    prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        application: {
          findUnique,
          updateMany,
          findUniqueOrThrow: jest.fn(),
        },
      }),
    );
    workflow.resolveTransition.mockReturnValue({
      from: ApplicationStatus.DRAFT,
      to: ApplicationStatus.SUBMITTED,
    });

    await expect(
      service.submit('app-1', { sub: 'applicant-1', email: 'a', role: Role.APPLICANT }, 99),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('list excludes drafts for admin viewers', async () => {
    const findMany = prisma.application.findMany as jest.Mock;
    const count = prisma.application.count as jest.Mock;

    await service.list({ sub: 'admin-1', email: 'a', role: Role.ADMIN }, 0, 10);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { NOT: { status: ApplicationStatus.DRAFT } },
      }),
    );
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { NOT: { status: ApplicationStatus.DRAFT } },
      }),
    );
  });

  it('list scopes drafts to applicant only', async () => {
    const findMany = prisma.application.findMany as jest.Mock;

    await service.list({ sub: 'user-1', email: 'a', role: Role.APPLICANT }, 0, 10);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { applicantId: 'user-1' },
      }),
    );
  });
});
