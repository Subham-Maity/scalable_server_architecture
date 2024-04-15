import { Injectable, NotFoundException } from '@nestjs/common';
import { SetAdminDto, AssignRoleDto } from './dto';
import { PrismaService } from '../../../../../../prisma';

@Injectable()
export class SupremeService {
  constructor(private prisma: PrismaService) {}

  async setAdminRole(dto: SetAdminDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${dto.email} not found`);
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

    await this.prisma.user.update({
      where: { id: user.id },
      data: { roleId: adminRole.id },
    });
  }

  async assignRoleToUser(dto: AssignRoleDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
    }

    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { roleId: role.id },
    });
  }
}
