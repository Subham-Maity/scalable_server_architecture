import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { asyncErrorHandler } from '../../errors/async-error-handler';
import { JwtPayload, Tokens } from '../type';
import { ConfigId } from '../../types';

@Injectable()
export class TokenService {
  getTokens = asyncErrorHandler(async (userId: ConfigId, email: string): Promise<Tokens> => {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_LOCAL_AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_LOCAL_RT_SECRET'),
        expiresIn: '15d',
      }),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  });

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
}
