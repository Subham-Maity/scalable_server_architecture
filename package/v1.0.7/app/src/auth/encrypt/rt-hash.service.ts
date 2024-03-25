import { Injectable } from '@nestjs/common';
import { PasswordHash } from './hash.service';
import { ConfigId } from '../../types';
import { asyncErrorHandler } from '../../errors';
import { PrismaService } from '../../prisma';

@Injectable()
export class RtTokenService {
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

  constructor(private prisma: PrismaService) {}
}
