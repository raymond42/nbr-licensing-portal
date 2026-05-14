import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { isAbsolute, join, normalize, relative, resolve } from 'path';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { AuditAction, ApplicationStatus, DocumentType } from '@prisma/client';
import { createHash } from 'crypto';
import { randomUUID } from 'crypto';

import { Role } from '@nbr/shared';

import type { RequestUser } from '../../common/types/jwt-payload.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  private uploadRoot(): string {
    return this.config.get<string>('UPLOAD_DIR', './uploads');
  }

  private toPublicDocument(doc: {
    id: string;
    applicationId: string;
    type: DocumentType;
    logicalKey: string;
    version: number;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
    checksum: string | null;
    uploadedByUserId: string;
    createdAt: Date;
  }) {
    return {
      id: doc.id,
      applicationId: doc.applicationId,
      type: doc.type,
      logicalKey: doc.logicalKey,
      version: doc.version,
      originalFileName: doc.originalFileName,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      checksum: doc.checksum,
      uploadedByUserId: doc.uploadedByUserId,
      uploadedAt: doc.createdAt.toISOString(),
    };
  }

  async listForApplication(applicationId: string, viewer: RequestUser) {
    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    this.auditService.assertCanViewApplication(viewer, application);

    const rows = await this.prisma.applicationDocument.findMany({
      where: { applicationId },
      orderBy: [{ logicalKey: 'asc' }, { version: 'desc' }],
    });
    return rows.map((d) => this.toPublicDocument(d));
  }

  async openDownloadStream(applicationId: string, documentId: string, viewer: RequestUser) {
    const doc = await this.prisma.applicationDocument.findFirst({
      where: { id: documentId, applicationId },
      include: { application: true },
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    this.auditService.assertCanViewApplication(viewer, doc.application);

    const root = resolve(this.uploadRoot());
    const rel = normalize(doc.storagePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const absolute = resolve(join(root, rel));
    const relToRoot = relative(root, absolute);
    if (relToRoot.startsWith('..') || isAbsolute(relToRoot)) {
      throw new BadRequestException('Invalid storage path');
    }

    try {
      await access(absolute);
    } catch {
      throw new NotFoundException('File not found on disk');
    }

    return {
      stream: createReadStream(absolute),
      fileName: doc.originalFileName,
      mimeType: doc.mimeType,
    };
  }

  private assertApplicantMayUpload(status: ApplicationStatus): void {
    const allowed: ApplicationStatus[] = [
      ApplicationStatus.DRAFT,
      ApplicationStatus.INFO_REQUESTED,
      ApplicationStatus.RESUBMITTED,
    ];
    if (!allowed.includes(status)) {
      throw new UnprocessableEntityException(
        'Documents can only be uploaded while application is DRAFT, INFO_REQUESTED, or RESUBMITTED',
      );
    }
  }

  async attachDocument(params: {
    applicationId: string;
    uploaderId: string;
    uploaderRole: Role;
    expectedVersion: number;
    type: DocumentType;
    logicalKey: string;
    file: Express.Multer.File;
  }) {
    const { applicationId, uploaderId, uploaderRole, expectedVersion, type, logicalKey, file } =
      params;

    if (uploaderRole !== Role.APPLICANT) {
      throw new ForbiddenException('Only applicants may upload documents');
    }

    const maxBytes = this.config.get<number>('MAX_UPLOAD_SIZE_BYTES', 5 * 1024 * 1024);
    if (file.size > maxBytes) {
      throw new UnprocessableEntityException(`File exceeds maximum size of ${maxBytes} bytes`);
    }

    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (application.applicantId !== uploaderId) {
      throw new ForbiddenException(
        'You do not have permission to upload documents for this application',
      );
    }
    this.assertApplicantMayUpload(application.status);

    const checksum = createHash('sha256').update(file.buffer).digest('hex');
    const relativeDir = join('applications', applicationId);
    const diskName = `${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const absoluteDir = join(this.uploadRoot(), relativeDir);
    const storagePath = join(relativeDir, diskName);

    await mkdir(absoluteDir, { recursive: true });
    const absolutePath = join(absoluteDir, diskName);

    try {
      await writeFile(absolutePath, file.buffer);
    } catch {
      throw new InternalServerErrorException('Failed to persist file');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const fresh = await tx.application.findUnique({ where: { id: applicationId } });
        if (!fresh) {
          throw new NotFoundException('Application not found');
        }
        if (fresh.version !== expectedVersion) {
          throw new ConflictException('Application version mismatch; refresh and retry');
        }
        if (fresh.applicantId !== uploaderId) {
          throw new ForbiddenException(
            'You do not have permission to upload documents for this application',
          );
        }
        this.assertApplicantMayUpload(fresh.status);

        const last = await tx.applicationDocument.findFirst({
          where: { applicationId, logicalKey },
          orderBy: { version: 'desc' },
        });
        const nextVersion = (last?.version ?? 0) + 1;

        const doc = await tx.applicationDocument.create({
          data: {
            applicationId,
            type,
            logicalKey,
            version: nextVersion,
            storagePath,
            originalFileName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            checksum,
            uploadedByUserId: uploaderId,
          },
        });

        await this.auditService.append(tx, {
          applicationId,
          actorUserId: uploaderId,
          action: AuditAction.DOCUMENT_UPLOADED,
          previousStatus: fresh.status,
          nextStatus: fresh.status,
          metadata: {
            documentId: doc.id,
            logicalKey,
            version: nextVersion,
            type,
          } as Prisma.InputJsonValue,
        });

        return this.toPublicDocument(doc);
      });
    } catch (err) {
      await unlink(absolutePath).catch(() => undefined);
      throw err;
    }
  }
}
