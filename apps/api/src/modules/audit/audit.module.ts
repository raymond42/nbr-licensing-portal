import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';
import { AdminAuditController } from './admin-audit.controller';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [AuthModule],
  controllers: [AuditController, AdminAuditController],
  providers: [AuditService, JwtAuthGuard, RolesGuard],
  exports: [AuditService],
})
export class AuditModule {}
