import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './modules/common/common.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { UsersModule } from './modules/users/users.module';
import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    ApplicationsModule,
    WorkflowModule,
    AuditModule,
    DocumentsModule,
  ],
})
export class AppModule {}
