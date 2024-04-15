import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import { Request, Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { SignoutService } from './signout.service';
import { GetCurrentUserId } from '../../decorator';
import { LogoutDto } from './dto';
import { Ip } from '@nestjs/common';
import { ConfigId } from '../../../common/type';
@ApiTags('🔐 Authentication')
@Controller('auth')
export class SignoutController {
  constructor(private signOut: SignoutService) {}

  @SkipThrottle()
  @Post('/local/signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign out the current user',
    description:
      'POST: http://localhost:3333/auth/local/signou' +
      'bearer token: {access token}}' +
      'It will set the `refreshTokenHash` to null in the database.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully signed out.',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized: No token provided.',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  async logout(
    @GetCurrentUserId() userId: ConfigId,
    @Res({ passthrough: true }) res: Response,
    //For logout info - GEO
    @Req() req: Request,
    @Body('reason') reason?: string,
    @Ip() ip?: string,
  ): Promise<{ message: string }> {
    try {
      if (!userId) {
        throw new BadRequestException('Invalid user ID.');
      }
      const userAgent = req.get('user-agent') || '';
      if (!ip || !userAgent) {
        throw new BadRequestException('Invalid IP address or user agent.');
      }
      await this.signOut.signoutLocal(userId, res, ip, userAgent, reason);
      return { message: 'User signed out successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An error occurred while signing out the user.',
        );
      }
    }
  }
}
