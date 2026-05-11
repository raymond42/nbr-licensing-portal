import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { WorkflowService } from './workflow.service';

@ApiTags('workflow')
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}
}
