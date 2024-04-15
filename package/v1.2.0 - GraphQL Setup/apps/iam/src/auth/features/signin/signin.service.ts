import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { TokenService } from '../../token';
import { PasswordHash, RtTokenService } from '../../encrypt';

import { SigninDto } from './dto';
import { cookieOptionsAt, cookieOptionsRt, setCookie } from '../../../common';
import { GeoService } from '../../../geo/geo.service';
import { BullService } from '../../../queue/bull';
import { PrismaService } from '../../../../../../prisma';

@Injectable()
export class SigninService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private rtTokenService: RtTokenService,
    private readonly geoService: GeoService,
    private readonly queueService: BullService,
  ) {}

  //Use in Singing
  checkIfUserDeletedByEmail = async (email: string) => {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
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
    //I have removed the comment,
    // so it will not check if the deleted user is going to log in or not if you wish to do that
    if (user.deleted) {
      throw new UnauthorizedException('This account has been deleted.');
    }
    return user;
  };
  /**SingIn/Login - Local*/

  async signinLocal(
    dto: SigninDto,
    res: Response,
    ip: string,
    userAgent: string,
    reason?: string,
  ): Promise<void> {
    //find user
    const user = await this.checkIfUserDeletedByEmail(dto.email);

    //verify password
    const passwordMatches = await PasswordHash.verifyPassword(
      user.hash,
      dto.password,
    );

    if (!passwordMatches)
      throw new ForbiddenException('Password does not match');

    let roleId = null;
    let permissionIds = [];

    // Get user's role and permissions if they exist
    if (user.role) {
      roleId = user.role.id;
      permissionIds = user.role.permissions.map(
        (permission) => permission.permissionId,
      );
    }

    //token created and returned
    const tokens = await this.tokenService.getTokens(
      user.id,
      user.email,
      roleId,
      permissionIds,
    );
    await this.rtTokenService.updateRtHash(user.id, tokens.refresh_token);
    //Log the geo
    await this.queueService.addGeoLogJob({
      ipAddress: ip,
      action: 'Login',
      userAgent,
      userId: null,
      email: dto.email,
      reason,
    });
    // Set tokens in cookies
    setCookie(res, 'access_token', tokens.access_token, cookieOptionsAt);
    setCookie(res, 'refresh_token', tokens.refresh_token, cookieOptionsRt);
  }
}
