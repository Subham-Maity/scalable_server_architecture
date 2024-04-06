import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenService } from './token';
import { ConfigModule } from '@nestjs/config';
import { AtStrategy, RtStrategy } from './strategies';
import { RtTokenService } from './encrypt';
import { JwtSignService, JwtVerifyService } from './jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Mail0AuthModule, Mail0AuthService, MailConfig, MailModule, MailService } from '../../mail';
import { BullService, QueueModule } from '../../queue/bull';
import { RedisService } from '../../redis';
import {
  CheckUserAuthController,
  CheckUserAuthService,
  PasswordController,
  PasswordService,
  SigninController,
  SigninService,
  SignoutController,
  SignoutService,
  SignupController,
  SignupService,
  TokenManageController,
  TokenManageService,
} from './features';

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
  controllers: [
    SignupController,
    SigninController,
    SignoutController,
    PasswordController,
    TokenManageController,
    CheckUserAuthController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    SignupService,
    SigninService,
    SignoutService,
    PasswordService,
    TokenManageService,
    CheckUserAuthService,
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
