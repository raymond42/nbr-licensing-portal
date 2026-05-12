import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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
    description: string;
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
      description: app.description,
      status: app.status as SharedAppStatus,
      version: app.version,
      reviewCompletedByUserId: app.reviewCompletedByUserId,
      submittedAt: app.submittedAt?.toISOString() ?? null,
      decidedAt: app.decidedAt?.toISOString() ?? null,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };
  }

  async create(
    user: RequestUser,
    institutionName: string,
    licenseCategory: string,
    description = '',
  ) {
    if (user.role !== SharedRole.APPLICANT) {
      throw new ForbiddenException('Only applicants may create applications');
    }

    const application = await this.prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          applicantId: user.sub,
          institutionName,
          licenseCategory,
          description,
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

  async list(viewer: RequestUser, page: number, take: number) {
    const skip = page * take;
    let where: Prisma.ApplicationWhereInput = {};
    if (viewer.role === SharedRole.APPLICANT) {
      where = { applicantId: viewer.sub };
    } else if (viewer.role === SharedRole.ADMIN) {
      where = {};
    } else if (viewer.role === SharedRole.APPROVER) {
      where = { status: ApplicationStatus.REVIEW_COMPLETED };
    } else {
      where = { NOT: { status: ApplicationStatus.DRAFT } };
    }
    const [rows, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.application.count({ where }),
    ]);
    return {
      items: rows.map((a) => this.toResponse(a)),
      total,
      page,
      take,
    };
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
    patch: { institutionName?: string; licenseCategory?: string; description?: string },
  ) {
    if (viewer.role !== SharedRole.APPLICANT) {
      throw new ForbiddenException('Only applicants may edit draft applications');
    }
    const hasInst = patch.institutionName !== undefined;
    const hasLic = patch.licenseCategory !== undefined;
    const hasDesc = patch.description !== undefined;
    if (!hasInst && !hasLic && !hasDesc) {
      throw new UnprocessableEntityException('No fields to update');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const current = await tx.application.findUnique({ where: { id } });
      if (!current || current.applicantId !== viewer.sub) {
        throw new NotFoundException('Application not found');
      }

      const data: {
        institutionName?: string;
        licenseCategory?: string;
        description?: string;
        version: { increment: number };
      } = { version: { increment: 1 } };

      if (current.status === ApplicationStatus.DRAFT) {
        if (hasInst) data.institutionName = patch.institutionName;
        if (hasLic) data.licenseCategory = patch.licenseCategory;
        if (hasDesc) data.description = patch.description;
        const result = await tx.application.updateMany({
          where: {
            id,
            version: expectedVersion,
            applicantId: viewer.sub,
            status: ApplicationStatus.DRAFT,
          },
          data,
        });
        if (result.count !== 1) {
          throw new ConflictException('Application version mismatch; refresh and retry');
        }
      } else if (current.status === ApplicationStatus.INFO_REQUESTED) {
        if (hasInst || hasLic) {
          throw new UnprocessableEntityException(
            'Only description may be updated while information is requested',
          );
        }
        data.description = patch.description;
        const result = await tx.application.updateMany({
          where: {
            id,
            version: expectedVersion,
            applicantId: viewer.sub,
            status: ApplicationStatus.INFO_REQUESTED,
          },
          data,
        });
        if (result.count !== 1) {
          throw new ConflictException('Application version mismatch; refresh and retry');
        }
      } else {
        throw new UnprocessableEntityException('Application cannot be edited in this status');
      }

      const next = await tx.application.findUniqueOrThrow({ where: { id } });
      await this.auditService.append(tx, {
        applicationId: id,
        actorUserId: viewer.sub,
        action: AuditAction.APPLICATION_UPDATED,
        previousStatus: next.status,
        nextStatus: next.status,
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
    note?: string,
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
      const metadata: Prisma.InputJsonValue | undefined = note
        ? ({ note: note.trim() } as Prisma.InputJsonValue)
        : undefined;
      await this.auditService.append(tx, {
        applicationId: id,
        actorUserId: viewer.sub,
        action: AuditAction.STATUS_CHANGED,
        previousStatus: from,
        nextStatus: to,
        metadata,
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

  requestInfo(id: string, viewer: RequestUser, expectedVersion: number, note?: string) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.REQUEST_INFO, note);
  }

  completeReview(id: string, viewer: RequestUser, expectedVersion: number, note?: string) {
    return this.runTransition(
      id,
      viewer,
      expectedVersion,
      WorkflowHttpAction.COMPLETE_REVIEW,
      note,
    );
  }

  resubmit(id: string, viewer: RequestUser, expectedVersion: number) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.RESUBMIT);
  }

  approve(id: string, viewer: RequestUser, expectedVersion: number, note?: string) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.APPROVE, note);
  }

  reject(id: string, viewer: RequestUser, expectedVersion: number, note?: string) {
    return this.runTransition(id, viewer, expectedVersion, WorkflowHttpAction.REJECT, note);
  }
}
