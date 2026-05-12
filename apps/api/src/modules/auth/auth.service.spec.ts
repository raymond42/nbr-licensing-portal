import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { Role } from '@nbr/shared';

import { AuthService } from './auth.service';
import type { UsersService } from '../users/users.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmailWithCredentials: jest.Mock; registerApplicant: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let configService: { get: jest.Mock };

  const activeUser = {
    id: 'user-1',
    email: 'applicant@example.com',
    fullName: 'Applicant User',
    role: Role.APPLICANT,
    isActive: true,
    passwordHash: 'hashed-password',
  };

  beforeEach(() => {
    usersService = {
      findByEmailWithCredentials: jest.fn(),
      registerApplicant: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };
    configService = { get: jest.fn().mockReturnValue('2h') };

    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns token, user profile, and parsed expiry for valid credentials', async () => {
    usersService.findByEmailWithCredentials.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(service.login('applicant@example.com', 'password')).resolves.toEqual({
      accessToken: 'signed-token',
      expiresInSeconds: 7200,
      user: {
        id: activeUser.id,
        email: activeUser.email,
        fullName: activeUser.fullName,
        role: Role.APPLICANT,
      },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: activeUser.id,
      email: activeUser.email,
      role: Role.APPLICANT,
    });
  });

  it('rejects unknown users without signing a token', async () => {
    usersService.findByEmailWithCredentials.mockResolvedValue(null);

    await expect(service.login('missing@example.com', 'password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('rejects invalid passwords', async () => {
    usersService.findByEmailWithCredentials.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login('applicant@example.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects inactive users', async () => {
    usersService.findByEmailWithCredentials.mockResolvedValue({ ...activeUser, isActive: false });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(service.login('applicant@example.com', 'password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('falls back to seconds and default expiry formats', async () => {
    usersService.findByEmailWithCredentials.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    configService.get.mockReturnValueOnce('900');
    await expect(service.login('applicant@example.com', 'password')).resolves.toMatchObject({
      expiresInSeconds: 900,
    });

    configService.get.mockReturnValueOnce('nonsense');
    await expect(service.login('applicant@example.com', 'password')).resolves.toMatchObject({
      expiresInSeconds: 3600,
    });
  });
});
