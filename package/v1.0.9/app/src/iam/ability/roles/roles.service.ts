import { Injectable } from '@nestjs/common';

import { Role } from '@prisma/client';
import { PrismaService } from '../../../prisma';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(name: string, description?: string): Promise<Role> {
    return this.prisma.role.create({
      data: {
        name,
        description,
      },
    });
  }

  async getRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });
  }

  async updateRoleName(id: string, name: string, description?: string): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data: { name, description },
    });
  }

  async deleteRole(id: string): Promise<Role> {
    return this.prisma.role.delete({
      where: { id },
    });
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const permissions = permissionIds.map((permissionId) => ({
      permission: { connect: { id: permissionId } },
    }));

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          create: permissions,
        },
      },
      include: { permissions: true },
    });
  }

  async updatePermissionsForRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const permissions = permissionIds.map((permissionId) => ({
      permission: { connect: { id: permissionId } },
    }));

    const existingPermissions = await this.prisma.role
      .findUnique({
        where: { id: roleId },
        include: { permissions: true },
      })
      .then((role) =>
        role?.permissions.map((p) => ({
          id: p.id,
          permission: { disconnect: true },
        })),
      );

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          deleteMany: {
            id: {
              in: existingPermissions?.map((p) => p.id) || [],
            },
          },
          create: permissions,
        },
      },
      include: { permissions: true },
    });
  }

  async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<Role> {
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          deleteMany: {
            permissionId: {
              in: permissionIds,
            },
          },
        },
      },
      include: { permissions: true },
    });
  }
}
