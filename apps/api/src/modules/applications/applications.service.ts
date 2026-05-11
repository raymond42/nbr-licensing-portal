import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuditAction, ApplicationStatus } from '@prisma/client';

import { ApplicationStatus as SharedAppStatus, Role as SharedRole } from '@nbr/shared';

import type { RequestUser } from '../../common/types/jwt-payload.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkflowHttpAction } from '../workflow/workflow-action.enum';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly auditService: AuditService,
  ) {}

  private toResponse(app: {
    id: string;
    applicantId: string;
    institutionName: string;
    licenseCategory: string;
    status: ApplicationStatus;
    version: number;
    reviewCompletedByUserId: string | null;
    submittedAt: Date | null;
    decidedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: app.id,
      applicantId: app.applicantId,
      institutionName: app.institutionName,
      licenseCategory: app.licenseCategory,
      status: app.status as SharedAppStatus,
      version: app.version,
      reviewCompletedByUserId: app.reviewCompletedByUserId,
      submittedAt: app.submittedAt?.toISOString() ?? null,
      decidedAt: app.decidedAt?.toISOString() ?? null,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };
  }

  async create(user: RequestUser, institutionName: string, licenseCategory: string) {
    if (user.role !== SharedRole.APPLICANT) {
      throw new ForbiddenException('Only applicants may create applications');
    }

    const application = await this.prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          applicantId: user.sub,
          institutionName,
          licenseCategory,
          status: ApplicationStatus.DRAFT,
        },
      });
      await this.auditService.append(tx, {
        applicationId: app.id,
        actorUserId: user.sub,
        action: AuditAction.APPLICATION_CREATED,
        previousStatus: null,
        nextStatus: ApplicationStatus.DRAFT,
      });
      return app;
    });

    return this.toResponse(application);
  }

  async list(viewer: RequestUser) {
    if (viewer.role === SharedRole.APPLICANT) {
      const rows = await this.prisma.application.findMany({
        where: { applicantId: viewer.sub },
        orderBy: { updatedAt: 'desc' },
      });
      return rows.map((a) => this.toResponse(a));
    }
    if (viewer.role === SharedRole.ADMIN) {
      const rows = await this.prisma.application.findMany({ orderBy: { updatedAt: 'desc' } });
      return rows.map((a) => this.toResponse(a));
    }
    const rows = await this.prisma.application.findMany({
      where: { NOT: { status: ApplicationStatus.DRAFT } },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((a) => this.toResponse(a));
  }

  async findOne(id: string, viewer: RequestUser) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    this.auditService.assertCanViewApplication(viewer, app);
    return this.toResponse(app);
  }

  async updateDraft(
    id: string,
    viewer: RequestUser,
    expectedVersion: number,
    patch: { institutionName?: string; licenseCategory?: string },
  ) {
    if (viewer.role !== SharedRole.APPLICANT) {
      throw new ForbiddenException('Only applicants may edit draft applications');
    }
    if (!patch.institutionName && !patch.licenseCategory) {
      throw new UnprocessableEntityException('No fields to update');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const current = await tx.application.findUnique({ where: { id } });
      if (!current || current.applicantId !== viewer.sub) {
        throw new NotFoundException('Application not found');
      }
      if (current.status !== ApplicationStatus.DRAFT) {
        throw new UnprocessableEntityException('Application can only be edited in DRAFT');
      }

      const result = await tx.application.updateMany({
        where: {
          id,
          version: expectedVersion,
          applicantId: viewer.sub,
          status: ApplicationStatus.DRAFT,
        },
        data: {
          ...patch,
          version: { increment: 1 },
        },
      });
      if (result.count !== 1) {
        throw new ConflictException('Application version mismatch; refresh and retry');
      }

      const next = await tx.application.findUniqueOrThrow({ where: { id } });
      await this.auditService.append(tx, {
        applicationId: id,
        actorUserId: viewer.sub,
        action: AuditAction.APPLICATION_UPDATED,
        previousStatus: ApplicationStatus.DRAFT,
        nextStatus: ApplicationStatus.DRAFT,
      });
      return next;
    });

    return this.toResponse(updated);
  }

  private async runTransition(
    id: string,
    viewer: RequestUser,
    expectedVersion: number,
    action: WorkflowHttpAction,
  ) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.application.findUnique({ where: { id } });
      if (!app) {
        throw new NotFoundException('Application not found');
      }
      this.auditService.assertCanViewApplication(viewer, app);

      const { from, to } = this.workflowService.resolveTransition({
        action,
        currentStatus: app.status as SharedAppStatus,
        role: viewer.role,
      });

      if (action === WorkflowHttpAction.APPROVE) {
        if (app.reviewCompletedByUserId && app.reviewCompletedByUserId === viewer.sub) {
          throw new ForbiddenException(
            'The user who completed review cannot approve the same application',
          );
        }
      }

      const data: {
        status: ApplicationStatus;
        version: { increment: number };
        submittedAt?: Date | null;
        decidedAt?: Date | null;
        reviewCompletedByUserId?: string | null;
      } = {
        status: to,
        version: { increment: 1 },
      };

      if (to === ApplicationStatus.SUBMITTED) {
        data.submittedAt = new Date();
      }
      if (to === ApplicationStatus.REVIEW_COMPLETED) {
        data.reviewCompletedByUserId = viewer.sub;
      }
      if (to === ApplicationStatus.APPROVED || to === ApplicationStatus.REJECTED) {
        data.decidedAt = new Date();
      }

      const result = await tx.application.updateMany({
        where: { id, version: expectedVersion },
        data,
      });
      if (result.count !== 1) {
        throw new ConflictException('Application version mismatch; refresh and retry');
      }

      const next = await tx.application.findUniqueOrThrow({ where: { id } });
      await this.auditService.append(tx, {
        applicationId: id,
        actorUserId: viewer.sub,
        action: AuditAction.STATUS_CHANGED,
        previousStatus: from,
        nextStatus: to,
      });

      return next;
    });

    return this.toResponse(updated);
  }

  submit(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.SUBMIT);
  }

  startReview(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.START_REVIEW);
  }

  continueReview(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.CONTINUE_REVIEW);
  }

  requestInfo(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.REQUEST_INFO);
  }

  completeReview(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.COMPLETE_REVIEW);
  }

  resubmit(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.RESUBMIT);
  }

  approve(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.APPROVE);
  }

  reject(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.REJECT);
  }
}
