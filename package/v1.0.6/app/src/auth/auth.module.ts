import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenService } from './token';
import { ConfigModule } from '@nestjs/config';
import { AtStrategy, RtStrategy } from './strategies';
import { RtTokenService } from './encrypt';
import { JwtSignService, JwtVerifyService } from './jwt';
import { MailModule, MailService } from '../mail';
import { Mail0AuthService } from '../mail/mail0Auth.service';
import { Mail0AuthModule } from '../mail/mail0Auth.module';
import { MailConfig } from '../mail/config';

@Module({
  imports: [JwtModule.register({}), ConfigModule, MailModule, Mail0AuthModule],
  controllers: [AuthController],
  providers: [
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
  ],
})
export class AuthModule {}
