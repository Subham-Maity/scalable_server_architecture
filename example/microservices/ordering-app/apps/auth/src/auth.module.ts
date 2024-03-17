import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RtTokenService } from './encrypt';
import { AtStrategy, RtStrategy } from './strategies';
import { TokenService } from './token';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AtStrategy, RtStrategy, TokenService, RtTokenService],
})
export class AuthModule {}
