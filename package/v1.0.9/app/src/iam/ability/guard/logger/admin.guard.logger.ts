import { Logger } from '@nestjs/common';

export function logAdminCheck(userEmail: string, isAdmin: boolean) {
  if (isAdmin) {
    Logger.debug(`fn:AdminGuard: User ${userEmail} is an admin.`);
  } else {
    Logger.warn(`fn:AdminGuard: User ${userEmail} is not an admin.`);
  }
}
