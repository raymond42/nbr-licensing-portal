import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { Role } from '@nbr/shared';

import { parsePageTake } from '../../common/utils/pagination.util';
import { SWAGGER_JWT_AUTH } from '../../common/swagger.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/types/jwt-payload.type';
import { DocumentsService } from '../documents/documents.service';
import {
  ApplicationDocumentResponseDto,
  ApplicationResponseDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  UploadDocumentBodyDto,
  VersionedMutationDto,
  VersionedNoteDto,
} from './dto';
import { ApplicationsService } from './applications.service';

@ApiTags('applications')
@ApiBearerAuth(SWAGGER_JWT_AUTH)
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  private readonly maxUploadBytes: number;

  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly documentsService: DocumentsService,
    config: ConfigService,
  ) {
    this.maxUploadBytes = config.get<number>('MAX_UPLOAD_SIZE_BYTES', 5 * 1024 * 1024);
  }

  @Post()
  @Roles(Role.APPLICANT)
  @ApiOperation({ summary: 'Create a new application in DRAFT (applicant only)' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  create(@CurrentUser() user: RequestUser, @Body() body: CreateApplicationDto) {
    return this.applicationsService.create(
      user,
      body.institutionName,
      body.licenseCategory,
      body.description ?? '',
    );
  }

  @Get()
  @Roles(Role.APPLICANT, Role.REVIEWER, Role.APPROVER, Role.ADMIN)
  @ApiOperation({ summary: 'List applications visible to the caller (paginated)' })
  @ApiOkResponse({ description: 'Returns { items, total, page, take }' })
  list(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: string,
    @Query('take') take?: string,
  ) {
    const { page: p, take: t } = parsePageTake(page, take);
    return this.applicationsService.list(user, p, t);
  }

  @Get(':id/documents')
  @Roles(Role.APPLICANT, Role.REVIEWER, Role.APPROVER, Role.ADMIN)
  @ApiOperation({ summary: 'List documents for an application (metadata only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationDocumentResponseDto, isArray: true })
  listDocuments(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.documentsService.listForApplication(id, user);
  }

  @Get(':id/documents/:documentId/file')
  @Roles(Role.APPLICANT, Role.REVIEWER, Role.APPROVER, Role.ADMIN)
  @ApiOperation({ summary: 'Download document file' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiParam({ name: 'documentId', format: 'uuid' })
  async downloadDocument(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const { stream, fileName, mimeType } = await this.documentsService.openDownloadStream(
      applicationId,
      documentId,
      user,
    );
    return new StreamableFile(stream, {
      type: mimeType,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    });
  }

  @Get(':id')
  @Roles(Role.APPLICANT, Role.REVIEWER, Role.APPROVER, Role.ADMIN)
  @ApiOperation({ summary: 'Get one application by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.applicationsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.APPLICANT)
  @ApiOperation({
    summary:
      'Update fields (DRAFT: institution, category, description; INFO_REQUESTED: description only)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  updateDraft(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateApplicationDto,
  ) {
    const { expectedVersion, ...patch } = body;
    return this.applicationsService.updateDraft(id, user, expectedVersion, patch);
  }

  @Post(':id/submit')
  @Roles(Role.APPLICANT)
  @ApiOperation({ summary: 'DRAFT → SUBMITTED' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: VersionedMutationDto,
  ) {
    return this.applicationsService.submit(id, user, body.expectedVersion);
  }

  @Post(':id/start-review')
  @Roles(Role.REVIEWER)
  @ApiOperation({ summary: 'SUBMITTED → UNDER_REVIEW' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  startReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: VersionedMutationDto,
  ) {
    return this.applicationsService.startReview(id, user, body.expectedVersion);
  }

  @Post(':id/continue-review')
  @Roles(Role.REVIEWER)
  @ApiOperation({ summary: 'RESUBMITTED → UNDER_REVIEW' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  continueReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: VersionedMutationDto,
  ) {
    return this.applicationsService.continueReview(id, user, body.expectedVersion);
  }

  @Post(':id/request-info')
  @Roles(Role.REVIEWER)
  @ApiOperation({ summary: 'UNDER_REVIEW → INFO_REQUESTED' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  requestInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: VersionedNoteDto,
  ) {
    return this.applicationsService.requestInfo(id, user, body.expectedVersion, body.note);
  }

  @Post(':id/complete-review')
  @Roles(Role.REVIEWER)
  @ApiOperation({ summary: 'UNDER_REVIEW → REVIEW_COMPLETED' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  completeReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: VersionedNoteDto,
  ) {
    return this.applicationsService.completeReview(id, user, body.expectedVersion, body.note);
  }

  @Post(':id/resubmit')
  @Roles(Role.APPLICANT)
  @ApiOperation({ summary: 'INFO_REQUESTED → RESUBMITTED' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  resubmit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: VersionedMutationDto,
  ) {
    return this.applicationsService.resubmit(id, user, body.expectedVersion);
  }

  @Post(':id/approve')
  @Roles(Role.APPROVER)
  @ApiOperation({ summary: 'REVIEW_COMPLETED → APPROVED (403 if approver completed review)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: VersionedNoteDto,
  ) {
    return this.applicationsService.approve(id, user, body.expectedVersion, body.note);
  }

  @Post(':id/reject')
  @Roles(Role.APPROVER)
  @ApiOperation({ summary: 'REVIEW_COMPLETED → REJECTED' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: VersionedNoteDto,
  ) {
    return this.applicationsService.reject(id, user, body.expectedVersion, body.note);
  }

  @Post(':id/documents')
  @Roles(Role.APPLICANT)
  @ApiOperation({ summary: 'Upload a versioned document (multipart; max 5MB)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'type', 'logicalKey', 'expectedVersion'],
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', example: 'OTHER' },
        logicalKey: { type: 'string', example: 'supporting-doc-1' },
        expectedVersion: { type: 'integer', example: 0 },
      },
    },
  })
  @ApiOkResponse({ type: ApplicationDocumentResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadDocument(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: UploadDocumentBodyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('File is required');
    }
    if (file.size > this.maxUploadBytes) {
      throw new BadRequestException(`File exceeds maximum size of ${this.maxUploadBytes} bytes`);
    }
    return this.documentsService.attachDocument({
      applicationId,
      uploaderId: user.sub,
      uploaderRole: user.role,
      expectedVersion: body.expectedVersion,
      type: body.type,
      logicalKey: body.logicalKey,
      file,
    });
  }
}
