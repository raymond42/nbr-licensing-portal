import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditAction, ApplicationStatus } from '@prisma/client';

import { ApplicationStatus as AppStatusShared, Role } from '@nbr/shared';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  // Call inside the same Prisma $transaction as the state change.
  append(
    tx: Prisma.TransactionClient,
    params: {
      applicationId: string;
      actorUserId: string;
      action: AuditAction;
      previousStatus: ApplicationStatus | null;
      nextStatus: ApplicationStatus | null;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    return tx.auditLog.create({ data: params });
  }

  async listForApplication(applicationId: string, viewer: { sub: string; role: Role }) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, applicantId: true, status: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    this.assertCanViewApplication(viewer, application);

    return this.prisma.auditLog.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        actor: { select: { id: true, email: true, fullName: true, role: true } },
      },
    });
  }

  assertCanViewApplication(
    viewer: { sub: string; role: Role },
    application: { applicantId: string; status: ApplicationStatus },
  ): void {
    if (viewer.role === Role.APPLICANT && application.applicantId !== viewer.sub) {
      throw new NotFoundException('Application not found');
    }
    if (
      viewer.role === Role.REVIEWER ||
      viewer.role === Role.APPROVER ||
      viewer.role === Role.ADMIN
    ) {
      if (application.status === AppStatusShared.DRAFT && application.applicantId !== viewer.sub) {
        throw new NotFoundException('Application not found');
      }
    }
  }
}
