import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = unknown>(err: unknown, user: TUser | false | null): TUser {
    if (err instanceof ForbiddenException) {
      throw err;
    }
    if (err || !user) {
      throw new ForbiddenException('Authentication required');
    }
    return user;
  }
}
