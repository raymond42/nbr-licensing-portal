import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditAction, ApplicationStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

import { ApplicationStatus as AppStatusShared, Role } from '@nbr/shared';

import type { RequestUser } from '../../common/types/jwt-payload.type';
import { PrismaService } from '../../prisma/prisma.service';
import { computeAuditIntegrityHash } from './audit-integrity';

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
    const id = randomUUID();
    const integrityHash = computeAuditIntegrityHash({
      id,
      applicationId: params.applicationId,
      actorUserId: params.actorUserId,
      action: params.action,
      previousStatus: params.previousStatus,
      nextStatus: params.nextStatus,
      metadata: params.metadata,
    });
    return tx.auditLog.create({
      data: {
        id,
        applicationId: params.applicationId,
        actorUserId: params.actorUserId,
        action: params.action,
        previousStatus: params.previousStatus,
        nextStatus: params.nextStatus,
        metadata: params.metadata,
        integrityHash,
      },
    });
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

  async listGlobal(viewer: RequestUser, page = 0, take = 50) {
    if (viewer.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    const t = Math.min(Math.max(take, 1), 200);
    const skip = Math.max(page, 0) * t;
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip,
        take: t,
        include: {
          actor: { select: { id: true, email: true, fullName: true, role: true } },
          application: { select: { id: true } },
        },
      }),
      this.prisma.auditLog.count(),
    ]);
    const items = rows.map((row) => ({
      id: row.id,
      applicationId: row.applicationId,
      actorUserId: row.actorUserId,
      action: row.action,
      previousStatus: row.previousStatus,
      nextStatus: row.nextStatus,
      metadata: row.metadata,
      integrityHash: row.integrityHash,
      createdAt: row.createdAt.toISOString(),
      actor: row.actor,
      application: row.application,
    }));
    return { items, total, page: Math.max(page, 0), take: t };
  }

  async verifyGlobalIntegrity(viewer: RequestUser) {
    if (viewer.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    let checked = 0;
    let legacySkipped = 0;
    const batchSize = 500;
    let skip = 0;
    for (;;) {
      const rows = await this.prisma.auditLog.findMany({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip,
        take: batchSize,
        select: {
          id: true,
          applicationId: true,
          actorUserId: true,
          action: true,
          previousStatus: true,
          nextStatus: true,
          metadata: true,
          integrityHash: true,
        },
      });
      if (rows.length === 0) {
        break;
      }
      for (const row of rows) {
        if (!row.integrityHash) {
          legacySkipped += 1;
          continue;
        }
        const expected = computeAuditIntegrityHash({
          id: row.id,
          applicationId: row.applicationId,
          actorUserId: row.actorUserId,
          action: row.action,
          previousStatus: row.previousStatus,
          nextStatus: row.nextStatus,
          metadata: row.metadata === null ? undefined : (row.metadata as Prisma.InputJsonValue),
        });
        if (expected !== row.integrityHash) {
          return {
            ok: false as const,
            checked,
            legacySkipped,
            brokenEntryId: row.id,
          };
        }
        checked += 1;
      }
      skip += batchSize;
    }
    return { ok: true as const, checked, legacySkipped };
  }

  assertCanViewApplication(
    viewer: { sub: string; role: Role },
    application: { applicantId: string; status: ApplicationStatus },
  ): void {
    if (viewer.role === Role.APPLICANT && application.applicantId !== viewer.sub) {
      throw new ForbiddenException('You do not have permission to view this application');
    }
    if (
      viewer.role === Role.REVIEWER ||
      viewer.role === Role.APPROVER ||
      viewer.role === Role.ADMIN
    ) {
      if (application.status === AppStatusShared.DRAFT && application.applicantId !== viewer.sub) {
        throw new ForbiddenException('You do not have permission to view this application');
      }
    }
  }
}
