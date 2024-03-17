import { Injectable } from '@nestjs/common';

import { EditUserDto } from './dto';
import { asyncErrorHandler, ConfigId, PrismaService } from '@app/common';

@Injectable()
export class UserService {
  editUser = asyncErrorHandler(async (userId: ConfigId, dto: EditUserDto) => {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;

    return user;
  });

  constructor(private prisma: PrismaService) {}
}
