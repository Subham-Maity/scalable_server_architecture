import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../../prisma';
import { asyncErrorHandler } from '../../../../errors';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  createRole = asyncErrorHandler(async (name: string, description?: string): Promise<Role> => {
    if (!name) {
      throw new BadRequestException('Role name is required.');
    }

    return this.prisma.role.create({
      data: {
        name,
        description,
      },
    });
  });

  getRoles = asyncErrorHandler(async (): Promise<Role[]> => {
    return this.prisma.role.findMany();
  });

  getRoleById = asyncErrorHandler(async (id: string): Promise<Role | null> => {
    if (!id) {
      throw new BadRequestException('Invalid role ID.');
    }

    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    return role;
  });

  updateRoleName = asyncErrorHandler(
    async (id: string, name: string, description?: string): Promise<Role> => {
      if (!id || !name) {
        throw new BadRequestException('Role ID and name are required.');
      }

      const updatedRole = await this.prisma.role.update({
        where: { id },
        data: { name, description },
      });

      if (!updatedRole) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }

      return updatedRole;
    },
  );

  deleteRole = asyncErrorHandler(async (id: string): Promise<Role> => {
    const [, deletedRole] = await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      }),
      this.prisma.role.delete({
        where: { id },
      }),
    ]);

    return deletedRole;
  });
}
