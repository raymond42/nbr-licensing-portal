import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, Role as PrismaRole } from '@prisma/client';

import type { Role } from '@nbr/shared';

import { PrismaService } from '../../prisma/prisma.service';

import type { CreateUserBodyDto } from './dto/create-user.dto';
import type { UpdateUserBodyDto } from './dto/update-user.dto';

const BCRYPT_COST = 12;

const userListSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

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

  listAll(page: number, take: number) {
    const skip = page * take;
    return Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        select: userListSelect,
      }),
      this.prisma.user.count(),
    ]).then(([items, total]) => ({ items, total, page, take }));
  }

  async registerApplicant(dto: { fullName: string; email: string; password: string }) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    return this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName.trim(),
        role: PrismaRole.APPLICANT,
        passwordHash,
        isActive: false,
      },
      select: { id: true, email: true, fullName: true },
    });
  }

  async adminCreateUser(dto: CreateUserBodyDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    return this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName.trim(),
        role: dto.role,
        passwordHash,
        isActive: true,
      },
      select: userListSelect,
    });
  }

  async adminUpdateUser(actorUserId: string, targetUserId: string, dto: UpdateUserBodyDto) {
    if (targetUserId === actorUserId && dto.isActive === false) {
      throw new ForbiddenException('You cannot deactivate your own administrator account');
    }
    try {
      return await this.prisma.user.update({
        where: { id: targetUserId },
        data: {
          ...(dto.fullName !== undefined ? { fullName: dto.fullName.trim() } : {}),
          ...(dto.role !== undefined ? { role: dto.role } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
        select: userListSelect,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }
}
