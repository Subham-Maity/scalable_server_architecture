import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { asyncErrorHandler } from '../errors/async-error-handler';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordHash } from './hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  signToken = asyncErrorHandler(async (userId: number, email: string) => {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = this.jwt.sign(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return { access_token: token };
  });

  signupLocal = asyncErrorHandler(async (dto: AuthDto) => {
    const hash = await PasswordHash.hashData(dto.password); // use the PasswordHash class
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });
    return this.signToken(user.id, user.email);
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
    const match = await PasswordHash.verifyPassword(user.hash, dto.password); // use the PasswordHash class
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signToken(user.id, user.email);
  });

  logout = asyncErrorHandler(async (dto: AuthDto) => {
    console.log(dto);
  });

  refreshToken = asyncErrorHandler(async (dto: AuthDto) => {
    console.log(dto);
  });
}
