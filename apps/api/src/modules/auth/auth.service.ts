import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import type { LoginResponseDto, RegisterApplicantResponseDto, Role } from '@nbr/shared';

import type { RegisterApplicantDto } from './dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import { UsersService } from '../users/users.service';

function parseJwtExpiresToSeconds(expiresIn: string): number {
  const s = expiresIn.trim();
  const m = /^(\d+)\s*([smhd])$/i.exec(s);
  if (m?.[1] && m[2]) {
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    const mult = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1;
    return n * mult;
  }
  const asNum = parseInt(s, 10);
  return Number.isFinite(asNum) ? asNum : 3600;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async registerApplicant(dto: RegisterApplicantDto): Promise<RegisterApplicantResponseDto> {
    return this.usersService.registerApplicant(dto);
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmailWithCredentials(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role as Role };
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '3600s');
    const accessToken = this.jwtService.sign(payload);

    const expiresInSeconds = parseJwtExpiresToSeconds(expiresIn);

    return {
      accessToken,
      expiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as Role,
      },
    };
  }
}
