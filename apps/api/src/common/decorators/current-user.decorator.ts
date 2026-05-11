import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { RequestUser } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return request.user;
  },
);
