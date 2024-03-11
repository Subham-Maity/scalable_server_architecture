import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { asyncErrorHandler } from '../errors/async-error-handler';
import { PasswordHash } from './hash';
import { TokenService } from './token';
import { Tokens } from './type';
import { RtTokenService } from './hash/rt-hash.service';

@Injectable()
export class AuthService {
  signupLocal = asyncErrorHandler(async (dto: AuthDto): Promise<Tokens> => {
    const hash = await PasswordHash.hashData(dto.password);
    //user created
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });
    //token created and returned
    const tokens = await this.tokenService.getTokens(user.id, user.email);
    //refresh token hash updated in the database
    await this.rtTokenService.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  });
  signinLocal = asyncErrorHandler(async (dto: AuthDto) => {
    //find user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //return error if user not found
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //verify password
    const passwordMatches = await PasswordHash.verifyPassword(user.hash, dto.password);

    //return error if password does not match
    if (!passwordMatches) throw new ForbiddenException('Password does not match');

    //token created and returned
    const tokens = await this.tokenService.getTokens(user.id, user.email);
    //refresh token hash updated in the database
    await this.rtTokenService.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  });
  logout = asyncErrorHandler(async (dto: AuthDto) => {
    console.log(dto);
  });
  refreshToken = asyncErrorHandler(async (dto: AuthDto) => {
    console.log(dto);
  });

  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private rtTokenService: RtTokenService,
  ) {}
}
