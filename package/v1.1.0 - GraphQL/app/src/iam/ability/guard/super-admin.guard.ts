import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SaEmailIpWhitelistConstant } from './list';
import { logSuperAdminCheck } from './logger';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private emailIpWhitelist: SaEmailIpWhitelistConstant) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the user's email is in the list of super-admin emails
    const isSuperAdmin = this.emailIpWhitelist.getSuperAdminEmails().includes(user.email);

    // Check if the request IP is in the whitelist
    const isIpWhitelisted = this.emailIpWhitelist.getSuperAdminIps().includes(request.ip);

    // Log the results
    logSuperAdminCheck(user.email, request.ip, isSuperAdmin, isIpWhitelisted);

    // The user is a super-admin if their email is in the super-admin list and their IP is in the whitelist
    return isSuperAdmin && isIpWhitelisted;
  }
}
