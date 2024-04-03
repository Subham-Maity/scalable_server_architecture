// permission.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { parse } from 'path';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredPermission = this.derivePermissionFromRoute(request.method, request.route.path);

    if (!requiredPermission) {
      return true;
    }

    if (!user || !user.role || !user.role.permissions.includes(requiredPermission)) {
      return false;
    }

    return true;
  }

  derivePermissionFromRoute(method: string, path: string): string {
    const resourcePath = parse(path).dir.split('/').filter(Boolean).join('');
    const action = getActionFromMethod(method);

    return `${action}${resourcePath}`;
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
