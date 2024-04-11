import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../../prisma';
import { asyncErrorHandler } from '../../../../errors';

@Injectable()
export class RelationsService {
  constructor(private prisma: PrismaService) {}

  assignPermissionsToRole = asyncErrorHandler(
    async (roleId: string, permissionIds: string[]): Promise<Role> => {
      if (!roleId || permissionIds.length === 0) {
        throw new BadRequestException('Role ID and permissions are required.');
      }

      const permissions = permissionIds.map((permissionId) => ({
        permission: { connect: { id: permissionId } },
      }));

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('One or more permissions not found.');
      }

      return this.prisma.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            create: permissions,
          },
        },
        include: { permissions: true },
      });
    },
  );

  updatePermissionsForRole = asyncErrorHandler(
    async (roleId: string, permissionIds: string[]): Promise<Role> => {
      if (!roleId || permissionIds.length === 0) {
        throw new BadRequestException('Role ID and permissions are required.');
      }

      const permissions = permissionIds.map((permissionId) => ({
        permission: { connect: { id: permissionId } },
      }));

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('One or more permissions not found.');
      }

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
    },
  );

  removePermissionsFromRole = asyncErrorHandler(
    async (roleId: string, permissionIds: string[]): Promise<Role> => {
      if (!roleId || permissionIds.length === 0) {
        throw new BadRequestException('Role ID and permissions are required.');
      }

      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('One or more permissions not found.');
      }

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
    },
  );
}
