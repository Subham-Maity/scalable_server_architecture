import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Permissions } from './list/permissions-list';
import { logEnumPermission } from './logger/permission-list.guard.logger';

type Permission = (typeof Permissions)[keyof typeof Permissions];
@Injectable()
export class PermissionListGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredPermission = this.derivePermissionFromRoute(request.method, request.route.path);

    if (
      !requiredPermission ||
      !Object.values(Permissions).includes(requiredPermission as Permission)
    ) {
      logEnumPermission(requiredPermission, user);
      throw new BadRequestException(`Invalid permission: ${requiredPermission}`);
    }

    return true;
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
