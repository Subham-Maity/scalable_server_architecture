import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtPayload, Tokens } from '../type';
import { ConfigId } from '../../types';
import { asyncErrorHandler } from '../../errors';

@Injectable()
export class TokenService {
  getTokens = asyncErrorHandler(
    async (
      userId: ConfigId,
      email: string,
      roleId: string,
      permissionIds: string[],
    ): Promise<Tokens> => {
      const jwtPayload: JwtPayload = {
        sub: userId,
        email: email,
        roleId: roleId,
        permissionIds: permissionIds,
      };
      const [at, rt] = await Promise.all([
        this.jwtService.signAsync(jwtPayload, {
          secret: this.config.get<string>('JWT_LOCAL_AT_SECRET'),
          expiresIn: this.config.get<string>('JWT_LOCAL_AT_EXPIRES_IN'),
        }),
        this.jwtService.signAsync(jwtPayload, {
          secret: this.config.get<string>('JWT_LOCAL_RT_SECRET'),
          expiresIn: this.config.get<string>('JWT_LOCAL_RT_EXPIRES_IN'),
        }),
      ]);
      return {
        access_token: at,
        refresh_token: rt,
      };
    },
  );

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
}
