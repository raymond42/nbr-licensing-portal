import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Role } from '@nbr/shared';

import { ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestUser } from '../types/jwt-payload.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Missing authenticated user');
    }
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }
    return true;
  }
}
