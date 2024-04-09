import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { PrismaService } from '../../../../prisma';
import { UpdatePermissionDto, UserIdDto } from './dto';
import { asyncErrorHandler } from '../../../../errors';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  createPermission = asyncErrorHandler(
    async (name: string, action: string): Promise<Permission> => {
      if (!name || !action) {
        throw new BadRequestException('Name and action are required.');
      }

      return this.prisma.permission.create({
        data: {
          name,
          action,
        },
      });
    },
  );

  getPermissions = asyncErrorHandler(async (): Promise<Permission[]> => {
    return this.prisma.permission.findMany();
  });

  getPermissionById = asyncErrorHandler(async (id: UserIdDto): Promise<Permission | null> => {
    if (!id.id) {
      throw new BadRequestException('Invalid user ID.');
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: id.id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id.id} not found.`);
    }

    return permission;
  });

  getPermissionsByNames = asyncErrorHandler(async (names: string[]): Promise<Permission[]> => {
    if (names.length === 0) {
      throw new BadRequestException('At least one permission name is required.');
    }

    return this.prisma.permission.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });
  });

  updatePermissionById = asyncErrorHandler(
    async (id: UserIdDto, data: UpdatePermissionDto): Promise<Permission> => {
      if (!data.name || !data.action) {
        throw new BadRequestException('Name and action are required.');
      }

      const permission = await this.prisma.permission.update({
        where: { id: id.id },
        data: {
          name: data.name,
          action: data.action,
        },
      });

      if (!permission) {
        throw new NotFoundException(`Permission with ID ${id.id} not found.`);
      }

      return permission;
    },
  );

  deletePermissionById = asyncErrorHandler(async (id: UserIdDto): Promise<void> => {
    if (!id.id) {
      throw new BadRequestException('Invalid user ID.');
    }
    const permission = await this.prisma.permission.delete({
      where: { id: id.id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id.id} not found.`);
    }
  });
}
