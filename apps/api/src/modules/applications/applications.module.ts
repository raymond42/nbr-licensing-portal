import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { DocumentsModule } from '../documents/documents.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  imports: [AuthModule, WorkflowModule, AuditModule, DocumentsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, JwtAuthGuard, RolesGuard],
})
export class ApplicationsModule {}
