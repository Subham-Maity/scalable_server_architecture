import { Logger } from '@nestjs/common';

export function logSuperAdminCheck(
  userEmail: string,
  userIp: string,
  isSuperAdmin: boolean,
  isIpWhitelisted: boolean,
) {
  if (isSuperAdmin) {
    Logger.debug(`fn:SuperAdminGuard: User ${userEmail} is a super admin.`);
  } else {
    Logger.warn(`fn:SuperAdminGuard: User ${userEmail} is not a super admin.`);
  }

  if (isIpWhitelisted) {
    Logger.debug(`fn:SuperAdminGuard: IP ${userIp} is whitelisted.`);
  } else {
    Logger.warn(`fn:SuperAdminGuard: IP ${userIp} is not whitelisted.`);
  }
}
