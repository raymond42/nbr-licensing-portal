import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { Role } from '@nbr/shared';

import { SWAGGER_JWT_AUTH } from '../../common/swagger.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/types/jwt-payload.type';
import { AuditService } from './audit.service';

@ApiTags('audit-logs')
@ApiBearerAuth(SWAGGER_JWT_AUTH)
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get(':applicationId')
  @Roles(Role.APPLICANT, Role.REVIEWER, Role.APPROVER, Role.ADMIN)
  @ApiOperation({ summary: 'Immutable audit trail for an application (oldest first)' })
  @ApiParam({ name: 'applicationId', format: 'uuid' })
  listForApplication(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.auditService.listForApplication(applicationId, user);
  }
}
