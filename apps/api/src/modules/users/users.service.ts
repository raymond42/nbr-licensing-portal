import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import type { Role } from '@nbr/shared';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmailWithCredentials(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  }

  async findActiveForJwt(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return { sub: user.id, email: user.email, role: user.role as Role };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
