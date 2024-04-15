import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { CheckUserAuthService } from './check-user-auth.service';
import { RequestTypeDto } from './dto';
@ApiTags('🔐 Authentication')
@Controller('auth')
export class CheckUserAuthController {
  constructor(private checkUserAuth: CheckUserAuthService) {}
  @SkipThrottle()
  @Get('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: ' Check the current user',
    description:
      '* POST: http://localhost:3333/auth/check\n' +
      '     bearer token: {access token}\n' +
      '     }\n' +
      '     * Check the current user and return the user id.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'The user id has been successfully checked.',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized : No token provided.',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @UseGuards(AuthGuard('jwt'))
  checkUser(@Request() req: RequestTypeDto) {
    try {
      return this.checkUserAuth.checkUser(req);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An error occurred while checking the user.',
        );
      }
    }
  }
}
