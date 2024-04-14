import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Response } from 'express';
import { TokenService } from '../../token';

import {
  auth_refresh_token_hash_key_prefix_for_redis,
  auth_refresh_token_hash_ttl_for_redis,
} from '../../constant';
import { PasswordHash } from '../../encrypt';
import { cookieOptionsAt, cookieOptionsRt, setCookie } from '../../../common';
import { RedisService } from '../../../redis';
import { PrismaService } from '../../../../../../prisma';
import { ConfigId } from '../../../common/type';

@Injectable()
export class TokenManageService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private readonly rtToken: RedisService,
  ) {}

  //use in refresh token
  getUserById = async (id: string) => {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deleted) {
      throw new UnauthorizedException('This account has been deleted.');
    }

    return user;
  };

  /**Refresh Token*/

  async refreshToken(
    userId: ConfigId,
    rt: string,
    res: Response,
  ): Promise<void> {
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    if (!rt) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Get the stored refresh token hash from Redis
    const storedRtHash = await this.rtToken.get(
      `${auth_refresh_token_hash_key_prefix_for_redis}${userId}`,
    );

    // Verify the refresh token
    const rtMatches = await PasswordHash.verifyPassword(storedRtHash, rt);

    // Return error if refresh token does not match
    if (!rtMatches)
      throw new ForbiddenException('Refresh token does not match');

    // Get user's role and permissions if they exist
    const user = await this.getUserById(userId);
    let roleId = null;
    let permissionIds = [];

    if (user.role) {
      roleId = user.role.id;
      permissionIds = user.role.permissions.map(
        (permission) => permission.permissionId,
      );
    }

    // Token created
    const tokens = await this.tokenService.getTokens(
      userId,
      user.email,
      roleId,
      permissionIds,
    );

    // Hash the new refresh token
    const hashedRefreshToken = await PasswordHash.hashRefreshToken(
      tokens.refresh_token,
    );

    // Store the new refresh token hash in Redis
    await this.rtToken.set(
      `${auth_refresh_token_hash_key_prefix_for_redis}${userId}`,
      hashedRefreshToken,
      auth_refresh_token_hash_ttl_for_redis,
    );

    // Set tokens in cookies
    setCookie(res, 'access_token', tokens.access_token, cookieOptionsAt);
    setCookie(res, 'refresh_token', tokens.refresh_token, cookieOptionsRt);
  }

  /**Blacklist Token*/
  //Multiple Users

  async blacklistRefreshTokens(emails: string[]): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { email: { in: emails } },
    });

    const foundIds = users.map((user) => user.id);
    const notFoundEmails = emails.filter(
      (email) => !users.some((user) => user.email === email),
    );

    if (notFoundEmails.length > 0) {
      throw new NotFoundException(
        `The following emails are not present in the database: ${notFoundEmails.join(', ')}`,
      );
    }

    // Delete the refresh token hashes from Redis
    await Promise.all(
      foundIds.map((userId) =>
        this.rtToken.del(
          `${auth_refresh_token_hash_key_prefix_for_redis}${userId}`,
        ),
      ),
    );
  }

  //Everyone
  async blacklistAllRefreshTokens(): Promise<void> {
    await this.rtToken.reset();
  }
}
