import { SetMetadata } from '@nestjs/common';
import { Permissions } from '../constant/permission.constant';

export const RequirePermissions = (...permissions: Permissions[]) =>
  SetMetadata('permissions', permissions);
