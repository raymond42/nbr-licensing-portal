import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SWAGGER_JWT_AUTH } from '../../common/swagger.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { RequestUser } from '../../common/types/jwt-payload.type';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth(SWAGGER_JWT_AUTH)
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Current authenticated user profile' })
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.getProfile(user.sub);
  }
}
