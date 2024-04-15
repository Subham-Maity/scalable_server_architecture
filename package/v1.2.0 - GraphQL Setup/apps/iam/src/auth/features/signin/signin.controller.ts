import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { SigninService } from './signin.service';

import { SigninDto } from './dto';
import { CheckUserExistsGuard } from '../../guard';
import { Public } from '../../../common';

@ApiTags('🔐 Authentication')
@Controller('auth')
export class SigninController {
  constructor(private signinService: SigninService) {}
  @Public()
  @SkipThrottle()
  // @Throttle({ default: { limit: 8, ttl: 120000 } })
  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in an existing user',
    description:
      'POST: http://localhost:3333/auth/local/signin\n' +
      '{\n' +
      '"email": "subham@gmail.com",\n' +
      '"password": "Codexam@123",\n' +
      '}',
  })
  @ApiBody({ type: SigninDto, description: 'The user credentials' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid data.',
    type: Error,
  })
  @ApiUnauthorizedResponse({
    status: 403,
    description: 'Unauthorized: Password does not match.',
    type: Error,
  })
  @ApiTooManyRequestsResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
    type: Error,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'INTERNAL_SERVER_ERROR.',
    type: Error,
  })
  @UseGuards(CheckUserExistsGuard)
  async signinLocal(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
    //For logout info - GEO
    @Req() req: Request,
    @Body('reason') reason?: string,
    @Ip() ip?: string,
  ): Promise<{ message: string }> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Invalid data.');
    }
    try {
      const userAgent = req.get('user-agent') || '';
      if (!ip || !userAgent) {
        throw new BadRequestException('Invalid IP address or user agent.');
      }
      await this.signinService.signinLocal(dto, res, ip, userAgent, reason);
      return { message: `${dto.email} login successful` };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          ' An error occurred while signing in the user.',
        );
      }
    }
  }
}
