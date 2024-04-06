import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { logPermission } from './logger';
import { TokenUser } from '../../auth/type';
import { PrismaService } from '../../../prisma';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: TokenUser = request.user;
    const requiredPermission = this.derivePermissionFromRoute(request.method, request.route.path);

    if (!requiredPermission) {
      logPermission([], requiredPermission, user);
      return true;
    }

    if (!user || !user.roleId || !user.permissionIds) {
      logPermission([], requiredPermission, user);
      return false;
    }

    // Load the permissions from the database using the user's permissionIds
    const userPermissions = await this.prisma.permission.findMany({
      where: {
        id: { in: user.permissionIds },
      },
    });

    logPermission(userPermissions, requiredPermission, user);

    return userPermissions.some((p) => p.name === requiredPermission);
  }
  derivePermissionFromRoute(method: string, path: string): string {
    const action = getActionFromMethod(method);
    const resourceName = path.split('/').filter(Boolean).join('');
    return `${action}${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`;
  }
}

function getActionFromMethod(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'Read';
    case 'POST':
      return 'Create';
    case 'PUT':
    case 'PATCH':
      return 'Update';
    case 'DELETE':
      return 'Delete';
    default:
      return '';
  }
}
