import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenService } from './token';
import { ConfigModule } from '@nestjs/config';
import { AtStrategy, RtStrategy } from './strategies';
import { RtTokenService } from './encrypt';
import { JwtSignService, JwtVerifyService } from './jwt';
import { Mail0AuthModule, Mail0AuthService, MailConfig, MailModule, MailService } from '../mail';
import { BullService, QueueModule } from '../queue/bull';
import { RedisService } from '../redis';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 3000,
        limit: 3,
      },
    ]),
    JwtModule.register({}),
    ConfigModule,
    MailModule,
    Mail0AuthModule,
    QueueModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AuthService,
    JwtService,
    AtStrategy,
    RtStrategy,
    TokenService,
    RtTokenService,
    JwtSignService,
    JwtVerifyService,
    MailService,
    Mail0AuthService,
    MailConfig,
    BullService,
    RedisService,
  ],
})
export class AuthModule {}
