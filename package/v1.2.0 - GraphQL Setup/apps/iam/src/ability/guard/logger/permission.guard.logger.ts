import { Logger } from '@nestjs/common';
import { TokenUser } from '../../../auth/type';

export function logPermission(
  userPermissions: { name: string }[],
  requiredPermission: string,
  user: TokenUser,
) {
  if (!requiredPermission) {
    Logger.debug('fn:PermissionGuard: No required permission specified.');
    return;
  }

  if (!user || !user.roleId || !user.permissionIds) {
    Logger.error(
      'fn:PermissionGuard: User, roleId or permissionIds not found.',
    );
    return;
  }

  const matchingPermission = userPermissions.find(
    (permission) => permission.name === requiredPermission,
  );

  if (matchingPermission) {
    Logger.debug(`fn:PermissionGuard: This person can access this route ✓`);
    Logger.verbose(
      `fn:PermissionGuard: Required permission was: ${requiredPermission} and user has this permission: ${matchingPermission.name}`,
    );
  } else {
    Logger.error(
      `fn:PermissionGuard: User can't access this route because required permission was: ${requiredPermission} and user does not have a matching permission.`,
    );
  }
}
