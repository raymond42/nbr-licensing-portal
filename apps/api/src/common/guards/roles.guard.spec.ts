import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '@nbr/shared';

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  const createContext = (user?: { sub: string; email: string; role: Role }) =>
    ({
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial ExecutionContext mock
    }) as any;

  it('allows when no roles required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(createContext({ sub: '1', email: 'a', role: Role.APPLICANT }))).toBe(
      true,
    );
  });

  it('allows matching role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.REVIEWER]);
    expect(guard.canActivate(createContext({ sub: '1', email: 'r', role: Role.REVIEWER }))).toBe(
      true,
    );
  });

  it('rejects missing user', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.REVIEWER]);
    expect(() => guard.canActivate(createContext(undefined))).toThrow(ForbiddenException);
  });

  it('rejects wrong role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.APPROVER]);
    expect(() =>
      guard.canActivate(createContext({ sub: '1', email: 'r', role: Role.REVIEWER })),
    ).toThrow(ForbiddenException);
  });
});
