import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { ConfigId } from '../types';
import { asyncErrorHandler } from '../errors';

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
