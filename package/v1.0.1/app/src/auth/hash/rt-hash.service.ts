import { Injectable } from '@nestjs/common';
import { asyncErrorHandler } from '../../errors/async-error-handler';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigId } from '../../types/configId';
import { PasswordHash } from './hash.service';

@Injectable()
export class RtTokenService {
  constructor(private prisma: PrismaService) {}

  updateRtHash = asyncErrorHandler(async (userId: ConfigId, rt: string): Promise<void> => {
    const hash = await PasswordHash.hashRefreshToken(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: hash,
      },
    });
  });
}
