import { Logger } from '@nestjs/common';
import { TokenUser } from '../../../auth/type';

export function logEnumPermission(requiredPermission: string, user: TokenUser) {
  if (!requiredPermission) {
    Logger.debug('fn:PermissionListGuard: No required permission specified.');
    return;
  }

  if (!user || !user.roleId || !user.permissionIds) {
    Logger.error(
      'fn:PermissionListGuard: User, roleId or permissionIds not found.',
    );
    return;
  }

  Logger.error(
    `fn:PermissionListGuard: Invalid permission: ${requiredPermission}`,
  );
}
