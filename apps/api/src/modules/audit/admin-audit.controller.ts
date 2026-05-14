import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Role } from '@nbr/shared';

import { SWAGGER_JWT_AUTH } from '../../common/swagger.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/types/jwt-payload.type';
import { parsePageTake } from '../../common/utils/pagination.util';
import { AuditService } from './audit.service';

@ApiTags('admin-audit-logs')
@ApiBearerAuth(SWAGGER_JWT_AUTH)
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Paginated global audit log (admin only)' })
  list(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: string,
    @Query('take') take?: string,
  ) {
    const { page: p, take: t } = parsePageTake(page, take, { defaultTake: 10, maxTake: 10 });
    return this.auditService.listGlobal(user, p, t);
  }

  @Post('verify')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Verify integrity hashes for all audit rows that have them' })
  verify(@CurrentUser() user: RequestUser) {
    return this.auditService.verifyGlobalIntegrity(user);
  }
}
