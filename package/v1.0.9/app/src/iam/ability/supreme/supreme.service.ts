import { Injectable, NotFoundException } from '@nestjs/common';
import { Permission, Role } from '@prisma/client';
import { PrismaService } from '../../../prisma';

@Injectable()
export class SupremeService {
  constructor(private prisma: PrismaService) {}

  async getUserRole(
    roleId: string,
  ): Promise<(Role & { permissions: { permission: Permission }[] }) | null> {
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async setAdminRole(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'Admin' },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!adminRole) {
      throw new NotFoundException('Admin role not found');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { roleId: adminRole.id },
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
    });
  }
}
