import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { DocumentsService } from './documents.service';

@Module({
  imports: [AuditModule],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
