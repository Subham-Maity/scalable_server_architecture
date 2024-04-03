// permissions.service.ts
import { Injectable } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { PrismaService } from '../../prisma';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async createPermission(name: string, action: string) {
    return this.prisma.permission.create({
      data: {
        name,
        action,
      },
    });
  }

  async getPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  async getPermissionIdByName(name: string): Promise<string> {
    const permission = await this.prisma.permission.findUnique({
      where: { name },
    });

    return permission?.id;
  }
}
