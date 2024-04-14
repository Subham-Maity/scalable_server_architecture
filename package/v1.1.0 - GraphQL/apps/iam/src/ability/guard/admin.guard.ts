import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { logAdminCheck } from './logger';
import { TokenUser } from '../../auth/type';
import { PrismaService } from '../../../../../prisma';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: TokenUser = request.user;

    if (!user || !user.roleId) {
      logAdminCheck(user.email, false);
      return false;
    }

    // Load the role from the database using the user's roleId
    const userRole = await this.prisma.role.findUnique({
      where: {
        id: user.roleId,
      },
    });

    const isAdmin = userRole?.name === 'Admin';

    // Log the result
    logAdminCheck(user.email, isAdmin);

    return isAdmin;
  }
}
