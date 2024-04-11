import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma';

@Injectable()
export class CheckDeletedUserGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.email) {
      const dbUser = await this.prismaService.user.findUnique({ where: { email: user.email } });

      if (!dbUser || dbUser.deleted) {
        throw new UnauthorizedException('This account has been deleted.');
      }
    }

    return true;
  }
}
