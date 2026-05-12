import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Role } from '@nbr/shared';

import { parsePageTake } from '../../common/utils/pagination.util';
import { SWAGGER_JWT_AUTH } from '../../common/swagger.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { RequestUser } from '../../common/types/jwt-payload.type';
import { CreateUserBodyDto, UpdateUserBodyDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth(SWAGGER_JWT_AUTH)
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users (admin only, paginated)' })
  list(@Query('page') page?: string, @Query('take') take?: string) {
    const { page: p, take: t } = parsePageTake(page, take);
    return this.usersService.listAll(p, t);
  }

  @Get('me')
  @Roles(Role.APPLICANT, Role.REVIEWER, Role.APPROVER, Role.ADMIN)
  @ApiOperation({ summary: 'Current authenticated user profile' })
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.getProfile(user.sub);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a portal user (admin only)' })
  createUser(@Body() body: CreateUserBodyDto) {
    return this.usersService.adminCreateUser(body);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a portal user (admin only)' })
  updateUser(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserBodyDto,
  ) {
    return this.usersService.adminUpdateUser(user.sub, id, body);
  }
}
