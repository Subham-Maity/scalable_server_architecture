import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredPermission = this.derivePermissionFromRoute(request.method, request.route.path);
    console.log(JSON.stringify(request.method) + 'Method');
    console.log(JSON.stringify(request.route.path) + 'Path');
    console.log(JSON.stringify(user) + 'User');
    console.log(JSON.stringify(requiredPermission) + 'RequiredPermission');

    if (!requiredPermission) {
      return true;
    }

    if (!user || !user.roleId || !user.permissionIds) {
      return false;
    }

    // Load the permissions from the database using the user's permissionIds
    const userPermissions = await this.prisma.permission.findMany({
      where: {
        id: { in: user.permissionIds },
      },
    });

    console.log('userPermissions:', userPermissions);

    console.log('requiredPermission:', requiredPermission);

    return userPermissions.some((p) => p.name === requiredPermission);
  }
  derivePermissionFromRoute(method: string, path: string): string {
    const action = getActionFromMethod(method);
    const resourceName = path.split('/').filter(Boolean).join(''); // Remove the slash from the path
    return `${action}${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`; // Capitalize the first letter of the resource name
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
