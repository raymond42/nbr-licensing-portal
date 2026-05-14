import { ForbiddenException } from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const guard = new JwtAuthGuard();

  it('returns the authenticated user', () => {
    const user = { sub: 'user-1' };

    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('returns 403 when passport does not provide a user', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(ForbiddenException);
  });

  it('preserves existing forbidden auth failures', () => {
    const error = new ForbiddenException('User not found or inactive');

    expect(() => guard.handleRequest(error, null)).toThrow(error);
  });
});
