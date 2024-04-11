import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma';

@Injectable()
export class CheckUniqueEmailGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const dto = request.body;

    if (dto && dto.email) {
      const existUser = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });

      if (existUser) {
        throw new BadRequestException('User already exists with this email!');
      }
    }

    return true;
  }
}
