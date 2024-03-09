import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { asyncErrorHandler } from '../errors/async-error-handler';
import { PasswordHash } from './hash';
import { TokenService } from './token';
import { Tokens } from './type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  signupLocal = asyncErrorHandler(async (dto: AuthDto): Promise<Tokens> => {
    const hash = await PasswordHash.hashData(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });
    return this.tokenService.signToken(user.id, user.email);
  });

  signinLocal = asyncErrorHandler(async (dto: AuthDto) => {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const match = await PasswordHash.verifyPassword(user.hash, dto.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.tokenService.signToken(user.id, user.email);
  });

  logout = asyncErrorHandler(async (dto: AuthDto) => {
    console.log(dto);
  });

  refreshToken = asyncErrorHandler(async (dto: AuthDto) => {
    console.log(dto);
  });
}
